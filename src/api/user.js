import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/AdminLogin',
    method: 'post',
    data
  })
}

export function getInfo(params) {
  return request({
    url: '/admin/AdminMy/myInfo',
    method: 'get',
    params: params
  })
}

export function logout(data) {
  return request({
    url: '/AdminLogout',
    method: 'post',
    data
  })
}

export function getCodeImg() {
  return request({
    url: '/admin/AdminCode/getCode',
    method: 'get'
  })
}
