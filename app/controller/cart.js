const Controller = require('egg').Controller

class CartController extends Controller {
  /**
   * @description 加入或编辑编辑。请求参数：id(编辑时传), amount, goods_id
   */
  async createOrEdit() {
    const { query, request, service } = this.ctx
    const req = { ...query, ...request.body }
    this.ctx.body = await service.cart.createOrEdit(req)
  }

  /**
   * @description 删除购物车。请求参数：id
   */
  async delete() {
    const { query, request, service } = this.ctx
    const req = { ...query, ...request.body }
    this.ctx.body = await service.cart.delete(req)
  }

  /**
   * @description 获取用户购物车列表
   */
  async getUserCart() {
    const { query } = this.ctx
    this.ctx.body = await this.service.cart.getUserCart(query)
  }
}

module.exports = CartController
