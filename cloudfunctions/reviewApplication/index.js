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

    const { applicationId, petId, status } = event

    await db.collection('applications').doc(applicationId).update({
      data: {
        status,
        reviewedAt: db.serverDate()
      }
    })

    if (status === '已通过' && petId) {
      await db.collection('pets').doc(petId).update({
        data: { status: '已领养' }
      })
    }

    return { success: true }
  } catch (err) {
    return { success: false, error: err }
  }
}
