const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

const QUERY_LIMIT = 50

exports.main = async (event, context) => {
  const openid = cloud.getWXContext().OPENID

  try {
    const res = await db.collection('applications')
      .where({ _openid: openid })
      .orderBy('createdAt', 'desc')
      .limit(QUERY_LIMIT)
      .get()

    return { success: true, data: res.data }
  } catch (err) {
    return { success: false, error: err }
  }
}
