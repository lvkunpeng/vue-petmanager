import fetch from '@/utils/fetch'
export function login(username, password) {
  return fetch({
    url: '/ajaxLogin',
    method: 'post',
    data: {
      username,
      password
    }
  })
  // return fetch.post('/ajaxLogin', querystring.stringify({ 'username': username, 'password': password }))
}

/**
 * 测试真实登录后台
 * @param {用户名} username
 * @param {密码} password
 */
// export function login(username, password) {
//   // 由于后台的springMVC用post-paramer接受参数所以要用axios的字符串的形式发送，详情见印象笔记axios分类
//   axios.post('http://139.219.71.184/ajaxLogin', querystring.stringify({ 'username': username, 'password': password }))
//   .then({
//     function(response) {
//       return response.data
//     }
//   })
//   .catch({
//     function(response) {
//       console.log(response.error)
//     }
//   })
//   // return axios({
//   //   url: 'http://139.219.71.184/ajaxLogin',
//   //   method: 'POST',
//   //   data: {
//   //     username: username,
//   //     password: password
//   //   }
//   // })
//   // .catch(function(err) {
//   //   console.log(err)
//   // })
// }

export function getInfo(userId) {
  return fetch({
    url: '/getPermissionTree',
    method: 'post',
    data: {
      'user_id': userId
    }
  })
  // return fetch.post('/getPermissionTree', querystring.stringify({ 'user_id': userId }))
}

export function logout() {
  return fetch({
    url: '/logout',
    method: 'get'
  })
}
