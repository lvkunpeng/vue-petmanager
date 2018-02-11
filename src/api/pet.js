/**
 * Created by lvxing on 07/11/17.
 */
import fetch from '@/utils/fetch'

export function getList(params) {
  return fetch({
    url: '/pet/getPetList',
    method: 'get',
    params
  })
}

export function deleteAny(params) {
  return fetch({
    url: '/pet/batchDel',
    method: 'post',
    data: {
      'petIds': params
    }
  })
}
