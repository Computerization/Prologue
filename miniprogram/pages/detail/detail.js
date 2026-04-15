const app = getApp()
const petService = require('../../services/petService')
const { PetStatus, NavigateBackDelay } = require('../../utils/constants')

Page({
  data: {
    pet: null,
    isAdmin: false,
    petStatus: PetStatus
  },

  onLoad: function (options) {
    this.setData({ isAdmin: app.globalData.isAdmin })
    if (options.id) {
      this.loadPet(options.id)
    }
  },

  onShow: function () {
    this.setData({ isAdmin: app.globalData.isAdmin })
  },

  loadPet: function (id) {
    petService.loadPet(id).then(pet => {
      this.setData({ pet })
      wx.setNavigationBarTitle({ title: pet.name || '宠物详情' })
    })
  },

  previewImage: function (e) {
    const current = e.currentTarget.dataset.src
    wx.previewImage({ current, urls: this.data.pet.photos })
  },

  goAdopt: function () {
    const pet = this.data.pet
    wx.navigateTo({ url: '/pages/adopt/adopt?id=' + pet._id + '&name=' + pet.name })
  },

  goEdit: function () {
    const pet = this.data.pet
    wx.navigateTo({ url: '/pages/addPet/addPet?id=' + pet._id + '&edit=true' })
  },

  deletePet: function () {
    const pet = this.data.pet
    petService.confirmDeletePet(pet.name).then(() => {
      return petService.deletePet(pet._id)
    }).then(() => {
      setTimeout(() => wx.navigateBack(), NavigateBackDelay)
    }).catch(() => {})
  }
})
