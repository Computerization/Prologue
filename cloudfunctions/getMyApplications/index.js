const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  try {
    const res = await db.collection('applications')
      .where({ _openid: openid })
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get()

    return { success: true, data: res.data }
  } catch (err) {
    return { success: false, error: err }
  }
}
