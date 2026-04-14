const app = getApp()
const db = wx.cloud.database()

Page({
  data: {
    pets: [],
    filteredPets: [],
    keyword: '',
    currentFilter: 'all',
    loading: true,
    isAdmin: false,
    emptyMessage: '暂无宠物信息'
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
    db.collection('pets').orderBy('createdAt', 'desc').get().then(res => {
      this.setData({
        pets: res.data,
        loading: false
      })
      this.filterPets()
    }).catch(err => {
      console.error('加载宠物列表失败', err)
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
    const filter = e.currentTarget.dataset.filter
    this.setData({ currentFilter: filter })
    this.filterPets()
  },

  filterPets: function () {
    let pets = this.data.pets
    const keyword = this.data.keyword.trim().toLowerCase()
    const filter = this.data.currentFilter

    if (filter === '可领养') {
      pets = pets.filter(p => p.status === '可领养')
    } else if (filter !== 'all') {
      pets = pets.filter(p => p.species === filter)
    }

    if (keyword) {
      pets = pets.filter(p =>
        (p.name && p.name.toLowerCase().includes(keyword)) ||
        (p.breed && p.breed.toLowerCase().includes(keyword)) ||
        (p.description && p.description.toLowerCase().includes(keyword))
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
