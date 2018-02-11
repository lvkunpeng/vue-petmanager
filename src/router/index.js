import Vue from 'vue'
import Router from 'vue-router'
const _import = require('./_import_' + process.env.NODE_ENV)
// in development env not use Lazy Loading,because Lazy Loading too many pages will cause webpack hot update too slow.so only in production use Lazy Loading

/* layout */
import Layout from '../views/layout/Layout'

Vue.use(Router)

 /**
  * icon : the icon show in the sidebar
  * hidden : if `hidden:true` will not show in the sidebar
  * redirect : if `redirect:noredirect` will not redirct in the levelbar
  * noDropdown : if `noDropdown:true` will not has submenu in the sidebar
  * meta : `{ role: ['admin'] }`  will control the page role
  **/
export const constantRouterMap = [
  { path: '/login', component: _import('login/index'), hidden: true },
  { path: '/404', component: _import('404'), hidden: true },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    name: '用户统计',
    hidden: true,
    children: [{ path: 'dashboard', component: _import('dataview/userdata') }]
  }
]

export default new Router({
  // mode: 'history', //后端支持可开
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRouterMap
})

export const asyncRouterMap = [
  // {
  //   path: '/example',
  //   component: Layout,
  //   redirect: 'noredirect',
  //   name: 'Example',
  //   icon: 'zujian',
  //   hidden: true,
  //   children: [
  //     { path: 'index', name: 'Form', icon: 'zonghe', component: _import('page/form') }
  //   ]
  // },

  // {
  //   path: '/table',
  //   component: Layout,
  //   redirect: '/table/index',
  //   icon: 'tubiao',
  //   noDropdown: true,
  //   hidden: true,
  //   children: [{ path: 'index', name: 'Table', component: _import('table/index'), meta: { limits: [100] }}]
  // },
  {
    path: '/dataview',
    component: Layout,
    redirect: 'noredirect',
    name: '数据统计',
    icon: 'tubiao',
    children: [
      { path: 'userdata', name: '用户统计', icon: 'zonghe', component: _import('dataview/userdata'), meta: { limits: [300] }},
      { path: 'petdata', name: '宠物统计', icon: 'zonghe', component: _import('dataview/petdata'), meta: { limits: [301] }},
      { path: 'diarydata', name: '日记统计', icon: 'zonghe', component: _import('dataview/diarydata'), meta: { limits: [302] }}
    ]
  },
  {
    path: '/diary',
    component: Layout,
    redirect: '/diary/diarylist',
    icon: 'shouce',
    noDropdown: true,
    children: [{ path: 'index', name: '日记管理', component: _import('diary/diarylist'), meta: { limits: [293] }}]
  },
  {
    path: '/pet',
    component: Layout,
    redirect: '/pet/index',
    icon: 'pet',
    noDropdown: true,
    children: [{ path: 'index', name: '宠物管理', component: _import('pet/index'), meta: { limits: [294] }}]
  },
  {
    path: '/news',
    component: Layout,
    name: '资讯管理',
    redirect: 'noredirect',
    icon: 'news',
    children: [
      { path: 'list', name: '资讯列表', icon: 'zonghe', component: _import('news/newlist'), meta: { limits: [296] }},
      { path: 'comment', name: '评论管理', icon: 'zonghe', component: _import('news/newcomment'), meta: { limits: [297] }},
      { path: 'banner', name: '轮播图管理', icon: 'zonghe', component: _import('news/banner'), meta: { limits: [298] }},
      { path: 'edit', name: '编辑资讯', icon: 'zonghe', component: _import('news/test2'), hidden: true, meta: { limits: [296] }},
      { path: 'test', name: '测试', icon: 'zonghe', component: _import('news/test2'), hidden: true, meta: { limits: [296] }}
    ]
  },
  {
    path: '/user',
    component: Layout,
    redirect: 'noredirect',
    icon: 'users',
    noDropdown: true,
    children: [{ path: 'index', name: '用户管理', component: _import('user/userlist'), meta: { limits: [299] }}]
  },
  {
    path: '/authority',
    component: Layout,
    redirect: 'noredirect',
    name: '权限管理',
    icon: 'quanxian',
    children: [
      { path: 'admin', name: '管理员管理', icon: 'zonghe', component: _import('authority/admin'), meta: { limits: [304] }},
      { path: 'role', name: '角色管理', icon: 'zonghe', component: _import('authority/role'), meta: { limits: [305] }}
    ]
  },
  {
    path: '/system',
    component: Layout,
    redirect: 'noredirect',
    name: '系统管理',
    icon: 'zujian',
    children: [
      { path: 'feedbacklist', name: '反馈列表', icon: 'zonghe', component: _import('system/feedbacklist'), meta: { limits: [307] }},
      { path: 'aboutus', name: '关于我们', icon: 'zonghe', component: _import('system/aboutus'), meta: { limits: [308] }},
      { path: 'knowcard', name: '知识卡片', icon: 'zonghe', component: _import('system/knowcard'), meta: { limits: [309] }}
    ]
  },

  { path: '*', redirect: '/404', hidden: true }
]
