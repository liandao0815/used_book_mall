const Controller = require('egg').Controller

class BannerController extends Controller {
  /**
   * @description 创建或者编辑公告图。请求参数：id(编辑时传), picture, title, goods_id
   */
  async createOrEdit() {
    const { query, request, service } = this.ctx
    const req = { ...query, ...request.body, files: request.files }
    this.ctx.body = await service.banner.createOrEdit(req)
  }

  /**
   * @description 删除公告图。请求参数：id
   */
  async delete() {
    const { query, request, service } = this.ctx
    const req = { ...query, ...request.body }
    this.ctx.body = await service.banner.delete(req)
  }

  /**
   * @description 获取公告图列表。请求参数：number
   */
  async getBannerList() {
    const { query, service } = this.ctx
    this.ctx.body = await service.banner.getBannerList(query)
  }

  /**
   * @description 获取公告图详情。请求参数：id
   */
  async getBannerDetail() {
    const { query, service } = this.ctx
    this.ctx.body = await service.banner.getBannerDetail(query)
  }
}

module.exports = BannerController
