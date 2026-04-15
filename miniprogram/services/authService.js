const { callCloudFunction } = require('./cloud')

function verifyAdmin(password) {
  return callCloudFunction('verifyAdmin', { password })
}

function login() {
  return callCloudFunction('login', {})
}

module.exports = { verifyAdmin, login }
