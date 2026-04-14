const app = getApp()
const db = wx.cloud.database()
const { showLoading, hideLoading, showToast } = require('../../utils/util')

Page({
  data: {
    form: {
      name: '',
      species: '猫',
      breed: '',
      age: '',
      gender: '未知',
      description: '',
      status: '可领养',
      photos: []
    },
    statusOptions: ['可领养', '已预定', '已领养'],
    statusIndex: 0,
    isEdit: false,
    editId: '',
    submitting: false
  },

  onLoad: function (options) {
    if (options.edit === 'true' && options.id) {
      this.setData({ isEdit: true, editId: options.id })
      wx.setNavigationBarTitle({ title: '编辑宠物' })
      this.loadPet(options.id)
    }

    if (!app.globalData.isAdmin) {
      showToast('无管理员权限')
      setTimeout(() => wx.navigateBack(), 1500)
    }
  },

  loadPet: function (id) {
    showLoading('加载中')
    db.collection('pets').doc(id).get().then(res => {
      const pet = res.data
      this.setData({
        form: {
          name: pet.name,
          species: pet.species,
          breed: pet.breed || '',
          age: pet.age || '',
          gender: pet.gender || '未知',
          description: pet.description || '',
          status: pet.status || '可领养',
          photos: pet.photos || []
        },
        statusIndex: this.data.statusOptions.indexOf(pet.status || '可领养')
      })
      hideLoading()
    }).catch(() => {
      hideLoading()
      showToast('加载失败')
    })
  },

  onInput: function (e) {
    const field = e.currentTarget.dataset.field
    this.setData({ ['form.' + field]: e.detail.value })
  },

  pickSpecies: function (e) {
    this.setData({ 'form.species': e.currentTarget.dataset.value })
  },

  pickGender: function (e) {
    this.setData({ 'form.gender': e.currentTarget.dataset.value })
  },

  onStatusChange: function (e) {
    const index = e.detail.value
    this.setData({
      statusIndex: index,
      'form.status': this.data.statusOptions[index]
    })
  },

  chooseImage: function () {
    const count = 9 - this.data.form.photos.length
    wx.chooseImage({
      count,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        this.uploadImages(res.tempFilePaths)
      }
    })
  },

  uploadImages: function (filePaths) {
    showLoading('上传中')
    const uploadTasks = filePaths.map(filePath => {
      const cloudPath = 'pets/' + Date.now() + '_' + Math.random().toString(36).substr(2, 8) + filePath.match(/\.\w+$/)[0]
      return wx.cloud.uploadFile({
        cloudPath,
        filePath
      })
    })

    Promise.all(uploadTasks).then(results => {
      const newPhotos = results.map(r => r.fileID)
      this.setData({
        'form.photos': this.data.form.photos.concat(newPhotos)
      })
      hideLoading()
    }).catch(() => {
      hideLoading()
      showToast('上传失败')
    })
  },

  deletePhoto: function (e) {
    const index = e.currentTarget.dataset.index
    const photos = this.data.form.photos
    photos.splice(index, 1)
    this.setData({ 'form.photos': photos })
  },

  submit: function () {
    const { form, isEdit, editId } = this.data

    if (!form.name.trim()) {
      showToast('请输入宠物名字')
      return
    }
    if (!form.species) {
      showToast('请选择物种')
      return
    }

    this.setData({ submitting: true })
    showLoading(isEdit ? '保存中' : '添加中')

    const fnName = isEdit ? 'updatePet' : 'addPet'
    const data = {
      name: form.name.trim(),
      species: form.species,
      breed: form.breed.trim(),
      age: form.age.trim(),
      gender: form.gender,
      description: form.description.trim(),
      status: form.status,
      photos: form.photos
    }

    if (isEdit) {
      data.id = editId
    }

    wx.cloud.callFunction({
      name: fnName,
      data,
      success: () => {
        hideLoading()
        this.setData({ submitting: false })
        showToast(isEdit ? '修改成功' : '添加成功')
        setTimeout(() => wx.navigateBack(), 1500)
      },
      fail: err => {
        hideLoading()
        this.setData({ submitting: false })
        showToast('操作失败')
        console.error(err)
      }
    })
  }
})
