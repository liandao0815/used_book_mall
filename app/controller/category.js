const Controller = require('egg').Controller

class CategoryController extends Controller {
  /**
   * @description 创建分类或者编辑。请求参数：id(编辑时传), name
   */
  async createOrEdit() {
    const { query, request, service } = this.ctx
    const req = { ...query, ...request.body }
    this.ctx.body = await service.category.createOrEdit(req)
  }

  /**
   * @description 删除分类。请求参数：id
   */
  async delete() {
    const { query, request, service } = this.ctx
    const req = { ...query, ...request.body }
    this.ctx.body = await service.category.delete(req)
  }

  /**
   * @description 获取分类列表
   */
  async getCategoryList() {
    const { service } = this.ctx
    this.ctx.body = await service.category.getCategoryList()
  }
}

module.exports = CategoryController
