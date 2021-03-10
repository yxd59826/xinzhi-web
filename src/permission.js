import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { getToken } from '@/utils/auth' // get token from cookie
import getPageTitle from '@/utils/get-page-title'

NProgress.configure({ showSpinner: false }) // 进度条设置，把转圈圈关掉

const whiteList = ['/login', '/auth-redirect'] // 设置白名单

router.beforeEach(async(to, from, next) => {
  // 进度条开始
  NProgress.start()

  // 设置标题
  document.title = getPageTitle(to.meta.title)

  // 第一次登录后会把 token 存在 cookie 中，此处就是通过 cookie 拿 token
  const hasToken = getToken()

  if (hasToken) {
    /* 有 token，证明已成功登录 */
    if (to.path === '/login') {
      // 如果要去登录页，会自动跳转到首页，然后会再次进入这个路由守卫
      next({ path: '/' })
      // 结束进度条
      NProgress.done()
    } else {
      // 在 vuex 中获取用户权限，因为第一次登录时会把请求回来的用户权限存在 vuex 中
      const hasRoles = store.getters.roles && store.getters.roles.length > 0
      if (hasRoles) {
        next()
      } else {
        try {
          // 如果有 token 并且有权限，直接跳转
          // note: roles must be a object array! such as: ['admin'] or ,['developer','editor']
          const { roles } = await store.dispatch('user/getInfo')

          // 筛选动态路由数组
          const accessRoutes = await store.dispatch('permission/generateRoutes', roles)

          // 动态添加筛选后的路由数组
          router.addRoutes(accessRoutes)

          // hack method to ensure that addRoutes is complete
          // replace: true 表示不会记录到浏览器 history
          next({ ...to, replace: true })
        } catch (error) {
          // 获取用户权限报错会要求重新登录，并且删掉 token
          await store.dispatch('user/resetToken')
          Message.error(error || 'Has Error')
          next(`/login?redirect=${to.path}`)
          NProgress.done()
        }
      }
    }
  } else {
    /* 没有 token，证明 token 过期了或者未登录，*/

    if (whiteList.indexOf(to.path) !== -1) {
      // 如果是白名单，直接跳转
      next()
    } else {
      // 要去其他路由，先把路由地址赋值给跳转参数，登陆成功后拿出来跳转。
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  // 结束进度条
  NProgress.done()
})
