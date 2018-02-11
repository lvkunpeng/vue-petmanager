
import fetch from '@/utils/fetch'

export function getList(params) {
  return fetch({
    url: '/user/getUserList',
    method: 'get',
    params
  })
}

export function deleteAny(params) {
  return fetch({
    url: '/user/batchDel',
    method: 'post',
    data: {
      'userIds': params
    }
  })
}

export function enableUser(params) {
  return fetch({
    url: '/user/enable',
    method: 'post',
    data: {
      'userId': params
    }
  })
}
