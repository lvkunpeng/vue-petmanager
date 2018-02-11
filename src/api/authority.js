
import fetch from '@/utils/fetch'
// 管理员管理
export function enabledAny(params) {
  return fetch({
    url: '/admin/enable',
    method: 'post',
    data: {
      'adminId': params
    }
  })
}

export function addAdmin(params) {
  return fetch({
    url: '/admin/add',
    method: 'post',
    params
  })
}

export function editAdmin(params) {
  return fetch({
    url: '/admin/edit',
    method: 'post',
    params
  })
}

export function getList(params) {
  return fetch({
    url: '/admin/getAdminList',
    method: 'get',
    params
  })
}

export function deleteAny(params) {
  return fetch({
    url: '/admin/batchDel',
    method: 'post',
    data: {
      'adminIds': params
    }
  })
}
// 角色管理
export function getRoleList(params) {
  return fetch({
    url: '/role/getRoleList',
    method: 'get',
    params
  })
}

export function newRole(params) {
  return fetch({
    url: '/role/add',
    method: 'post',
    data: {
      'name': params
    }
  })
}

export function editRoleName(params) {
  return fetch({
    url: '/role/edit',
    method: 'post',
    params
  })
}

export function deleteRole(params) {
  return fetch({
    url: '/role/delete',
    method: 'post',
    data: {
      'roleId	': params
    }
  })
}
/**
 * 修改或者提交用户权限
 * @param {*} params
 */
export function changeRoleList(params) {
  return fetch({
    url: '/role/updateRoleRights',
    method: 'post',
    params
  })
}

export function getRoleTree(params) {
  return fetch({
    url: '/getPermissionTree',
    method: 'post',
    data: {
      'user_id': params
    }
  })
}
