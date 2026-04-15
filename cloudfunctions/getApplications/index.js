const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

const PET_STATUS_AVAILABLE = '可领养'
const APP_STATUS_PENDING = '待审核'
const APP_STATUS_APPROVED = '已通过'
const QUERY_LIMIT = 100

exports.main = async (event, context) => {
  const openid = cloud.getWXContext().OPENID

  try {
    const userRes = await db.collection('users').where({ _openid: openid }).get()
    if (userRes.data.length === 0 || !userRes.data[0].isAdmin) {
      return { success: false, message: '无权限' }
    }

    const res = await db.collection('applications')
      .orderBy('createdAt', 'desc')
      .limit(QUERY_LIMIT)
      .get()

    return { success: true, data: res.data }
  } catch (err) {
    return { success: false, error: err }
  }
}
