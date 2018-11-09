const Controller = require('egg').Controller

class AddressController extends Controller {
  /**
   * @description 创建收获地址。请求参数：name, phone, area, address
   */
  async create() {
    const { request, service } = this.ctx
    const req = request.body
    this.ctx.body = await service.address.create(req)
  }
}

module.exports = AddressController