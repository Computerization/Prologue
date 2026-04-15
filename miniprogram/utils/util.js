const { PetStatus, ApplicationStatus } = require('./constants')

const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute].map(formatNumber).join(':')
}

const formatDate = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return [year, month, day].map(formatNumber).join('-')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

const defaultStatusConfig = { text: '', color: '#999', bgColor: '#f5f5f5' }

const statusMap = {
  [PetStatus.AVAILABLE]: { text: PetStatus.AVAILABLE, color: '#2ed573', bgColor: '#e8f8ee' },
  [PetStatus.RESERVED]: { text: PetStatus.RESERVED, color: '#FF8C42', bgColor: '#FFF0E5' },
  [PetStatus.ADOPTED]: { text: PetStatus.ADOPTED, color: '#999', bgColor: '#f5f5f5' }
}

const applicationStatusMap = {
  [ApplicationStatus.PENDING]: { text: ApplicationStatus.PENDING, color: '#FF8C42', bgColor: '#FFF0E5' },
  [ApplicationStatus.APPROVED]: { text: ApplicationStatus.APPROVED, color: '#2ed573', bgColor: '#e8f8ee' },
  [ApplicationStatus.REJECTED]: { text: ApplicationStatus.REJECTED, color: '#ff4757', bgColor: '#ffe8ea' }
}

function getStatusConfig(status) {
  return statusMap[status] || Object.assign({}, defaultStatusConfig, { text: status })
}

function getApplicationStatusConfig(status) {
  return applicationStatusMap[status] || Object.assign({}, defaultStatusConfig, { text: status })
}

function showToast(title, icon = 'none') {
  wx.showToast({ title, icon, duration: 2000 })
}

function showLoading(title = '加载中') {
  wx.showLoading({ title, mask: true })
}

function hideLoading() {
  wx.hideLoading()
}

module.exports = {
  formatTime,
  formatDate,
  getStatusConfig,
  getApplicationStatusConfig,
  showToast,
  showLoading,
  hideLoading
}
