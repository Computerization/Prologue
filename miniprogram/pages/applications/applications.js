const app = getApp()
const applicationService = require('../../services/applicationService')
const { ApplicationStatus } = require('../../utils/constants')

Page({
  data: {
    applications: [],
    filteredApps: [],
    currentFilter: 'all',
    totalCount: 0,
    pendingCount: 0,
    isAdmin: false,
    loading: true,
    appStatus: ApplicationStatus
  },

  onLoad: function () {
    this.setData({ isAdmin: app.globalData.isAdmin })
  },

  onShow: function () {
    this.loadApplications()
  },

  loadApplications: function () {
    this.setData({ loading: true })
    const isAdmin = app.globalData.isAdmin

    const loadFn = isAdmin ? applicationService.loadAllApplications : applicationService.loadMyApplications
    loadFn().then(applications => {
      this.setData({
        applications,
        totalCount: applications.length,
        pendingCount: applications.filter(application => application.status === ApplicationStatus.PENDING).length,
        loading: false
      })
      this.filterApps()
    }).catch(() => {
      this.setData({ loading: false })
    })
  },

  onFilter: function (e) {
    this.setData({ currentFilter: e.currentTarget.dataset.filter })
    this.filterApps()
  },

  filterApps: function () {
    const { applications, currentFilter } = this.data
    const filtered = currentFilter === 'all'
      ? applications
      : applications.filter(application => application.status === currentFilter)
    this.setData({ filteredApps: filtered })
  },

  reviewApp: function (e) {
    const { id, petid, action } = e.currentTarget.dataset
    applicationService.confirmReview(action).then(({ status }) => {
      return applicationService.reviewApplication(id, petid, status)
    }).then(() => {
      this.loadApplications()
    }).catch(() => {})
  },

  goPetDetail: function (e) {
    const id = e.currentTarget.dataset.id
    if (id) {
      wx.navigateTo({ url: '/pages/detail/detail?id=' + id })
    }
  }
})
