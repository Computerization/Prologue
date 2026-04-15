function callCloudFunction(name, data) {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name,
      data,
      success: res => {
        if (res.result && res.result.success === false) {
          reject(res.result)
        } else {
          resolve(res.result)
        }
      },
      fail: reject
    })
  })
}

module.exports = { callCloudFunction }
