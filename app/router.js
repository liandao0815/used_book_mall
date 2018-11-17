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
}
