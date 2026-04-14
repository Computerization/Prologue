const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  try {
    const { petId, petName, applicantName, phone, address, experience, reason } = event

    const petRes = await db.collection('pets').doc(petId).get()
    if (!petRes.data || petRes.data.status !== '可领养') {
      return { success: false, message: '该宠物暂不可领养' }
    }

    const existingApp = await db.collection('applications').where({
      _openid: openid,
      petId: petId,
      status: _.in(['待审核', '已通过'])
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
        status: '待审核',
        createdAt: db.serverDate()
      }
    })

    return { success: true, _id: result._id }
  } catch (err) {
    return { success: false, error: err }
  }
}
