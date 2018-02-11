import axios from 'axios'
import { Message } from 'element-ui'
import store from '../store'
import { getToken } from '@/utils/auth'
const querystring = require('querystring')
axios.defaults.withCredentials = true
// 创建axios实例
const service = axios.create({
  baseURL: process.env.BASE_API, // api的base_url
  timeout: 15000                  // 请求超时时间
  // headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
})

// request拦截器
service.interceptors.request.use(config => {
  if (config.method === 'post' || config.method === 'get') {
    // 当请求为post请求时，先进行一次转化在发送请求，注意params没有进行转化，不能直接使用
    if (config.data && !config.flag) {
      config.data = querystring.stringify(config.data)
    }
  }
  if (store.getters.token) {
    config.headers['JSESSIONID'] = getToken() // 让每个请求携带自定义token 请根据实际情况自行修改
  }
  return config
}, error => {
  // Do something with request error
  console.log(error) // for debug
  Promise.reject(error)
})

// respone拦截器
service.interceptors.response.use(
  response => {
  /**
  * post请求正常返回201 get请求正常返回200
  */
    // const res = response.data
    // 暂时不判断返回代码
    // if (res.status !== 200 && res.status !== 201) {
    //   console.log(res.status)
    //   Message({
    //     message: res.data,
    //     type: 'error',
    //     duration: 5 * 1000
    //   })

    //   // 50008:非法的token; 50012:其他客户端登录了;  50014:Token 过期了;
    //   if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
    //     MessageBox.confirm('你已被登出，可以取消继续留在该页面，或者重新登录', '确定登出', {
    //       confirmButtonText: '重新登录',
    //       cancelButtonText: '取消',
    //       type: 'warning'
    //     }).then(() => {
    //       store.dispatch('FedLogOut').then(() => {
    //         location.reload()// 为了重新实例化vue-router对象 避免bug
    //       })
    //     })
    //   }
    //   return Promise.reject('error')
    // } else {
    //   return response.data
    // }
    return response.data
  },
  error => {
    console.log('err' + error)// for debug
    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service
