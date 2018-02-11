import { asyncRouterMap, constantRouterMap } from '@/router/index'

/**
 * 通过meta.limits判断是否与当前用户权限匹配
 * @param roles 通过后台查询的用户可访问路由列表数组中一项
 * @param route 全部预设路由列表数组中一项
 */
function hasPermission(roles, route) {
  if (route.meta && route.meta.limits) {
    return roles.some(role => {
      return route.meta.limits[0] == role.id
    })
    // some方法返回一个boolen值
    // == 不能改成=== 类型不同
    // 此处留有一个问题，现在的判断是基于 meta是否有后台对应的 meta，但是后台目前是将期全部返回，需要后期联系后台修改，或者使用传回的enabled判断
  } else {
    return true
  }
}

/**
 * 当前用户路由过滤器-递归过滤异步路由表，返回符合用户角色权限的路由表
 * @param asyncRouterMap 全部路由列表
 * @param roles 当前的的角色
 */
function filterAsyncRouter(asyncRouterMap, roles) {
  const accessedRouters = asyncRouterMap.filter(route => {
    if (hasPermission(roles, route)) {
      if (route.children && route.children.length) {
        route.children = filterAsyncRouter(route.children, roles)
      }
      return true
    }
    return false
  })
  return accessedRouters
}

const permission = {
  state: {
    routers: constantRouterMap,
    addRouters: []
  },
  mutations: {
    SET_ROUTERS: (state, routers) => {
      state.addRouters = routers
      state.routers = constantRouterMap.concat(routers)
    }
  },
  actions: {
    /**
     * 路由生成器
     * @param commit
     * @param data
     * @returns {Promise}
     * @constructor
     */
    GenerateRoutes({ commit }, data) {
      return new Promise(resolve => {
        const { roles } = data
        // console.log(roles)
        let accessedRouters
        // 创建一个允许访问的路由列表
        if (roles.indexOf('admin') >= 0) {
          // 如果请求的角色为admin管理员则允许列表等于导入的路由列表中的asyncRouterMap也就是所有的路由权限
          accessedRouters = asyncRouterMap
        } else {
          // 如果不是管理员角色的话，执行filter方法，并将全部的路由asyncRouterMap跟当前的角色名，当做参数传入，得到返回的允许路由列表
          accessedRouters = filterAsyncRouter(asyncRouterMap, roles)
          console.log(accessedRouters)
        }
        commit('SET_ROUTERS', accessedRouters)
        resolve()
      })
    }
  }
}

export default permission
