const Controller = require('egg').Controller

class UserController extends Controller {
  /**
   * @description 用户登录。请求参数：account, password, type
   */
  async login() {
    const { request, service } = this.ctx
    const req = request.body
    const res = await service.user.login(req)
    this.ctx.body = res
  }

  /**
   * @description 用户注册。请求参数：account, password, rePassword, type
   */
  async register() {
    const { request, service } = this.ctx
    const req = request.body
    const res = await service.user.register(req)
    this.ctx.body = res
  }

  /**
   * @description 获取用户信息。
   */
  async getUserInfo() {
    const { query, service } = this.ctx
    const res = await service.user.getUserInfo(query)
    this.ctx.body = res
  }
}

module.exports = UserController
