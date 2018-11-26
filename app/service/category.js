const Service = require('egg').Service

class CategoryService extends Service {
  async createOrEdit(req) {
    const { helper } = this.ctx
    const { mysql } = this.app

    try {
      const { uid, id, name } = req

      if (!name) return helper.response.error('分类名称不能为空')

      const userInfo = await mysql.get('user_info', { id: uid })

      if (userInfo.type === '0') {
        this.ctx.status = 403
        return helper.response.error('非法操作')
      }

      if (!id) {
        const categoryInfo = await mysql.get('category_info', { name })

        if (categoryInfo) return helper.response.error('该分类已存在')

        const result = await mysql.insert('category_info', { name })

        return result.affectedRows === 1 ? helper.response.success() : helper.response.error('操作失败')
      } else {
        const options = { where: { id } }

        const categoryInfo = await mysql.get('category_info', { name })
        
        if (categoryInfo) return helper.response.error('该分类名称已存在')

        const result = await mysql.update('category_info', { name }, options)

        return result.affectedRows === 1 ? helper.response.success() : helper.response.error('操作失败')
      }
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

      if (!id) return helper.response.error('分类id不能为空')

      const userInfo = await mysql.get('user_info', { id: uid })

      if (userInfo.type === '0') {
        this.ctx.status = 403
        return helper.response.error('非法操作')
      } else {
        const result = await mysql.delete('category_info', { id })

        return result.affectedRows === 1 ? helper.response.success() : helper.response.error('操作失败')
      }
    } catch (error) {
      this.logger.error(error)
      this.ctx.status = 500
      return helper.response.error('服务器内部异常')
    }
  }

  async getCategoryList() {
    const { helper } = this.ctx
    const { mysql } = this.app

    try {
      const result = await mysql.select('category_info', {
        columns: ['id', 'name', 'create_time', 'update_time'],
        orders: [['id', 'desc']]
      })

      return helper.response.success(result)
    } catch (error) {
      this.logger.error(error)
      this.ctx.status = 500
      return helper.response.error('服务器内部异常')
    }
  }

  async getCategoryDetail(req) {
    const { helper } = this.ctx
    const { mysql } = this.app

    try {
      if (!req.id) return helper.response.error('分类id不能为空')

      const result = await mysql.get('category_info', { id: req.id })

      return helper.response.success(result)
    } catch (error) {
      this.logger.error(error)
      this.ctx.status = 500
      return helper.response.error('服务器内部异常')
    }
  }
}

module.exports = CategoryService
