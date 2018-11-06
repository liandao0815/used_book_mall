const Service = require('egg').Service
const jwt = require('jsonwebtoken')
const xss = require('xss')

class UserService extends Service {
  async login(req) {
    const { helper } = this.ctx
    const { mysql } = this.app

    try {
      const { account, password, type = '0' } = req

      if (!account || !password) return helper.response.error('用户名或者密码不能为空')

      const cryptoPassword = helper.encrypt(password)
      const userInfo = await mysql.get('user_info', { account, password: cryptoPassword, type })

      if (userInfo) {
        const { keys, expiresIn } = this.config.token
        const token = jwt.sign({ account }, keys, { expiresIn })
        const result = await mysql.update('user_info', { id: userInfo.id, token })

        return result.affectedRows === 1 ? helper.response.success() : helper.response.error('登录失败')
      } else {
        return helper.response.error('用户名或者密码错误')
      }
    } catch (error) {
      this.logger.error(error)
      return helper.response.error('服务器内部异常')
    }
  }

  async register(req) {
    const { helper } = this.ctx
    const { mysql } = this.app

    try {
      const { account, password, rePassword, type = '0' } = req

      if (!account || !password) return helper.response.error('用户名或者密码不能为空')

      if (password !== rePassword) return helper.response.error('两次输入密码不一致')

      const userInfo = await mysql.get('user_info', { account })

      if (userInfo) {
        return helper.response.error('用户已存在，请换个账号注册')
      } else {
        const { keys, expiresIn } = this.config.token
        const filterAccount = xss(account)
        const cryptoPassword = helper.encrypt(password)

        const token = jwt.sign({ account: filterAccount }, keys, { expiresIn })

        const result = await mysql.insert('user_info', {
          account: filterAccount,
          password: cryptoPassword,
          type,
          token
        })

        return result.affectedRows === 1 ? helper.response.success() : helper.response.error('注册失败')
      }
    } catch (error) {
      this.logger.error(error)
      return helper.response.error('服务器内部异常')
    }
  }

  async getUserInfo(req) {
    try {
      const { helper } = this.ctx
      const { mysql } = this.app

      const result = await mysql.select('user_info', {
        where: { id: req.uid },
        columns: ['id', 'account', 'nickname', 'sex', 'avatar', 'status', 'type', 'token']
      })

      return helper.response.success(result)
    } catch (error) {
      this.logger.error(error)
      return helper.response.error('服务器内部异常')
    }
  }
}

module.exports = UserService
