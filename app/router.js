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
}
