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
  },
  /**
   * @description 表单验证
   * @param {Array} options
   * @example validateForm([
   *  {name: xxx, value: xxx, required: true, type: xxx, minLength: xxx, maxLength: xxx}
   * ])
   */
  validateForm(options) {
    const validateTypes = {
      phone: {
        regexp: /^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/,
        message: '手机号格式不正确'
      },
      number: {
        regexp: /^\d+(\.\d+)?$/,
        message: '数字格式不正确'
      },
      posInteger: {
        regexp: /^\d+$/,
        message: '正整数格式不正确'
      }
    }

    const strategy = {
      required(name, value) {
        return !value ? `${name}不能为空` : ''
      },
      type(value, type) {
        return !validateTypes[type].regexp.test(value) ? validateTypes[type].message : ''
      },
      minLength(name, value, minLength) {
        return value.length < minLength ? `${name}最小长度为${minLength}` : ''
      },
      maxLength(name, value, maxLength) {
        return value.length > maxLength ? `${name}最大长度为${maxLength}` : ''
      }
    }

    for (const object of options) {
      const { name, value, required, type, minLength, maxLength } = object

      const requiredMsg = required && strategy.required(name, value)
      const typeMsg = type && strategy.type(value, type)
      const minLengthMsg = minLength && strategy.minLength(name, value, minLength)
      const maxLengthMsg = maxLength && strategy.maxLength(name, value, maxLength)

      const msgArray = [requiredMsg, typeMsg, minLengthMsg, maxLengthMsg]

      for (const msg of msgArray) {
        if (msg) return msg
      }
    }
  }
}
