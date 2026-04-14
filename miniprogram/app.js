App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
      return
    }
    wx.cloud.init({
      traceUser: true
    })
    this.globalData = {
      userInfo: null,
      openid: null,
      isAdmin: false,
      adminPassword: 'apc2024'
    }
    this.login()
  },

  login: function () {
    const db = wx.cloud.database()
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        this.globalData.openid = res.result.openid
        db.collection('users').where({
          _openid: res.result.openid
        }).get().then(userRes => {
          if (userRes.data.length > 0) {
            this.globalData.userInfo = userRes.data[0]
            this.globalData.isAdmin = userRes.data[0].isAdmin || false
          }
        })
      },
      fail: err => {
        console.error('登录失败', err)
      }
    })
  },

  checkAdmin: function () {
    return this.globalData.isAdmin
  },

  globalData: {
    userInfo: null,
    openid: null,
    isAdmin: false,
    adminPassword: 'apc2024'
  }
})
