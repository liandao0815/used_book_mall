module.exports = app => {
  const { router, controller } = app

  // user 路由配置
  router.post('/api/user/login', controller.user.login)
  router.post('/api/user/register', controller.user.register)
  router.get('/api/user/getUserInfo', controller.user.getUserInfo)
}
