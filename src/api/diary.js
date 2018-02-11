/**
 * Created by lvxing on 09/11/17.
 */
import fetch from '@/utils/fetch'

export function getList(params) {
  return fetch({
    url: '/petdiary/getPetDiaryList',
    method: 'get',
    params
  })
}

export function deleteAny(params) {
  return fetch({
    url: '/petdiary/batchDel',
    method: 'post',
    data: {
      'Ids': params
    }
  })
}
