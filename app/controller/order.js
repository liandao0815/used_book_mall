const Controller = require('egg').Controller

class OrderController extends Controller {
  /**
   * @description 生成订单。请求参数：goods_id, amount
   */
  async create () {
    const { query, request } = this.ctx
    const req = { ...query, ...request.body }
    this.ctx.body = await service.order.create(req)
  }
}

module.exports = OrderController