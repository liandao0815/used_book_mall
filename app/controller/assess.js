const Controller = require('egg').Controller

class AssessController extends Controller {
  /**
   * @description 评价商品。请求参数：content, score, rank, goods_id
   */
  async create() {
    const { query, request, service } = this.ctx
    const req = { ...query, ...request.body }
    this.ctx.body = await service.assess.create(req)
  }

  /**
   * @description 检查是否可以评价商品。请求参数：goods_id。返回： 0（不能评价），1（能评价）
   */
  async checkStatus() {
    const { query, service } = this.ctx
    this.ctx.body = await service.assess.checkStatus(query)
  }

  /**
   * @description 删除评价。请求参数：id
   */
  async delete() {
    const { query, request, service } = this.ctx
    const req = { ...query, ...request.body }
    this.ctx.body = await service.assess.delete(req)
  }

  /**
   * @description 获取商品的评价。请求参数：goods_id
   */
  async getGoodsAssess() {
    const { query, service } = this.ctx
    this.ctx.body = await service.assess.getGoodsAssess(query)
  }

  /**
   * @description 分页获取商品评价列表。请求参数：id, goods_id, account, pageNo, pageSize
   */
  async getAssessList() {
    const { query, service } = this.ctx
    this.ctx.body = await service.assess.getAssessList(query)
  }

  /**
   * @description 置顶或者取消置顶评价。请求参数：id, priority
   */
  async changePriority() {
    const { query, request, service } = this.ctx
    const req = { ...query, ...request.body }
    this.ctx.body = await service.assess.changePriority(req)
  }
}

module.exports = AssessController
