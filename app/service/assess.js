const Service = require('egg').Service
const xss = require('xss')

class AssessService extends Service {
  async create(req) {
    const { helper } = this.ctx
    const { mysql } = this.app

    try {
      const { uid, content, score, rank = '0', goods_id } = req

      const validateMessage = helper.validateForm([
        { value: content, name: '评价内容', required: true, maxLength: 100 },
        { value: score, name: '评价分数', required: true, type: 'score' },
        { value: goods_id, name: '商品ID', required: true }
      ])

      if (validateMessage) return helper.response.error(validateMessage)

      const checkData = await this._checkStatus({ uid, goods_id })
      const assessInfo = await mysql.get('assess_info', { user_id: uid, goods_id })

      if (checkData.data === '0') {
        return helper.response.error('请购买该商品再来评价')
      } else if (assessInfo) {
        return helper.response.error('你已经评价过商品')
      } else {
        const assessData = {
          content: xss(content),
          score,
          rank,
          user_id: uid,
          goods_id
        }
        const result = await mysql.insert('assess_info', assessData)

        return result.affectedRows === 1 ? helper.response.success() : helper.response.error('操作失败')
      }
    } catch (error) {
      this.logger.error(error)
      this.ctx.status = 500
      return helper.response.error('服务器内部异常')
    }
  }

  async _checkStatus(req) {
    const { helper } = this.ctx
    const { mysql } = this.app

    try {
      const { uid, goods_id } = req

      if (!goods_id) return helper.response.error('商品ID不能为空')

      const orderInfo = await mysql.get('order_info', { goods_id, user_id: uid })
      const result = orderInfo ? '1' : '0'

      return helper.response.success(result)
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

      if (!id) return helper.response.error('商品评价ID不能为空')

      const adminIofo = await mysql.get('user_info', { id: uid, type: '2' })

      if (!adminIofo) {
        this.ctx.status = 403
        return helper.response.error('非法操作')
      } else {
        const result = await mysql.delete('assess_info', { id })

        return result.affectedRows === 1 ? helper.response.success() : helper.response.error('操作失败')
      }
    } catch (error) {
      this.logger.error(error)
      this.ctx.status = 500
      return helper.response.error('服务器内部异常')
    }
  }

  async getGoodsAssess(req) {
    const { helper } = this.ctx
    const { mysql } = this.app

    try {
      const { goods_id } = req

      if (!goods_id) return helper.response.error('商品ID不能为空')

      const assessListSql = `SELECT a.id, a.content, a.score, a.rank, a.priority, a.create_time,
       u.account, u.avatar FROM assess_info AS a 
       INNER JOIN user_info AS u ON a.user_id = u.id 
       WHERE a.goods_id = ${goods_id} ORDER BY a.create_time DESC`
      const assessList = await mysql.query(assessListSql)

      const rankData = await mysql.query(
        `SELECT COUNT(a.rank) AS count, a.rank FROM assess_info AS a
        WHERE a.goods_id = ${goods_id} GROUP BY a.rank`
      )
      const averageScore = await mysql.query(
        `SELECT AVG(score) AS average FROM assess_info WHERE goods_id = ${goods_id}`
      )

      const assessLength = assessList.length
      const rankPercent = rankData.map(data => ({
        rank: data.rank,
        percent: (Number.parseInt(data.count) / assessLength).toFixed(2)
      }))

      const result = {
        rankPercent,
        assessList,
        length: assessLength,
        average: averageScore[0].average
      }

      return helper.response.success(result)
    } catch (error) {
      this.logger.error(error)
      this.ctx.status = 500
      return helper.response.error('服务器内部异常')
    }
  }

  async getAssessList(req) {
    const { helper } = this.ctx
    const { mysql } = this.app

    try {
      const { uid, goods_id, account, pageNo = 1, pageSize = 10 } = req

      const adminIofo = await mysql.get('user_info', { id: uid, type: '2' })

      if (!adminIofo) {
        this.ctx.status = 403
        return helper.response.error('非法操作')
      } else {
        const conditionArray = []
        let condition

        goods_id && conditionArray.push(`a.goods_id = ${goods_id}`)
        account && conditionArray.push(`u.account LIKE '%${account}%'`)

        if (!conditionArray.length) condition = ''
        else condition = `WHERE ${conditionArray.join(' AND ')}`

        const resultSql = `SELECT a.id, a.goods_id, a.user_id, a.priority, a.create_time, u.account
          FROM assess_info AS a
          INNER JOIN user_info AS u ON u.id = a.user_id
          ${condition}
          ORDER BY a.id DESC 
          LIMIT ${(pageNo - 1) * pageSize}, ${pageSize}`
        const totalCountSql = `SELECT COUNT(*) AS count FROM assess_info AS a 
          INNER JOIN user_info AS u ON u.id = a.user_id ${condition}`

        const result = await mysql.query(resultSql)
        const totalCount = await mysql.query(totalCountSql)

        return helper.response.success({ result, totalCount: totalCount[0].count })
      }
    } catch (error) {
      this.logger.error(error)
      this.ctx.status = 500
      return helper.response.error('服务器内部异常')
    }
  }

  async changePriority(req) {
    const { helper } = this.ctx
    const { mysql } = this.app

    try {
      const { uid, id, priority = '0' } = req

      if (!id) return helper.response.error('商品评价ID不能为空')

      const adminIofo = await mysql.get('user_info', { id: uid, type: '2' })

      if (!adminIofo) {
        this.ctx.status = 403
        return helper.response.error('非法操作')
      } else {
        const result = await mysql.update('assess_info', { id, priority })

        return result.affectedRows === 1 ? helper.response.success() : helper.response.error('操作失败')
      }
    } catch (error) {
      this.logger.error(error)
      this.ctx.status = 500
      return helper.response.error('服务器内部异常')
    }
  }
}

module.exports = AssessService
