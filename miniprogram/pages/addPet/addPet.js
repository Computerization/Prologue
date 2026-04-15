const app = getApp()
const petService = require('../../services/petService')
const { showToast } = require('../../utils/util')
const { PetStatus, Species, Gender, MaxPhotos, NavigateBackDelay } = require('../../utils/constants')

Page({
  data: {
    form: {
      name: '',
      species: Species.CAT,
      breed: '',
      age: '',
      gender: Gender.UNKNOWN,
      description: '',
      status: PetStatus.AVAILABLE,
      photos: []
    },
    statusOptions: [PetStatus.AVAILABLE, PetStatus.RESERVED, PetStatus.ADOPTED],
    statusIndex: 0,
    isEdit: false,
    editId: '',
    submitting: false,
    species: Species,
    gender: Gender,
    maxPhotos: MaxPhotos
  },

  onLoad: function (options) {
    if (!app.globalData.isAdmin) {
      showToast('无管理员权限')
      setTimeout(() => wx.navigateBack(), NavigateBackDelay)
      return
    }

    if (options.edit === 'true' && options.id) {
      this.setData({ isEdit: true, editId: options.id })
      wx.setNavigationBarTitle({ title: '编辑宠物' })
      this.loadPet(options.id)
    }
  },

  loadPet: function (id) {
    petService.loadPet(id).then(pet => {
      this.setData({
        form: {
          name: pet.name,
          species: pet.species,
          breed: pet.breed || '',
          age: pet.age || '',
          gender: pet.gender || Gender.UNKNOWN,
          description: pet.description || '',
          status: pet.status || PetStatus.AVAILABLE,
          photos: pet.photos || []
        },
        statusIndex: this.data.statusOptions.indexOf(pet.status || PetStatus.AVAILABLE)
      })
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
    this.setData({ statusIndex: index, 'form.status': this.data.statusOptions[index] })
  },

  chooseImage: function () {
    const remaining = MaxPhotos - this.data.form.photos.length
    wx.chooseImage({
      count: remaining,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        petService.uploadPhotos(res.tempFilePaths).then(newPhotos => {
          this.setData({ 'form.photos': this.data.form.photos.concat(newPhotos) })
        })
      }
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

    petService.savePet(data, isEdit).then(() => {
      this.setData({ submitting: false })
    }).catch(() => {
      this.setData({ submitting: false })
    })
  }
})
