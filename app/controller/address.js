const Controller = require('egg').Controller

class AddressController extends Controller {
  /**
   * @description 添加或者编辑收获地址。请求参数：id, name, phone, area, address
   */
  async createOrEdit() {
    const { request, service } = this.ctx
    const req = request.body
    this.ctx.body = await service.address.create(req)
  }
  
  /**
   * @description 获取地址信息
   */
  async getAddressInfo() {
    const { query, service } = this.ctx
    this.ctx.body = await service.address.getAddressInfo(query)
  }
}

module.exports = AddressController