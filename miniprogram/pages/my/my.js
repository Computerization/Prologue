const app = getApp()
const db = wx.cloud.database()
const { formatTime } = require('../../utils/util')

Page({
  data: {
    userInfo: null,
    isAdmin: false,
    applications: [],
    loadingApps: true
  },

  onLoad: function () {
    this.setData({
      isAdmin: app.globalData.isAdmin
    })
  },

  onShow: function () {
    const userInfo = app.globalData.userInfo
    this.setData({
      userInfo: userInfo,
      isAdmin: app.globalData.isAdmin
    })
    if (app.globalData.openid) {
      this.loadMyApplications()
    }
  },

  loadMyApplications: function () {
    this.setData({ loadingApps: true })
    wx.cloud.callFunction({
      name: 'getMyApplications',
      data: {},
      success: res => {
        const applications = (res.result.data || []).map(item => {
          item.formattedTime = item.createdAt ? formatTime(new Date(item.createdAt)) : ''
          return item
        })
        this.setData({
          applications,
          loadingApps: false
        })
      },
      fail: err => {
        console.error('加载申请记录失败', err)
        this.setData({ loadingApps: false })
      }
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
    wx.cloud.callFunction({
      name: 'verifyAdmin',
      data: { password },
      success: res => {
        if (res.result.success) {
          wx.showToast({ title: '验证成功', icon: 'success' })
          app.globalData.isAdmin = true
          this.setData({ isAdmin: true })
        } else {
          wx.showToast({ title: '密码错误', icon: 'error' })
        }
      },
      fail: () => {
        wx.showToast({ title: '验证失败', icon: 'error' })
      }
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
