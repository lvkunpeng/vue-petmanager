import fetch from '@/utils/fetch'

// 资讯列表
/**
 * 获取文章列表信息
 * @param 分页信息
 */
export function getList(params) {
  return fetch({
    url: '/news/getNewsList',
    method: 'get',
    params
  })
}
/**
 * 获取单篇文章详情
 * @param 文章id
 */
export function getDetail(params) {
  return fetch({
    url: '/news/get/' + params.id,
    method: 'get'
  })
}
/**
 * 保存文章
 * @param 文章id
 */
export function saveArticle(params) {
  return fetch({
    url: '/news/edit',
    method: 'post',
    data: params
  })
}

export function deleteArticleAny(params) {
  return fetch({
    url: '/news/batchDel',
    method: 'post',
    data: {
      'newsIds': params
    }
  })
}
// 评论管理
export function getCommentList(params) {
  return fetch({
    url: '/comment/getCommentList',
    method: 'get',
    params
  })
}

export function deleteAny(params) {
  return fetch({
    url: '/comment/batchDel',
    method: 'post',
    data: {
      'commentIds': params
    }
  })
}

// 轮播图管理

export function getBannerList(params) {
  return fetch({
    url: '/slides/getSlidesPage',
    method: 'get',
    params
  })
}

export function deleteAnyBanner(params) {
  return fetch({
    url: '/slides/batchDel',
    method: 'post',
    data: {
      'slidesId': params
    }
  })
}

export function addBannerList(params) {
  return fetch({
    url: '/slides/add',
    method: 'post',
    params
  })
}

export function editBannerList(params) {
  return fetch({
    url: '/slides/edit',
    method: 'post',
    params
  })
}
