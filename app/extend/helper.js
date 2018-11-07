const crypto = require('crypto')

// 工具方法
module.exports = {
  // 响应主体
  response: {
    success: data => ({ code: 0, data, message: 'success' }),
    error: message => ({ code: 1, message })
  },
  // 密码加密
  encrypt(password) {
    const { salt } = this.config
    const hash = crypto.createHash('md5')

    hash.update(salt + password)
    return hash.digest('hex')
  }
}
