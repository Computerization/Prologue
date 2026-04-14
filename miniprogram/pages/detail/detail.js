const app = getApp()
const db = wx.cloud.database()
const { showLoading, hideLoading, showToast } = require('../../utils/util')

Page({
  data: {
    pet: null,
    isAdmin: false
  },

  onLoad: function (options) {
    if (options.id) {
      this.loadPet(options.id)
    }
    this.setData({ isAdmin: app.globalData.isAdmin })
  },

  onShow: function () {
    this.setData({ isAdmin: app.globalData.isAdmin })
  },

  loadPet: function (id) {
    showLoading('加载中')
    db.collection('pets').doc(id).get().then(res => {
      this.setData({ pet: res.data })
      wx.setNavigationBarTitle({ title: res.data.name || '宠物详情' })
      hideLoading()
    }).catch(err => {
      hideLoading()
      showToast('加载失败')
      console.error(err)
    })
  },

  previewImage: function (e) {
    const current = e.currentTarget.dataset.src
    wx.previewImage({
      current,
      urls: this.data.pet.photos
    })
  },

  goAdopt: function () {
    const pet = this.data.pet
    wx.navigateTo({
      url: '/pages/adopt/adopt?id=' + pet._id + '&name=' + pet.name
    })
  },

  goEdit: function () {
    const pet = this.data.pet
    wx.navigateTo({
      url: '/pages/addPet/addPet?id=' + pet._id + '&edit=true'
    })
  },

  deletePet: function () {
    const pet = this.data.pet
    wx.showModal({
      title: '确认删除',
      content: '确定要删除 ' + pet.name + ' 吗？删除后不可恢复。',
      confirmColor: '#ff4757',
      success: res => {
        if (res.confirm) {
          showLoading('删除中')
          wx.cloud.callFunction({
            name: 'deletePet',
            data: { id: pet._id },
            success: () => {
              hideLoading()
              showToast('删除成功')
              setTimeout(() => wx.navigateBack(), 1500)
            },
            fail: err => {
              hideLoading()
              showToast('删除失败')
              console.error(err)
            }
          })
        }
      }
    })
  }
})
