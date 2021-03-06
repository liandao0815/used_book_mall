const Service = require('egg').Service

class OrderService extends Service {
  async create(req) {
    const { helper } = this.ctx
    const { mysql } = this.app
    const conn = await mysql.beginTransaction()

    try {
      const { uid, goods_id, amount } = req

      const validateMessage = helper.validateForm([
        { value: goods_id, name: '商品ID', required: true },
        { value: amount, name: '购买数量', required: true, type: 'posInteger' }
      ])
      if (validateMessage) return helper.response.error(validateMessage)

      const addressInfo = await conn.get('address_info', { user_id: uid })
      if (!addressInfo) {
        await conn.rollback()
        return helper.response.error('请先设置收货地址')
      }

      const goodsInfo = await conn.get('goods_info', { id: goods_id })
      if (!goodsInfo) {
        await conn.rollback()
        return helper.response.error('该商品不存在')
      }

      const surplusStock = goodsInfo.stock - Number.parseInt(amount)

      if (goodsInfo.status === '2') {
        await conn.rollback()
        return helper.response.error('该商品已下架')
      } else if (surplusStock < 0) {
        await conn.rollback()
        return helper.response.error('购买数量大于库存数量')
      }

      const status = surplusStock === 0 ? '2' : '1'
      const saleAmount = goodsInfo.sale_amount + Number.parseInt(amount)
      const money = goodsInfo.price * Number.parseInt(amount)
      const orderId = helper.createOrderNo(uid)

      const updateResult = await conn.update('goods_info', {
        id: goods_id,
        stock: surplusStock,
        status,
        sale_amount: saleAmount
      })

      if (updateResult.affectedRows !== 1) {
        await conn.rollback()
        return helper.response.error('操作失败')
      }

      const insertResult = await conn.insert('order_info', {
        id: orderId,
        money,
        amount,
        user_id: uid,
        goods_id: goodsInfo.id,
        address_id: addressInfo.id
      })

      if (insertResult.affectedRows !== 1) {
        await conn.rollback()
        return helper.response.error('操作失败')
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

  async batchCreate(req) {
    const { helper } = this.ctx
    const { mysql } = this.app
    const conn = await mysql.beginTransaction()

    try {
      const { uid, cartList } = req

      const addressInfo = await mysql.get('address_info', { user_id: uid })
      if (!addressInfo) {
        await conn.rollback()
        return helper.response.error('请先设置收货地址')
      }

      const cartPromise = cartList.map(item =>
        this._handleCartItem({ cart_id: item, uid, address_id: addressInfo.id }, conn)
      )
      for await (const response of cartPromise) {
        if (response.code === 1) return response
      }

      await conn.commit()

      return helper.response.success()
    } catch (error) {
      this.logger.error(error)
      this.ctx.status = 500
      return helper.response.error('服务器内部异常')
    }
  }

  async _handleCartItem(req, conn) {
    const { helper } = this.ctx

    try {
      const { uid, cart_id, address_id } = req

      const cartInfo = await conn.get('cart_info', { id: cart_id })
      if (!cartInfo) {
        await conn.rollback()
        return helper.response.error(`ID为${cart_id}的购物车不存在`)
      }

      const { goods_id, amount } = cartInfo
      const goodsInfo = await conn.get('goods_info', { id: goods_id })
      const surplusStock = goodsInfo.stock - Number.parseInt(amount)

      if (goodsInfo.status === '2') {
        await conn.rollback()
        return helper.response.error(`商品${goodsInfo.name}已下架`)
      } else if (surplusStock < 0) {
        await conn.rollback()
        return helper.response.error(`商品${goodsInfo.name}购买数量大于库存数量`)
      } else {
        const status = surplusStock === 0 ? '2' : '1'
        const saleAmount = goodsInfo.sale_amount + Number.parseInt(amount)
        const money = goodsInfo.price * Number.parseInt(amount)
        const orderId = helper.createOrderNo(uid)

        const updateResult = await conn.update('goods_info', {
          id: goods_id,
          stock: surplusStock,
          status,
          sale_amount: saleAmount
        })

        if (updateResult.affectedRows !== 1) {
          await conn.rollback()
          return helper.response.error('操作失败')
        }

        const insertResult = await conn.insert('order_info', {
          id: orderId,
          money,
          amount,
          user_id: uid,
          goods_id: goodsInfo.id,
          address_id: address_id
        })

        if (insertResult.affectedRows !== 1) {
          await conn.rollback()
          return helper.response.error('操作失败')
        }

        const deleteResult = await conn.delete('cart_info', { id: cart_id, user_id: uid })

        if (deleteResult.affectedRows !== 1) {
          await conn.rollback()
          return helper.response.error('操作失败')
        }

        return helper.response.success()
      }
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

      if (!id) return helper.response.error('订单ID不存在')

      const adminInfo = await mysql.get('user_info', { id: uid, type: '2' })
      let result

      if (adminInfo) {
        result = await mysql.delete('order_info', { id })
      } else {
        result = await mysql.delete('order_info', { id, user_id: uid })
      }

      return result.affectedRows === 1 ? helper.response.success() : helper.response.error('操作失败')
    } catch (error) {
      this.logger.error(error)
      this.ctx.status = 500
      return helper.response.error('服务器内部异常')
    }
  }

  async getUserOrder(req) {
    const { helper } = this.ctx
    const { mysql } = this.app

    try {
      const sql = `SELECT o.id, o.money, o.amount, o.create_time, g.id AS goods_id, g.name, g.icon
        FROM goods_info AS g INNER JOIN order_info AS o ON o.goods_id = g.id 
        WHERE o.user_id = ${req.uid}
        ORDER BY o.create_time DESC`

      const result = await mysql.query(sql)

      return helper.response.success(result)
    } catch (error) {
      this.logger.error(error)
      this.ctx.status = 500
      return helper.response.error('服务器内部异常')
    }
  }

  async getOrderList(req) {
    const { helper } = this.ctx
    const { mysql } = this.app

    try {
      const { uid, id, pageNo = 1, pageSize = 10 } = req

      const adminInfo = await mysql.get('user_info', { id: uid, type: '2' })

      if (!adminInfo) {
        this.ctx.status = 403
        return helper.response.error('非法操作')
      }

      const querySql = `SELECT o.id, o.money, o.create_time, g.id AS goods_id, u.account
        FROM order_info AS o INNER JOIN goods_info AS g ON o.goods_id = g.id 
        INNER JOIN user_info AS u ON o.user_id = u.id ${id ? `WHERE o.id = ${id}` : ''}
        ORDER BY o.create_time DESC
        LIMIT ${(pageNo - 1) * pageSize}, ${pageSize}`
      const totalSql = `SELECT COUNT(*) AS count FROM order_info ${id ? `WHERE id = ${id}` : ''}`

      const result = await mysql.query(querySql)
      const totalCount = await mysql.query(totalSql)

      return helper.response.success({ result, totalCount: totalCount[0].count })
    } catch (error) {
      this.logger.error(error)
      this.ctx.status = 500
      return helper.response.error('服务器内部异常')
    }
  }

  async getOrderDetail(req) {
    const { helper } = this.ctx
    const { mysql } = this.app

    try {
      const { uid, id } = req

      const addressInfo = await mysql.get('address_info', { user_id: uid })

      const sql = `SELECT o.id, o.money, o.amount, o.create_time, g.name, g.icon
      FROM goods_info AS g INNER JOIN order_info AS o ON o.goods_id = g.id 
      WHERE o.id = ${id} AND o.user_id = ${uid} LIMIT 0, 1`

      const orderData = await mysql.query(sql)

      return helper.response.success({ addressInfo, orderData: orderData[0] })
    } catch (error) {
      this.logger.error(error)
      this.ctx.status = 500
      return helper.response.error('服务器内部异常')
    }
  }
}

module.exports = OrderService
