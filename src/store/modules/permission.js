import { asyncRoutes, constantRoutes } from '@/router'
import { buildMenus } from '@/api/admin'
import Layout from '@/layout'

/**
 * Use meta.role to determine if the current user has permission
 * @param roles
 * @param route
 */
function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.includes(role))
  } else {
    return true
  }
}
export const loadView = (view) => {
  return (resolve) => require([`@/views/${view}`], resolve)
}
export function formatMenu(routes, data) {
  data.forEach(item => {
    if (item.component !== '') {
      let sub_view = item.component
      sub_view = sub_view.replace(/^\/*/g, '')
      item.component = loadView(sub_view)
    } else {
      item.component = Layout
    }
    if (item.hidden === 0) {
      item.hidden = false
    }
    if (item.hidden === 1) {
      item.hidden = true
    }
    const menu = {
      path: item.path,
      component: item.component,
      hidden: item.hidden,
      name: item.name,
      children: [],
      meta: {
        title: item.title,
        icon: item.icon
      }
    }
    if (item.children && item.children.length) {
      menu.alwaysShow = true
      formatMenu(menu.children, item.children)
    }
    routes.push(menu)
  })
}

/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param roles
 */
export function filterAsyncRoutes(routes, roles) {
  const res = []
  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles)
      }
      res.push(tmp)
    }
  })

  return res
}

const state = {
  routes: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  }
}

const actions = {
  generateRoutes({ commit }, roles) {
    return new Promise(resolve => {
      const loadMenuData = []
      // 先查询后台并返回左侧菜单数据并把数据添加到路由  ****************此处为修改部分
      buildMenus(state.token).then(response => {
        let data = response
        data = response.data
        Object.assign(loadMenuData, data)
        const tempAsyncRoutes = Object.assign([], asyncRoutes)
        formatMenu(tempAsyncRoutes, loadMenuData)
        let accessedRoutes
        if (roles.includes('admin')) {
          accessedRoutes = tempAsyncRoutes || []
        } else {
          accessedRoutes = filterAsyncRoutes(tempAsyncRoutes, roles)
        }
        commit('SET_ROUTES', accessedRoutes)
        resolve(accessedRoutes)
      })
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
