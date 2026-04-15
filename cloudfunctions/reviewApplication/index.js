const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

const APP_STATUS_APPROVED = '已通过'
const PET_STATUS_ADOPTED = '已领养'

exports.main = async (event, context) => {
  const openid = cloud.getWXContext().OPENID

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

    if (status === APP_STATUS_APPROVED && petId) {
      await db.collection('pets').doc(petId).update({
        data: { status: PET_STATUS_ADOPTED }
      })
    }

    return { success: true }
  } catch (err) {
    return { success: false, error: err }
  }
}
