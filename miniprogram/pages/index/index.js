const app = getApp()
const petService = require('../../services/petService')
const { PetStatus, Species } = require('../../utils/constants')

Page({
  data: {
    pets: [],
    filteredPets: [],
    keyword: '',
    currentFilter: 'all',
    loading: true,
    isAdmin: false,
    emptyMessage: '暂无宠物信息',
    species: Species,
    petStatus: PetStatus
  },

  onLoad: function () {
    this.loadPets()
  },

  onShow: function () {
    this.setData({ isAdmin: app.globalData.isAdmin })
    if (this.data.pets.length > 0) {
      this.loadPets()
    }
  },

  onPullDownRefresh: function () {
    this.loadPets()
    wx.stopPullDownRefresh()
  },

  loadPets: function () {
    this.setData({ loading: true })
    petService.loadPetList().then(pets => {
      this.setData({ pets, loading: false })
      this.filterPets()
    }).catch(() => {
      this.setData({ loading: false })
    })
  },

  onSearchInput: function (e) {
    this.setData({ keyword: e.detail.value })
    this.filterPets()
  },

  onSearch: function () {
    this.filterPets()
  },

  clearSearch: function () {
    this.setData({ keyword: '' })
    this.filterPets()
  },

  onFilter: function (e) {
    this.setData({ currentFilter: e.currentTarget.dataset.filter })
    this.filterPets()
  },

  filterPets: function () {
    let pets = this.data.pets
    const keyword = this.data.keyword.trim().toLowerCase()
    const filter = this.data.currentFilter

    if (filter === PetStatus.AVAILABLE) {
      pets = pets.filter(pet => pet.status === PetStatus.AVAILABLE)
    } else if (filter !== 'all') {
      pets = pets.filter(pet => pet.species === filter)
    }

    if (keyword) {
      pets = pets.filter(pet =>
        (pet.name && pet.name.toLowerCase().includes(keyword)) ||
        (pet.breed && pet.breed.toLowerCase().includes(keyword)) ||
        (pet.description && pet.description.toLowerCase().includes(keyword))
      )
    }

    this.setData({
      filteredPets: pets,
      emptyMessage: keyword ? '未找到匹配的宠物' : '暂无宠物信息'
    })
  },

  goAddPet: function () {
    wx.navigateTo({ url: '/pages/addPet/addPet' })
  }
})
