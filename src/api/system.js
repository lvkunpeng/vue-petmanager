import fetch from '@/utils/fetch'

// 意见反馈
/**
 * 获取意见反馈信息
 * @param 分页信息
 */
export function getList(params) {
  return fetch({
    url: '/feedback/getFeedbackList',
    method: 'get',
    params
  })
}
/**
 * 添加阅读状态
 * @param 当前条目id
 */
export function toRead(params) {
  return fetch({
    url: '/feedback/view/' + params,
    method: 'get'
  })
}

/**
 * 删除反馈
 * @param 当前条目id
 */
export function deleteFb(params) {
  return fetch({
    url: '/feedback/batchDel',
    method: 'post',
    data: {
      'feedbackIds': params
    }
  })
}

// 关于我们

/**
 * 获取关于我们列表
 */
export function getUsList() {
  return fetch({
    url: '/about/getAboutList',
    method: 'get'
  })
}

/**
 * 获取编辑关于我们
 */
export function editUsList(params) {
  return fetch({
    url: '/about/editPage/' + params,
    method: 'get'
  })
}

/**
 * 保存关于我们
 */
export function aboutEdit(params) {
  return fetch({
    url: '/about/edit',
    method: 'post',
    data: {
      'id': 1,
      'content': params
    }
  })
}

/**
 * 获取知识卡片列表
 */
export function getTipsList(params) {
  return fetch({
    url: '/tips/getTipsList',
    method: 'get',
    params
  })
}

/**
 * 添加新的知识卡片
 */
export function addTipsList(params) {
  return fetch({
    url: '/tips/add',
    method: 'post',
    params
  })
}
/**
 * 编辑知识卡片
 */
export function editTipsList(params) {
  return fetch({
    url: '/tips/edit',
    method: 'post',
    params
  })
}

/**
 * 删除知识卡片列表
 */
export function deleteTips(params) {
  return fetch({
    url: '/tips/batchDel',
    method: 'post',
    data: {
      'tipsIds': params
    }
  })
}
