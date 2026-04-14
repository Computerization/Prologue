const app = getApp()
const db = wx.cloud.database()
const { formatTime, showLoading, hideLoading, showToast } = require('../../utils/util')

Page({
  data: {
    applications: [],
    filteredApps: [],
    currentFilter: 'all',
    totalCount: 0,
    pendingCount: 0,
    isAdmin: false,
    loading: true
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

    let query = {}
    if (!isAdmin) {
      query = { _openid: app.globalData.openid }
    }

    wx.cloud.callFunction({
      name: isAdmin ? 'getApplications' : 'getMyApplications',
      data: {},
      success: res => {
        const apps = (res.result.data || []).map(item => {
          item.formattedTime = item.createdAt ? formatTime(new Date(item.createdAt)) : ''
          return item
        })
        this.setData({
          applications: apps,
          totalCount: apps.length,
          pendingCount: apps.filter(a => a.status === '待审核').length,
          loading: false
        })
        this.filterApps()
      },
      fail: () => {
        this.setData({ loading: false })
      }
    })
  },

  onFilter: function (e) {
    this.setData({ currentFilter: e.currentTarget.dataset.filter })
    this.filterApps()
  },

  filterApps: function () {
    const { applications, currentFilter } = this.data
    let filtered = applications
    if (currentFilter !== 'all') {
      filtered = applications.filter(a => a.status === currentFilter)
    }
    this.setData({ filteredApps: filtered })
  },

  reviewApp: function (e) {
    const { id, petid, action } = e.currentTarget.dataset
    const status = action === 'approve' ? '已通过' : '已拒绝'

    wx.showModal({
      title: '确认操作',
      content: '确定要' + (action === 'approve' ? '通过' : '拒绝') + '这条申请吗？',
      success: res => {
        if (res.confirm) {
          showLoading('处理中')
          wx.cloud.callFunction({
            name: 'reviewApplication',
            data: { applicationId: id, petId: petid, status },
            success: () => {
              hideLoading()
              showToast('操作成功')
              this.loadApplications()
            },
            fail: () => {
              hideLoading()
              showToast('操作失败')
            }
          })
        }
      }
    })
  },

  goPetDetail: function (e) {
    const id = e.currentTarget.dataset.id
    if (id) {
      wx.navigateTo({ url: '/pages/detail/detail?id=' + id })
    }
  }
})
