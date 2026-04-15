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

    const { id, name, species, breed, age, gender, description, status, photos } = event

    const updateData = {}
    if (name !== undefined) updateData.name = name
    if (species !== undefined) updateData.species = species
    if (breed !== undefined) updateData.breed = breed
    if (age !== undefined) updateData.age = age
    if (gender !== undefined) updateData.gender = gender
    if (description !== undefined) updateData.description = description
    if (status !== undefined) updateData.status = status
    if (photos !== undefined) updateData.photos = photos
    updateData.updatedAt = db.serverDate()

    await db.collection('pets').doc(id).update({ data: updateData })

    return { success: true }
  } catch (err) {
    return { success: false, error: err }
  }
}
