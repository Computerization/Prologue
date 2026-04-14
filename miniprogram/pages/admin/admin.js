const app = getApp()
const db = wx.cloud.database()
const { showLoading, hideLoading, showToast } = require('../../utils/util')

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
      setTimeout(() => wx.switchTab({ url: '/pages/index/index' }), 1500)
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
    db.collection('pets').orderBy('createdAt', 'desc').get().then(res => {
      const pets = res.data
      this.setData({
        pets,
        'stats.totalPets': pets.length,
        'stats.availablePets': pets.filter(p => p.status === '可领养').length,
        loading: false
      })
    })
  },

  loadPendingApplications: function () {
    db.collection('applications').where({
      status: '待审核'
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
    wx.showModal({
      title: '确认删除',
      content: '确定要删除 ' + name + ' 吗？',
      confirmColor: '#ff4757',
      success: res => {
        if (res.confirm) {
          showLoading('删除中')
          wx.cloud.callFunction({
            name: 'deletePet',
            data: { id },
            success: () => {
              hideLoading()
              showToast('删除成功')
              this.loadData()
            },
            fail: () => {
              hideLoading()
              showToast('删除失败')
            }
          })
        }
      }
    })
  },

  reviewApp: function (e) {
    const { id, petid, action } = e.currentTarget.dataset
    const status = action === 'approve' ? '已通过' : '已拒绝'
    const tip = action === 'approve' ? '通过' : '拒绝'

    wx.showModal({
      title: '确认操作',
      content: '确定要' + tip + '这条申请吗？',
      success: res => {
        if (res.confirm) {
          showLoading('处理中')
          wx.cloud.callFunction({
            name: 'reviewApplication',
            data: { applicationId: id, petId: petid, status },
            success: () => {
              hideLoading()
              showToast('操作成功')
              this.loadData()
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

  goApplications: function () {
    wx.navigateTo({ url: '/pages/applications/applications' })
  }
})
