import router from './router'
import store from './store'
import NProgress from 'nprogress' // Progress 进度条
import 'nprogress/nprogress.css'// Progress 进度条样式
import { getToken } from '@/utils/auth' // 验权

const whiteList = ['/login']
router.beforeEach((to, from, next) => {
  NProgress.start()
  if (getToken()) {
    // 已经登录成功
    if (to.path === '/login') {
      // 登录成功之后再次请求登录页面跳转到首页
      next({ path: '/' })
    } else {
      // 登录成功之后请求其他页面
      if (store.getters.roles.length === 0) {
        // 如果角色列表中的角色为空的时候
        store.dispatch('GetInfo').then(res => {
          // 在引入的store_user_state中触发一个获取动作，通过Getinfo接口获取用户信息
          const roles = res
          // 在引入的store_user_state中触发一个GenerateRoutes,并将刚才获取的用户角色权限作为参数传入
          store.dispatch('GenerateRoutes', { roles }).then(() => {
            router.addRoutes(store.getters.addRouters)
            next({ ...to })
            // next()
          })
        })
      } else {
        next()
      }
    }
  } else {
    if (whiteList.indexOf(to.path) !== -1) {
      next()
    } else {
      next('/login')
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  NProgress.done() // 结束Progress
})
