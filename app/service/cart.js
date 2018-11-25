const Service = require('egg').Service

class CartService extends Service {
  async createOrEdit(req) {
    const { helper } = this.ctx
    const { mysql } = this.app

    try {
      const { uid, id, goods_id, amount } = req

      const validateMessage = helper.validateForm([
        { value: goods_id, name: '商品ID', required: true },
        { value: amount, name: '商品数量', required: true, type: 'posInteger' }
      ])

      if (validateMessage) return helper.response.error(validateMessage)

      const commonCartData = { user_id: uid, goods_id, amount }
      let result

      if (id) result = await mysql.update('cart_info', { id, ...commonCartData })
      else result = await mysql.insert('cart_info', commonCartData)

      return result.affectedRows === 1 ? helper.response.success() : helper.response.error('操作失败')
    } catch (error) {
      this.logger.error(error)
      this.ctx.status = 500
      return helper.response.error('服务器内部异常')
    }
  }

  async delete(req) {
    const { helper } = this.ctx
    const { mysql } = this.app

    try {
      const { uid, id } = req

      if (!id) return helper.response.error('购物车ID不存在')

      const result = await mysql.delete('cart_info', { user_id: uid, id })

      return result.affectedRows === 1 ? helper.response.success() : helper.response.error('操作失败')
    } catch (error) {
      this.logger.error(error)
      this.ctx.status = 500
      return helper.response.error('服务器内部异常')
    }
  }

  async getUserCart(req) {
    const { helper } = this.ctx
    const { mysql } = this.app

    try {
      const result = await mysql.query(
        `SELECT c.id, c.amount, g.id AS gid, g.name, g.price, g.icon 
        FROM goods_info AS g INNER JOIN cart_info AS c ON c.goods_id = g.id 
        WHERE c.user_id = ${req.uid}`
      )

      return helper.response.success(result)
    } catch (error) {
      this.logger.error(error)
      this.ctx.status = 500
      return helper.response.error('服务器内部异常')
    }
  }
}

module.exports = CartService
