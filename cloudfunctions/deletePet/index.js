const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const openid = cloud.getWXContext().OPENID

  try {
    const userRes = await db.collection('users').where({ _openid: openid }).get()
    if (userRes.data.length === 0 || !userRes.data[0].isAdmin) {
      return { success: false, message: '无权限' }
    }

    await db.collection('pets').doc(event.id).remove()

    return { success: true }
  } catch (err) {
    return { success: false, error: err }
  }
}
