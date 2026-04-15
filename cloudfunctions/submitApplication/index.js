const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

const PET_STATUS_AVAILABLE = '可领养'
const APP_STATUS_PENDING = '待审核'
const APP_STATUS_APPROVED = '已通过'
const PET_STATUS_ADOPTED = '已领养'
const QUERY_LIMIT = 50

exports.main = async (event, context) => {
  const openid = cloud.getWXContext().OPENID

  try {
    const { petId, petName, applicantName, phone, address, experience, reason } = event

    const petRes = await db.collection('pets').doc(petId).get()
    if (!petRes.data || petRes.data.status !== PET_STATUS_AVAILABLE) {
      return { success: false, message: '该宠物暂不可领养' }
    }

    const existingApp = await db.collection('applications').where({
      _openid: openid,
      petId: petId,
      status: db.command.in([APP_STATUS_PENDING, APP_STATUS_APPROVED])
    }).get()

    if (existingApp.data.length > 0) {
      return { success: false, message: '您已提交过申请' }
    }

    const result = await db.collection('applications').add({
      data: {
        _openid: openid,
        petId,
        petName,
        applicantName,
        phone,
        address,
        experience: experience || '',
        reason,
        status: APP_STATUS_PENDING,
        createdAt: db.serverDate()
      }
    })

    return { success: true, _id: result._id }
  } catch (err) {
    return { success: false, error: err }
  }
}
