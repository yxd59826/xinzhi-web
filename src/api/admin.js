import request from '@/utils/request'

// ----------------菜单管理----------------
/**
 * 菜单列表
 * @param {{pid: *}} params 请求参数
 */
export function menuList(params) {
  return request({
    url: '/admin/AdminMenu/menuList',
    method: 'get',
    params: params
  })
}

export function menuEdit(data) {
  return request({
    url: '/admin/AdminMenu/menuEdit',
    method: 'post',
    data
  })
}

export function menuAdd(data) {
  return request({
    url: '/admin/AdminMenu/menuAdd',
    method: 'post',
    data
  })
}

export function buildMenus() {
  return request({
    url: 'admin/AdminMenu/buildMenus',
    method: 'get'
  })
}
