import { request } from "./request"

/**
 * @description 微信小程序登录
 * @param {*} data 
 */
export function wxLogin(data) {
	return request({
		url: '/Mini/Login',
		method: 'post',
		data
	})
}

/**
 * @description 授权获取微信手机号
 * @param {*} data 
 */
export function getWxPhoneNumber(data) {
	return request({
		url: '/Mini/getPhoneNumber',
		method: 'post',
		data
	})
}

/**
 * @description 获取用户信息
 * @param {*} data 
 */
export function getUserInfo(data) {
	return request({
		url: '/Mini/getCustomerInfo',
		method: 'post',
		data
	})
}