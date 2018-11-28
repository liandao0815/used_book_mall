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

      const goodsInfo = await mysql.get('goods_info', { id: goods_id })
      if (!goodsInfo) return helper.response.error(`商品ID为${goods_id}的商品不存在`)

      const row = { goods_id, amount }
      const options = {
        where: { user_id: uid, id }
      }

      let result

      if (id) {
        result = await mysql.update('cart_info', row, options)
      } else {
        const cartInfo = await mysql.get('cart_info', { goods_id, user_id: uid })

        if (cartInfo)
          result = await mysql.update(
            'cart_info',
            { id: cartInfo.id, amount: cartInfo.amount + Number(amount) },
            options
          )
        else result = await mysql.insert('cart_info', { ...row, user_id: uid })
      }

      return result.affectedRows === 1 ? helper.response.success() : helper.response.error('操作失败')
    } catch (error) {
      this.logger.error(error)
      this.ctx.status = 500
      return helper.response.error('服务器内部异常')
    }
  }

  async batchEditAndDelete(req) {
    const { helper } = this.ctx
    const { mysql } = this.app
    const conn = await mysql.beginTransaction()

    try {
      const { uid, editList, deleteList } = req

      const editPromise = editList.map(cartItem => {
        return conn.update(
          'cart_info',
          { amount: cartItem.amount },
          { where: { user_id: uid, id: cartItem.id } }
        )
      })
      for await (const result of editPromise) {
        if (result.affectedRows !== 1) return helper.response.error('操作失败')
      }

      const deletePromise = deleteList.map(cartId => {
        return conn.delete('cart_info', { id: cartId, user_id: uid })
      })
      for await (const result of deletePromise) {
        if (result.affectedRows !== 1) return helper.response.error('操作失败')
      }

      await conn.commit()

      return helper.response.success()
    } catch (error) {
      await conn.rollback()

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
        `SELECT c.id, c.amount, g.id AS goods_id, g.name, g.price, g.icon 
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
