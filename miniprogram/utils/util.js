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

const statusMap = {
  '可领养': { text: '可领养', color: '#2ed573', bgColor: '#e8f8ee' },
  '已预定': { text: '已预定', color: '#FF8C42', bgColor: '#FFF0E5' },
  '已领养': { text: '已领养', color: '#999', bgColor: '#f5f5f5' }
}

const applicationStatusMap = {
  '待审核': { text: '待审核', color: '#FF8C42', bgColor: '#FFF0E5' },
  '已通过': { text: '已通过', color: '#2ed573', bgColor: '#e8f8ee' },
  '已拒绝': { text: '已拒绝', color: '#ff4757', bgColor: '#ffe8ea' }
}

function getStatusConfig(status) {
  return statusMap[status] || { text: status, color: '#999', bgColor: '#f5f5f5' }
}

function getApplicationStatusConfig(status) {
  return applicationStatusMap[status] || { text: status, color: '#999', bgColor: '#f5f5f5' }
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
