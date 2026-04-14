const app = getApp()
const { showLoading, hideLoading, showToast } = require('../../utils/util')

Page({
  data: {
    petId: '',
    petName: '',
    petPhoto: '',
    form: {
      name: '',
      phone: '',
      address: '',
      experience: '',
      reason: ''
    },
    submitting: false
  },

  onLoad: function (options) {
    this.setData({
      petId: options.id,
      petName: options.name || '',
      petPhoto: options.photo || '/images/default-pet.png'
    })
    wx.setNavigationBarTitle({ title: '领养 ' + (options.name || '') })
  },

  onInput: function (e) {
    const field = e.currentTarget.dataset.field
    this.setData({
      ['form.' + field]: e.detail.value
    })
  },

  submit: function () {
    const { form, petId, petName } = this.data

    if (!form.name.trim()) {
      showToast('请输入姓名')
      return
    }
    if (!form.phone.trim() || form.phone.length !== 11) {
      showToast('请输入正确的手机号')
      return
    }
    if (!form.address.trim()) {
      showToast('请输入住址')
      return
    }
    if (!form.reason.trim()) {
      showToast('请填写申请理由')
      return
    }

    this.setData({ submitting: true })
    showLoading('提交中')

    wx.cloud.callFunction({
      name: 'submitApplication',
      data: {
        petId,
        petName,
        applicantName: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        experience: form.experience.trim(),
        reason: form.reason.trim()
      },
      success: () => {
        hideLoading()
        this.setData({ submitting: false })
        wx.showModal({
          title: '🎉 提交成功',
          content: '您的领养申请已提交，我们会尽快审核，请耐心等待。',
          showCancel: false,
          success: () => {
            wx.navigateBack()
          }
        })
      },
      fail: err => {
        hideLoading()
        this.setData({ submitting: false })
        showToast('提交失败，请重试')
        console.error(err)
      }
    })
  }
})
