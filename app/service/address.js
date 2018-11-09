const Service = require('egg').Service
const xss = require('xss')

class AddressService extends Service {
  async create(req) {
    const { helper } = this.ctx
    const { mysql } = this.app

    try {
      const { uid, name, phone, area, address } = req

      const validateMessage = helper.validateForm([
        { value: name, name: '姓名', required: true, maxLength: 10 },
        { value: phone, name: '联系方式', required: true, type: 'phone' },
        { value: area, name: '地区', required: true },
        { value: address, name: '详细地址', required: true }
      ])

      if (validateMessage) return helper.response.error(validateMessage)

      const addressInfo = mysql.get('address_info', { user_id: uid })

      if (addressInfo) {
        return helper.response.error('收获地址已存在')
      } else {
        const result = mysql.insert('address_info', {
          user_id: uid,
          name: xss(name),
          phone,
          area: xss(area),
          address: xss(address)
        })

        return result.affectedRows === 1 ? helper.response.success() : helper.response.error('操作失败')
      }
    } catch (error) {
      this.logger.error(error)
      this.ctx.status = 500
      return helper.response.error('服务器内部异常')
    }
  }
}

module.exports = AddressService
