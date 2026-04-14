const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  try {
    const userRes = await db.collection('users').where({ _openid: openid }).get()
    if (userRes.data.length === 0 || !userRes.data[0].isAdmin) {
      return { success: false, message: '无权限' }
    }

    const res = await db.collection('applications')
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get()

    return { success: true, data: res.data }
  } catch (err) {
    return { success: false, error: err }
  }
}
