const Controller = require('egg').Controller

class OrderController extends Controller {
  /**
   * @description 生成订单。请求参数：goods_id, amount
   */
  async create() {
    const { query, request, service } = this.ctx
    const req = { ...query, ...request.body }
    this.ctx.body = await service.order.create(req)
  }

  /**
   * @description 批量生成订单。请求参数：cartList: [{goods_id, amount, cart_id}]
   */
  async batchCreate() {
    const { query, request, service } = this.ctx
    const req = { ...query, ...request.body }
    this.ctx.body = await service.order.batchCreate(req)
  }

  /**
   * @description 删除订单。请求参数：id
   */
  async delete() {
    const { query, request, service } = this.ctx
    const req = { ...query, ...request.body }
    this.ctx.body = await service.order.delete(req)
  }

  /**
   * @description 获取用户的订单
   */
  async getUserOrder() {
    const { query, service } = this.ctx
    this.ctx.body = await service.order.getUserOrder(query)
  }

  /**
   * @description 分页获取订单。id, pageNo, pageSize
   */
  async getOrderList() {
    const { query, service } = this.ctx
    this.ctx.body = await service.order.getOrderList(query)
  }

  /**
   * @description 获取订单详情。请求参数：id
   */
  async getOrderDetail() {
    const { query, service } = this.ctx
    this.ctx.body = await service.order.getOrderDetail(query)
  }
}

module.exports = OrderController
