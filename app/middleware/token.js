const jwt = require('jsonwebtoken')

module.exports = (options, app) => async (ctx, next) => {
  const filterUrlArray = [
    '/api/user/login',
    '/api/user/register',
    '/api/category/getCategoryList',
    '/api/goods/getGoodsDetail',
    '/api/goods/getGoodsList',
    '/api/goods/searchGoods',
    '/api/banner/getBannerList',
    '/api/assess/getGoodsAssess'
  ]

  if (filterUrlArray.includes(ctx.path)) {
    await next()
    return
  }

  try {
    const initToken = ctx.headers.authorization
    const token = initToken ? ctx.headers.authorization.replace('Bearer ', '') : ''
    const uid = ctx.query.uid
    const userInfo = await app.mysql.get('user_info', { token, id: uid })

    if (!userInfo) {
      ctx.status = 401
      ctx.body = ctx.helper.response.error('登录状态失效，请登录后再试')
      return
    }

    if (userInfo.status === '1') {
      ctx.status = 403
      ctx.body = ctx.helper.response.error('账号已经被冻结，禁止访问')
      return
    }

    try {
      jwt.verify(token, options.keys)
    } catch (error) {
      app.logger.error(error)
      ctx.status = 401
      ctx.body = ctx.helper.response.error('token失效，请登录后再试')
      return
    }

    await next()
  } catch (error) {
    app.logger.error(error)
    ctx.status = 500
    ctx.body = ctx.helper.response.error('服务器内部异常')
  }
}
