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

    const { name, species, breed, age, gender, description, status, photos } = event

    const result = await db.collection('pets').add({
      data: {
        name,
        species,
        breed: breed || '',
        age: age || '',
        gender: gender || '未知',
        description: description || '',
        status: status || '可领养',
        photos: photos || [],
        createdAt: db.serverDate()
      }
    })

    return { success: true, _id: result._id }
  } catch (err) {
    return { success: false, error: err }
  }
}
