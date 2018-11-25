const Service = require('egg').Service
const fs = require('fs')
const path = require('path')
const xss = require('xss')

class BannerService extends Service {
  async createOrEdit(req) {
    const { helper } = this.ctx
    const { mysql } = this.app

    try {
      const { uid, id, title, goods_id, files } = req

      const userInfo = await mysql.get('user_info', { id: uid })
      if (userInfo.type === '0') {
        this.ctx.status = 403
        return helper.response.error('非法操作')
      }

      const validateMessage = helper.validateForm([
        { value: title, name: '公告图标题', required: true },
        { value: goods_id, name: '商品ID', required: true }
      ])

      if (validateMessage) return helper.response.error(validateMessage)

      if (!files) return helper.response.error('公告图不能为空')

      const FILE_TYPE = ['image/jpeg', 'image/png']
      const { mime, filepath } = files[0]

      if (!FILE_TYPE.includes(mime)) {
        this.ctx.status = 415
        return helper.respnose.error('请上传图片格式')
      }

      const commonImgPath = `/public/images/banner_picture/${uid}_${Date.now() + path.extname(filepath)}`

      const writeFilePath = path.join(__dirname, '../', commonImgPath)
      const reader = fs.createReadStream(filepath)
      const writer = fs.createWriteStream(writeFilePath)
      reader.pipe(writer)

      const { protocol, host, port } = this.config
      const databaseImgPath = `${protocol}://${host}:${port}${commonImgPath}`

      const commonBannerData = {
        picture: databaseImgPath,
        title: xss(title),
        goods_id
      }
      let result

      if (id) result = await mysql.update('banner_info', { id, ...commonBannerData })
      else result = await mysql.insert('banner_info', commonBannerData)

      return result.affectedRows === 1 ? helper.response.success() : helper.response.error('操作失败')
    } catch (error) {
      this.logger.error(error)
      this.ctx.status = 500
      return helper.response.error('服务器内部异常')
    }
  }

  async delete(req) {
    const { helper } = this.ctx
    const { mysql } = this.app

    try {
      const { uid, id } = req

      if (!id) return helper.response.error('公告图id不能为空')

      const userInfo = await mysql.get('user_info', { id: uid })
      if (userInfo.type === '0') {
        this.ctx.status = 403
        return helper.response.error('非法操作')
      }

      const result = await mysql.delete('banner_info', { id })

      return result.affectedRows === 1 ? helper.response.success() : helper.response.error('操作失败')
    } catch (error) {
      this.logger.error(error)
      this.ctx.status = 500
      return helper.response.error('服务器内部异常')
    }
  }

  async getBannnerList(req) {
    const { helper } = this.ctx
    const { mysql } = this.app

    try {
      const number = req.number
      let result

      if (number) result = await mysql.select('banner_info', { limit: number, offset: 0 })
      else result = await mysql.select('banner_info')

      return helper.response.success(result)
    } catch (error) {
      this.logger.error(error)
      this.ctx.status = 500
      return helper.response.error('服务器内部异常')
    }
  }

  async getBannnerDetail(req) {
    const { helper } = this.ctx
    const { mysql } = this.app

    try {
      if (!req.id) return helper.response.error('公告图id不能为空')

      const result = await mysql.get('banner_info', { id: req.id })

      return helper.response.success(result)
    } catch (error) {
      this.logger.error(error)
      this.ctx.status = 500
      return helper.response.error('服务器内部异常')
    }
  }
}

module.exports = BannerService
