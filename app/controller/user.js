const Controller = require('egg').Controller

class UserController extends Controller {
  /**
   * @description 登录。请求参数：account, password, type
   */
  async login() {
    const { request, service } = this.ctx
    const req = request.body
    this.ctx.body = await service.user.login(req)
  }

  /**
   * @description 用户注册。请求参数：account, password, rePassword
   */
  async register() {
    const { request, service } = this.ctx
    const req = request.body
    this.ctx.body = await service.user.register(req)
  }

  /**
   * @description 获取用户信息
   */
  async getUserInfo() {
    const { query, service } = this.ctx
    this.ctx.body = await service.user.getUserInfo(query)
  }

  /**
   * @description 管理员新增商家。请求参数：account, password
   */
  async addSeller() {
    const { query, request, service } = this.ctx
    const req = { ...query, ...request.body }
    this.ctx.body = await service.user.addSeller(req)
  }

  /**
   * @description 管理员冻结和解冻用户。请求参数：account
   */
  async freezeOrThawUser() {
    const { query, request, service } = this.ctx
    const req = { ...query, ...request.body }
    this.ctx.body = await service.user.freezeOrThawUser(req)
  }

  /**
   * @description 用户列表查询。请求参数：pageNo, pageSize, account
   */
  async getUserList() {
    const { query, service } = this.ctx
    this.ctx.body = await service.user.getUserList(query)
  }

  /**
   * @description 修改密码。请求参数：password, newPassword
   */
  async modifyPassword() {
    const { query, request, service } = this.ctx
    const req = { ...query, ...request.body }
    this.ctx.body = await service.user.modifyPassword(req)
  }

  /**
   * @description 修改个人信息。请求参数：nickname, sex
   */
  async modifyUserInfo() {
    const { query, request, service } = this.ctx
    const req = { ...query, ...request.body }
    this.ctx.body = await service.user.modifyUserInfo(req)
  }

  /**
   * @description 上传头像。请求参数：avatar
   */
  async modifyUserInfo() {
    const { query, request, service } = this.ctx
    const req = { ...query, ...request.body }
    this.ctx.body = await service.user.modifyUserInfo(req)
  }
}

module.exports = UserController
