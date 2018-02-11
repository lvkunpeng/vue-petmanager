import Cookies from 'js-cookie'

// const TokenKey = 'Admin-Token'
// 后台设置的cooike  Key
const TokenKey = 'JSESSIONID'
const UserId = 'UserId'
export function getToken() {
  // console.log('获取登录状态')
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  // console.log('保存登录状态')
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  // console.log('取消登录状态')
  return Cookies.remove(TokenKey)
}

/**
 * 设置用户id储存在cooike中
 * @param token
 */
export function setUToken(token) {
  return Cookies.set(UserId, token)
}

export function getUToken() {
  return Cookies.get(UserId)
}

export function removeUToken() {
  return Cookies.remove(UserId)
}
