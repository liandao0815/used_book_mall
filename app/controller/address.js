const Controller = require('egg').Controller

class AddressController extends Controller {
  /**
   * @description 添加或者编辑收货地址。请求参数：id（修改时传）, name, phone, area, address
   */
  async createOrEdit() {
    const { query, request, service } = this.ctx
    const req = {...query, ...request.body}
    this.ctx.body = await service.address.createOrEdit(req)
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
