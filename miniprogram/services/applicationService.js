const { callCloudFunction } = require('./cloud')
const { formatTime } = require('../utils/util')
const { showLoading, hideLoading, showToast } = require('../utils/util')
const { ApplicationStatus } = require('../utils/constants')

function formatApplication(item) {
  item.formattedTime = item.createdAt ? formatTime(new Date(item.createdAt)) : ''
  return item
}

function loadMyApplications() {
  return callCloudFunction('getMyApplications', {}).then(result => {
    return (result.data || []).map(formatApplication)
  })
}

function loadAllApplications() {
  return callCloudFunction('getApplications', {}).then(result => {
    return (result.data || []).map(formatApplication)
  })
}

function submitApplication(applicationData) {
  showLoading('提交中')
  return callCloudFunction('submitApplication', applicationData).then(() => {
    hideLoading()
    return new Promise(resolve => {
      wx.showModal({
        title: '🎉 提交成功',
        content: '您的领养申请已提交，我们会尽快审核，请耐心等待。',
        showCancel: false,
        success: () => {
          wx.navigateBack()
          resolve()
        }
      })
    })
  }).catch(err => {
    hideLoading()
    showToast('提交失败，请重试')
    throw err
  })
}

function confirmReview(action) {
  const status = action === 'approve' ? ApplicationStatus.APPROVED : ApplicationStatus.REJECTED
  const tip = action === 'approve' ? '通过' : '拒绝'
  return new Promise((resolve, reject) => {
    wx.showModal({
      title: '确认操作',
      content: '确定要' + tip + '这条申请吗？',
      success: res => {
        if (res.confirm) resolve({ status, tip })
        else reject(new Error('cancelled'))
      }
    })
  })
}

function reviewApplication(applicationId, petId, status) {
  showLoading('处理中')
  return callCloudFunction('reviewApplication', { applicationId, petId, status }).then(() => {
    hideLoading()
    showToast('操作成功')
  }).catch(err => {
    hideLoading()
    showToast('操作失败')
    throw err
  })
}

module.exports = {
  loadMyApplications,
  loadAllApplications,
  submitApplication,
  confirmReview,
  reviewApplication
}
