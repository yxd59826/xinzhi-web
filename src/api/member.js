import request from '@/utils/request'

// ----------------会员管理----------------
/**
 * 会员列表
 * @param {array} params 请求参数
 */
export function memberList(params) {
  return request({
    url: '/admin/Member/MemberList',
    method: 'get',
    params: params
  })
}

/**
 *
 * @param data
 * @returns {AxiosPromise}
 */
export function memberAdd(data) {
  return request({
    url: '/admin/Member/memberAdd',
    method: 'post',
    data
  })
}

export function memberEdit(data) {
  return request({
    url: '/admin/Member/memberEdit',
    method: 'post',
    data
  })
}

export function memberDisable(data) {
  return request({
    url: '/admin/Member/memberAdd',
    method: 'post',
    data
  })
}
