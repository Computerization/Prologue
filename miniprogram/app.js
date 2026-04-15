App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
      return
    }
    wx.cloud.init({
      traceUser: true
    })
    this.globalData = { userInfo: null, openid: null, isAdmin: false }
    this.login()
  },

  login: function () {
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        this.globalData.openid = res.result.openid
        this.loadUserInfo(res.result.openid)
      },
      fail: err => {
        console.error('登录失败', err)
      }
    })
  },

  loadUserInfo: function (openid) {
    const db = wx.cloud.database()
    db.collection('users').where({ _openid: openid }).get().then(userRes => {
      if (userRes.data.length > 0) {
        this.globalData.userInfo = userRes.data[0]
        this.globalData.isAdmin = userRes.data[0].isAdmin || false
      }
    }).catch(err => {
      console.error('加载用户信息失败', err)
    })
  },

  globalData: {
    userInfo: null,
    openid: null,
    isAdmin: false
  }
})
