var merge = require('webpack-merge');
var prodEnv = require('./prod.env');

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  //开发基础mock入口url
  // BASE_API: '"https://easy-mock.com/mock/5950a2419adc231f356a6636/vue-admin"',
  // 自己的mock路径
  // BASE_API: '"https://easy-mock.com/mock/59e4432ddb706138502b81f4/pet"',
   BASE_API: '"http://139.219.71.184"',   
})

