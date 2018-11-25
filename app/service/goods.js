const Service = require('egg').Service
const fs = require('fs')
const path = require('path')
const xss = require('xss')
const uuidv4 = require('uuid/v4')

class GoodsService extends Service {
  async addOrEdit(req) {
    const { helper } = this.ctx
    const { mysql } = this.app

    try {
      const { uid, id, name, stock, price, title, description, type, category_id, files } = req

      const userInfo = await mysql.get('user_info', { id: uid })
      if (userInfo.type === '0') {
        this.ctx.status = 403
        return helper.response.error('非法操作')
      }

      const validateMessage = helper.validateForm([
        { value: name, name: '商品名称', required: true },
        { value: stock, name: '库存数量', required: true, type: 'posInteger' },
        { value: price, name: '商品价格', required: true, type: 'number' },
        { value: title, name: '标题', required: true },
        { value: type, name: '商品类型', required: true },
        { value: category_id, name: '分类', required: true }
      ])

      if (validateMessage) return helper.response.error(validateMessage)

      const FILE_TYPE = ['image/jpeg', 'image/png']
      for (const file of files) {
        if (!FILE_TYPE.includes(file.mime)) {
          this.ctx.status = 415
          return helper.response.error('请上传图片格式')
        }
      }

      // 获取缩略图和详情图
      const icon = files.find(file => file.field === 'icon')
      let picture = []
      files.forEach(file => {
        if (file.field === 'picture') picture.push(file)
      })

      if (!icon) return helper.response.error('缩略图不能为空')

      // 配置缩略图和详情图的公共路径
      const commonIconPath = `/public/images/goods_icon/${uuidv4() + path.extname(icon.filepath)}`
      const commonPicturePath = picture.map(file => {
        return `/public/images/goods_detail/${uuidv4() + path.extname(file.filepath)}`
      })

      const { protocol, host, port } = this.config
      const databaseIconPath = `${protocol}://${host}:${port}${commonIconPath}`
      const databasePicturePath = []

      // 将缩略图保存在本地
      const writeIconPath = path.join(__dirname, '../', commonIconPath)
      const reader = fs.createReadStream(icon.filepath)
      const writer = fs.createWriteStream(writeIconPath)
      reader.pipe(writer)

      // 将详情图保存在本地
      for (const [index, file] of picture.entries()) {
        const currentPath = commonPicturePath[index]

        databasePicturePath.push(`${protocol}://${host}:${port}${currentPath}`)

        const writePicturePath = path.join(__dirname, '../', currentPath)
        const reader = fs.createReadStream(file.filepath)
        const writer = fs.createWriteStream(writePicturePath)
        reader.pipe(writer)
      }

      const commonGoodsData = {
        name: xss(name),
        stock,
        price,
        title: xss(title),
        icon: databaseIconPath,
        picture: databasePicturePath.join(','),
        description,
        type,
        category_id
      }

      let result
      if (id) result = await mysql.update('goods_info', { id, ...commonGoodsData })
      else result = await mysql.insert('goods_info', commonGoodsData)

      return result.affectedRows === 1 ? helper.response.success() : helper.response.error('操作失败')
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
      const { uid, id, status } = req

      const userInfo = await mysql.get('user_info', { id: uid })
      if (userInfo.type === '0') {
        this.ctx.status = 403
        return helper.response.error('非法操作')
      }

      const validateMessage = helper.validateForm([
        { value: id, name: '商品ID', required: true },
        { value: status, name: '商品状态', required: true }
      ])

      if (validateMessage) return helper.response.error(validateMessage)

      const result = await mysql.update('goods_info', { id, status })

      return result.affectedRows === 1 ? helper.response.success() : helper.response.error('操作失败')
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
      if (!req.id) return helper.response.error('商品id不能为空')

      const result = await mysql.get('goods_info', { id: req.id })

      return helper.response.success(result)
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
      const { id, name, type, status, category_id, pageNo = 1, pageSize = 10 } = req
      const conditionArray = []
      let condition

      id && conditionArray.push(`id = ${id}`)
      name && conditionArray.push(`name LIKE '%${name}%'`)
      type && conditionArray.push(`type = ${type}`)
      status && conditionArray.push(`status = ${status}`)
      category_id && conditionArray.push(`category_id = ${category_id}`)

      if (!conditionArray.length) condition = ''
      else condition = `WHERE ${conditionArray.join(' AND ')}`

      // 分页数据
      const result = await mysql.query(
        `SELECT * FROM goods_info ${condition} ORDER BY id DESC 
        LIMIT ${(pageNo - 1) * pageSize}, ${pageSize}`
      )
      // 数据总数
      const totalCount = await mysql.query(`SELECT COUNT(*) AS count FROM goods_info ${condition}`)

      return helper.response.success({ result, totalCount: totalCount[0].count })
    } catch (error) {
      this.logger.error(error)
      this.ctx.status = 500
      return helper.response.error('服务器内部异常')
    }
  }

  async searchGoods(req) {
    const { helper } = this.ctx
    const { mysql } = this.app

    try {
      const value = req.value

      if (!value) return helper.response.error('搜索关键词不能为空')

      const idCondition = isNaN(Number(value)) ? '' : `id = ${value} OR `
      const condition = `WHERE ${idCondition} name LIKE '%${value}%'`
      const result = await mysql.query(`SELECT * FROM goods_info ${condition}`)

      return helper.response.success(result)
    } catch (error) {
      this.logger.error(error)
      this.ctx.status = 500
      return helper.response.error('服务器内部异常')
    }
  }
}

module.exports = GoodsService
