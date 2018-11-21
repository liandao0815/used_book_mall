const Service = require('egg').Service
const xss = require('xss')

class GoodsService extends Service {
  async addOrEdit(req) {
    const { helper } = this.ctx
    const { mysql } = this.app

    try {
    } catch (error) {
      this.logger.error(error)
      this.ctx.status = 500
      return helper.response.error('服务器内部异常')
    }
  }

  async changeStatus(req) {
    const { helper } = this.ctx
    const { mysql } = this.app

    try {
    } catch (error) {
      this.logger.error(error)
      this.ctx.status = 500
      return helper.response.error('服务器内部异常')
    }
  }

  async getGoodsDetail(req) {
    const { helper } = this.ctx
    const { mysql } = this.app

    try {
    } catch (error) {
      this.logger.error(error)
      this.ctx.status = 500
      return helper.response.error('服务器内部异常')
    }
  }

  async getGoodsList(req) {
    const { helper } = this.ctx
    const { mysql } = this.app

    try {
    } catch (error) {
      this.logger.error(error)
      this.ctx.status = 500
      return helper.response.error('服务器内部异常')
    }
  }
}
