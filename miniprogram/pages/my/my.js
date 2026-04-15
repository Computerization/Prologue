const app = getApp()
const applicationService = require('../../services/applicationService')
const authService = require('../../services/authService')

Page({
  data: {
    userInfo: null,
    isAdmin: false,
    applications: [],
    loadingApps: true
  },

  onLoad: function () {
    this.setData({ isAdmin: app.globalData.isAdmin })
  },

  onShow: function () {
    this.setData({
      userInfo: app.globalData.userInfo,
      isAdmin: app.globalData.isAdmin
    })
    if (app.globalData.openid) {
      this.loadMyApplications()
    }
  },

  loadMyApplications: function () {
    this.setData({ loadingApps: true })
    applicationService.loadMyApplications().then(applications => {
      this.setData({ applications, loadingApps: false })
    }).catch(() => {
      this.setData({ loadingApps: false })
    })
  },

  showAdminLogin: function () {
    wx.showModal({
      title: '🔑 管理员验证',
      content: '请输入管理员密码',
      editable: true,
      placeholderText: '请输入密码',
      success: res => {
        if (res.confirm && res.content) {
          this.verifyAdmin(res.content.trim())
        }
      }
    })
  },

  verifyAdmin: function (password) {
    authService.verifyAdmin(password).then(result => {
      if (result.success) {
        wx.showToast({ title: '验证成功', icon: 'success' })
        app.globalData.isAdmin = true
        this.setData({ isAdmin: true })
      } else {
        wx.showToast({ title: '密码错误', icon: 'error' })
      }
    }).catch(() => {
      wx.showToast({ title: '验证失败', icon: 'error' })
    })
  },

  goMyApplications: function () {
    wx.navigateTo({ url: '/pages/applications/applications' })
  },

  goAdmin: function () {
    wx.navigateTo({ url: '/pages/admin/admin' })
  },

  goPetDetail: function (e) {
    const id = e.currentTarget.dataset.id
    if (id) {
      wx.navigateTo({ url: '/pages/detail/detail?id=' + id })
    }
  }
})
