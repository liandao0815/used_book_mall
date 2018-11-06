// 中间件的配置信息
const middlewareConfig = {
  token: {
    keys: 'NcAyxSu2lIEvy3tQTPmLhq@qHkk*YhJFeF9ba*vUV1X0zygB3VKMNrC!bepoWDp4VCoY26PW',
    expiresIn: '1d'
  }
}

module.exports = {
  // Cookie 安全字符串
  keys: 'IeB4wc&L14JjfB4G$SXcls^dX&eWkWAVkuFfM_Wx&EU1_L9KB_!VwTIX8yWcY5IQfZ$K$FC8',
  // Security 配置
  security: {
    csrf: false
  },
  // MySQL 配置
  mysql: {
    client: {
      host: 'localhost', // host, 或者 127.0.0.1
      port: '3306', // 端口号
      user: 'root', // 用户名
      password: '123456', // 密码
      database: 'used_book_mall' // 数据库名
    }
  },
  // 文件上传配置
  multipart: {
    mode: 'file'
  },
  // 密码加密 key
  salt: '!Btr@WBdFsvUKx7!IQ5sNo6Givpkz@$NS345jHQnaOUYuOqV6*da&6ompDLmvfvn&pYZZMHV',
  // 中间件配置，按顺序执行
  middleware: ['cors', 'token'],
  ...middlewareConfig
}
