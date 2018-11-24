module.exports = app => {
  const { router, controller } = app

  // user 路由配置
  router.post('/api/user/login', controller.user.login)
  router.post('/api/user/register', controller.user.register)
  router.get('/api/user/getUserInfo', controller.user.getUserInfo)
  router.post('/api/user/addSeller', controller.user.addSeller)
  router.post('/api/user/freezeOrThawUser', controller.user.freezeOrThawUser)
  router.get('/api/user/getUserList', controller.user.getUserList)
  router.post('/api/user/modifyPassword', controller.user.modifyPassword)
  router.post('/api/user/modifyUserInfo', controller.user.modifyUserInfo)
  router.post('/api/user/uploadAvatar', controller.user.uploadAvatar)

  // address 路由配置
  router.post('/api/address/createOrEdit', controller.address.createOrEdit)
  router.get('/api/address/getAddressInfo', controller.address.getAddressInfo)

  // category 路由配置
  router.post('/api/category/createOrEdit', controller.category.createOrEdit)
  router.post('/api/category/delete', controller.category.delete)
  router.get('/api/category/getCategoryList', controller.category.getCategoryList)
  router.get('/api/category/getCategoryDetail', controller.category.getCategoryDetail)

  // goods 路由配置
  router.post('/api/goods/addOrEdit', controller.goods.addOrEdit)
  router.post('/api/goods/changeStatus', controller.goods.changeStatus)
  router.get('/api/goods/getGoodsDetail', controller.goods.getGoodsDetail)
  router.get('/api/goods/getGoodsList', controller.goods.getGoodsList)
  router.get('/api/goods/searchGoods', controller.goods.searchGoods)

  // banner 路由配置
  router.post('/api/banner/createOrEdit', controller.banner.createOrEdit)
  router.post('/api/banner/delete', controller.banner.delete)
  router.get('/api/banner/getBannners', controller.banner.getBannners)
  router.get('/api/banner/getBannnerDetail', controller.banner.getBannnerDetail)

  // cart 路由配置
  router.post('/api/cart/createOrEdit', controller.cart.createOrEdit)
  router.post('/api/cart/delete', controller.cart.delete)
  router.get('/api/cart/getUserCart', controller.cart.getUserCart)

  // order 路由配置
  // router.post('/api/order/create', controller.order.create)
  // router.post('/api/order/delete', controller.order.delete)
  // router.get('/api/order/getUserOrder', controller.order.getUserOrder)
  // router.get('/api/order/getAllOrder', controller.order.getAllOrder)

  // asssess 路由配置
  // router.post('/api/asssess/create', controller.asssess.create)
  // router.post('/api/asssess/delete', controller.asssess.delete)
  // router.get('/api/asssess/getUserAsssess', controller.asssess.getUserAsssess)
  // router.get('/api/asssess/getAllAsssess', controller.asssess.getAllAsssess)
  // router.post('/api/asssess/changePriority', controller.asssess.changePriority)
}
