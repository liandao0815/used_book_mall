const Service = require('egg').Service
const jwt = require('jsonwebtoken')
const xss = require('xss')
const fs = require('fs')
const path = require('path')

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
        if (userInfo.status === '1') {
          this.ctx.status = 403
          return helper.response.error('账号已经被冻结，禁止访问')
        }

        const { keys, expiresIn } = this.config.token
        const token = jwt.sign({ account }, keys, { expiresIn })
        const result = await mysql.update('user_info', { id: userInfo.id, token })

        return result.affectedRows === 1
          ? helper.response.success({ id: userInfo.id, token, type })
          : helper.response.error('操作失败')
      } else {
        return helper.response.error('用户名或者密码错误')
      }
    } catch (error) {
      this.logger.error(error)
      this.ctx.status = 500
      return helper.response.error('服务器内部异常')
    }
  }

  async register(req) {
    const { helper } = this.ctx
    const { mysql } = this.app

    try {
      const { account, password, rePassword } = req

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
          nickname: filterAccount,
          type: '0',
          token
        })

        return result.affectedRows === 1
          ? helper.response.success({ id: result.insertId, token, type: '0' })
          : helper.response.error('操作失败')
      }
    } catch (error) {
      this.logger.error(error)
      this.ctx.status = 500
      return helper.response.error('服务器内部异常')
    }
  }

  async getUserInfo(req) {
    const { helper } = this.ctx
    const { mysql } = this.app

    try {
      const result = await mysql.select('user_info', {
        where: { id: req.uid },
        columns: ['id', 'account', 'nickname', 'sex', 'avatar', 'status', 'type', 'token']
      })

      return helper.response.success(result)
    } catch (error) {
      this.logger.error(error)
      this.ctx.status = 500
      return helper.response.error('服务器内部异常')
    }
  }

  async addSeller(req) {
    const { helper } = this.ctx
    const { mysql } = this.app

    try {
      const { account, password, uid } = req

      const adminInfo = await mysql.get('user_info', { id: uid, type: '2' })
      if (!adminInfo) {
        this.ctx.status = 403
        return helper.response.error('非法操作')
      }

      if (!account || !password) return helper.response.error('账号或者密码不能为空')

      const userInfo = await mysql.get('user_info', { account })
      if (userInfo) return helper.response.error('该账号已存在，请换个账号注册')

      const filterAccount = xss(account)
      const cryptoPassword = helper.encrypt(password)

      const result = await mysql.insert('user_info', {
        account: filterAccount,
        password: cryptoPassword,
        type: '1'
      })

      return result.affectedRows === 1 ? helper.response.success() : helper.response.error('操作失败')
    } catch (error) {
      this.logger.error(error)
      this.ctx.status = 500
      return helper.response.error('服务器内部异常')
    }
  }

  async freezeOrThawUser(req) {
    const { helper } = this.ctx
    const { mysql } = this.app

    try {
      const { account, uid } = req

      const adminInfo = await mysql.get('user_info', { id: uid, type: '2' })
      const userInfo = await mysql.get('user_info', { account })

      if (!adminInfo || userInfo.type === '2') {
        this.ctx.status = 403
        return helper.response.error('非法操作')
      } else {
        const row = { status: userInfo.status === '0' ? '1' : '0' }
        const options = { where: { account } }
        const result = await mysql.update('user_info', row, options)

        return result.affectedRows === 1 ? helper.response.success() : helper.response.error('操作失败')
      }
    } catch (error) {
      this.logger.error(error)
      this.ctx.status = 500
      return helper.response.error('服务器内部异常')
    }
  }

  async getUserList(req) {
    const { helper } = this.ctx
    const { mysql } = this.app

    try {
      const { uid, pageNo = 1, pageSize = 10, account = '' } = req

      const adminInfo = await mysql.get('user_info', { id: uid, type: '2' })

      if (!adminInfo) {
        this.ctx.status = 403
        return helper.response.error('非法操作')
      } else {
        const filterStr = mysql.escape(account).replace(/^'|'$/g, '')
        const condition = `type != '2' AND account LIKE '%${filterStr}%'`

        // 分页数据
        const result = await mysql.query(
          `SELECT id, account, nickname, sex, status, type, create_time, update_time
          FROM user_info 
          WHERE ${condition}
          ORDER BY id DESC 
          LIMIT ${(pageNo - 1) * pageSize}, ${pageSize}`
        )
        // 数据总数
        const totalCount = await mysql.query(
          `SELECT COUNT(*) AS count FROM user_info 
          WHERE ${condition}`
        )

        return helper.response.success({ result, totalCount: totalCount[0].count })
      }
    } catch (error) {
      this.logger.error(error)
      this.ctx.status = 500
      return helper.response.error('服务器内部异常')
    }
  }

  async modifyPassword(req) {
    const { helper } = this.ctx
    const { mysql } = this.app

    try {
      const { uid, password, newPassword } = req

      const cryptoPassword = helper.encrypt(password)
      const userInfo = await mysql.get('user_info', { id: uid, password: cryptoPassword })

      if (!userInfo) {
        return helper.response.error('原密码不正确')
      } else if (!newPassword) {
        return helper.response.error('新密码不能为空')
      } else {
        const cryptoNewPassword = helper.encrypt(newPassword)
        const result = await mysql.update('user_info', { id: uid, password: cryptoNewPassword })

        return result.affectedRows === 1 ? helper.response.success() : helper.response.error('操作失败')
      }
    } catch (error) {
      this.logger.error(error)
      this.ctx.status = 500
      return helper.response.error('服务器内部异常')
    }
  }

  async modifyUserInfo(req) {
    const { helper } = this.ctx
    const { mysql } = this.app

    try {
      const { uid, nickname, sex = '0' } = req
      const result = await mysql.update('user_info', { id: uid, nickname, sex })

      return result.affectedRows === 1 ? helper.response.success() : helper.response.error('操作失败')
    } catch (error) {
      this.logger.error(error)
      this.ctx.status = 500
      return helper.response.error('服务器内部异常')
    }
  }

  async uploadAvatar(req) {
    const { helper } = this.ctx
    const { mysql } = this.app

    try {
      const FILE_TYPE = ['image/jpeg', 'image/png']
      const FILE_SIZE = 0.5 * 1024 * 1024

      const { uid, files } = req

      if (!files) return helper.response.error('用户头像不能为空')

      const { mime, filepath } = files[0]
      const stat = fs.statSync(filepath)

      if (!FILE_TYPE.includes(mime)) {
        this.ctx.status = 415
        return helper.response.error('请上传图片格式')
      }

      if (stat.size > FILE_SIZE) {
        this.ctx.status = 413
        return helper.response.error('文件大小超过500K')
      }

      const commonImgPath = `/public/images/user_avatar/${uid}_${Date.now() + path.extname(filepath)}`

      const writeFilePath = path.join(__dirname, '../', commonImgPath)
      const reader = fs.createReadStream(filepath)
      const writer = fs.createWriteStream(writeFilePath)
      reader.pipe(writer)

      const { protocol, host, port } = this.config
      const databaseImgPath = `${protocol}://${host}:${port}${commonImgPath}`

      const result = await mysql.update('user_info', { id: uid, avatar: databaseImgPath })
      return result.affectedRows === 1 ? helper.response.success() : helper.response.error('操作失败')
    } catch (error) {
      this.logger.error(error)
      this.ctx.status = 500
      return helper.response.error('服务器内部异常')
    }
  }
}

module.exports = UserService
