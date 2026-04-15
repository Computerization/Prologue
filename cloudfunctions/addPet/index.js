const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

const DEFAULT_STATUS = '可领养'
const DEFAULT_GENDER = '未知'

exports.main = async (event, context) => {
  const openid = cloud.getWXContext().OPENID

  try {
    const userRes = await db.collection('users').where({ _openid: openid }).get()
    if (userRes.data.length === 0 || !userRes.data[0].isAdmin) {
      return { success: false, message: '无权限' }
    }

    const { name, species, breed, age, gender, description, status, photos } = event

    const result = await db.collection('pets').add({
      data: {
        name,
        species,
        breed: breed || '',
        age: age || '',
        gender: gender || DEFAULT_GENDER,
        description: description || '',
        status: status || DEFAULT_STATUS,
        photos: photos || [],
        createdAt: db.serverDate()
      }
    })

    return { success: true, _id: result._id }
  } catch (err) {
    return { success: false, error: err }
  }
}
