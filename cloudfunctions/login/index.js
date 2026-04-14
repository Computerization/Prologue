const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  try {
    const userRes = await db.collection('users').where({ _openid: openid }).get()

    if (userRes.data.length === 0) {
      await db.collection('users').add({
        data: {
          _openid: openid,
          nickName: '',
          avatarUrl: '',
          isAdmin: false,
          createdAt: db.serverDate()
        }
      })
    }

    return {
      success: true,
      openid
    }
  } catch (err) {
    return {
      success: false,
      error: err
    }
  }
}
