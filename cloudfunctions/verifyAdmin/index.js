const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  try {
    const { password } = event
    const adminPassword = 'apc2024'

    if (password !== adminPassword) {
      return { success: false, message: '密码错误' }
    }

    await db.collection('users').where({ _openid: openid }).update({
      data: { isAdmin: true }
    })

    return { success: true }
  } catch (err) {
    return { success: false, error: err }
  }
}
