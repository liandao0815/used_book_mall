const Controller = require('egg').Controller

class GoodsController extends Controller {
  /**
   * @description 新增商品或者编辑商品。请求参数：id(编辑时传), name, stock, price, title, icon, description,
   *  picture, type, category_id
   */
  async addOrEdit() {
    const { query, request, service } = this.ctx
    const req = { ...query, ...request.body, files: request.files }
    this.ctx.body = await service.goods.addOrEdit(req)
  }

  /**
   * @description 上架或者下架商品。请求参数：id, status
   */
  async changeStatus() {
    const { query, request, service } = this.ctx
    const req = { ...query, ...request.body }
    this.ctx.body = await service.goods.changeStatus(req)
  }

  /**
   * @description 获取商品详情。请求参数：id
   */
  async getGoodsDetail() {
    const { query, service } = this.ctx
    this.ctx.body = await service.goods.getGoodsDetail(query)
  }

  /**
   * @description 获取商品列表。请求参数：id, name, type, category_id, pageNo, pageSize
   */
  async getGoodsList() {
    const { query, service } = this.ctx
    this.ctx.body = await service.goods.getGoodsList(query)
  }

  /**
   * @description 搜索商品。请求参数：id, value
   */
  async searchGoods() {
    const { query, service } = this.ctx
    this.ctx.body = await service.goods.searchGoods(query)
  }
}

module.exports = GoodsController
