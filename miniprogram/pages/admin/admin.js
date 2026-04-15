const app = getApp()
const petService = require('../../services/petService')
const applicationService = require('../../services/applicationService')
const { showToast } = require('../../utils/util')
const { PetStatus, ApplicationStatus, NavigateBackDelay } = require('../../utils/constants')

Page({
  data: {
    pets: [],
    pendingApplications: [],
    stats: {
      totalPets: 0,
      availablePets: 0,
      pendingApps: 0
    },
    loading: true
  },

  onLoad: function () {
    if (!app.globalData.isAdmin) {
      showToast('无管理员权限')
      setTimeout(() => wx.switchTab({ url: '/pages/index/index' }), NavigateBackDelay)
      return
    }
  },

  onShow: function () {
    if (app.globalData.isAdmin) {
      this.loadData()
    }
  },

  loadData: function () {
    this.setData({ loading: true })
    this.loadPets()
    this.loadPendingApplications()
  },

  loadPets: function () {
    petService.loadPetList().then(pets => {
      this.setData({
        pets,
        'stats.totalPets': pets.length,
        'stats.availablePets': pets.filter(pet => pet.status === PetStatus.AVAILABLE).length,
        loading: false
      })
    })
  },

  loadPendingApplications: function () {
    const db = wx.cloud.database()
    db.collection('applications').where({
      status: ApplicationStatus.PENDING
    }).orderBy('createdAt', 'desc').get().then(res => {
      this.setData({
        pendingApplications: res.data,
        'stats.pendingApps': res.data.length
      })
    })
  },

  goAddPet: function () {
    wx.navigateTo({ url: '/pages/addPet/addPet' })
  },

  goDetail: function (e) {
    wx.navigateTo({ url: '/pages/detail/detail?id=' + e.currentTarget.dataset.id })
  },

  goEdit: function (e) {
    wx.navigateTo({ url: '/pages/addPet/addPet?id=' + e.currentTarget.dataset.id + '&edit=true' })
  },

  onDelete: function (e) {
    const { id, name } = e.currentTarget.dataset
    petService.confirmDeletePet(name).then(() => {
      return petService.deletePet(id)
    }).then(() => {
      this.loadData()
    }).catch(() => {})
  },

  reviewApp: function (e) {
    const { id, petid, action } = e.currentTarget.dataset
    applicationService.confirmReview(action).then(({ status }) => {
      return applicationService.reviewApplication(id, petid, status)
    }).then(() => {
      this.loadData()
    }).catch(() => {})
  },

  goApplications: function () {
    wx.navigateTo({ url: '/pages/applications/applications' })
  }
})
