const { callCloudFunction } = require('./cloud')
const { NavigateBackDelay, MaxPhotos } = require('../utils/constants')
const { showLoading, hideLoading, showToast } = require('../utils/util')

function loadPet(id) {
  showLoading('加载中')
  const db = wx.cloud.database()
  return db.collection('pets').doc(id).get().then(res => {
    hideLoading()
    return res.data
  }).catch(err => {
    hideLoading()
    showToast('加载失败')
    throw err
  })
}

function loadPetList() {
  const db = wx.cloud.database()
  return db.collection('pets').orderBy('createdAt', 'desc').get().then(res => res.data)
}

function savePet(data, isEdit) {
  const functionName = isEdit ? 'updatePet' : 'addPet'
  const loadingText = isEdit ? '保存中' : '添加中'
  const successText = isEdit ? '修改成功' : '添加成功'
  showLoading(loadingText)
  return callCloudFunction(functionName, data).then(() => {
    hideLoading()
    showToast(successText)
    setTimeout(() => wx.navigateBack(), NavigateBackDelay)
  }).catch(err => {
    hideLoading()
    showToast('操作失败')
    throw err
  })
}

function deletePet(id) {
  showLoading('删除中')
  return callCloudFunction('deletePet', { id }).then(() => {
    hideLoading()
    showToast('删除成功')
  }).catch(err => {
    hideLoading()
    showToast('删除失败')
    throw err
  })
}

function confirmDeletePet(name) {
  return new Promise((resolve, reject) => {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除 ' + name + ' 吗？删除后不可恢复。',
      confirmColor: '#ff4757',
      success: res => {
        if (res.confirm) resolve()
        else reject(new Error('cancelled'))
      }
    })
  })
}

function uploadPhotos(filePaths) {
  showLoading('上传中')
  const tasks = filePaths.map(path => {
    const ext = path.match(/\.\w+$/)[0]
    const cloudPath = 'pets/' + Date.now() + '_' + Math.random().toString(36).substr(2, 8) + ext
    return wx.cloud.uploadFile({ cloudPath, filePath: path })
  })
  return Promise.all(tasks).then(results => {
    hideLoading()
    return results.map(result => result.fileID)
  }).catch(() => {
    hideLoading()
    showToast('上传失败')
    throw new Error('upload failed')
  })
}

module.exports = {
  loadPet,
  loadPetList,
  savePet,
  deletePet,
  confirmDeletePet,
  uploadPhotos,
  MaxPhotos
}
