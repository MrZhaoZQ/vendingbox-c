import { request } from "./request"

/**
 * @description 创建微信支付分订单
 * @param {*} data 
 */
export function createWxScoreOrder(data) {
	return request({
		url: '/Mini/createOrder',
		method: 'post',
		data
	})
}

/**
 * @description 打开柜门
 * @param {*} data 
 */
export function openDoor(data) {
	return request({
		url: '/Mini/OpenDoor',
		method: 'post',
		data
	})
}

/**
 * @description 获取柜门状态
 * @param {*} data 
 * @return {Object} orderId, status: 23 => 已关门 
 */
export function getDoorStatus(data) {
	return request({
		url: '/Mini/checkDoorStatus',
		method: 'post',
		data
	})
}

/**
 * @description 获取我的订单
 * @param {*} data 
 */
export function getOrderList(data) {
	return request({
		url: '/Mini/getOrders',
		method: 'post',
		data
	})
}

/**
 * @description 获取订单详情
 * @param {*} data 
 */
export function getOrderDetail(data) {
	return request({
		url: '/Mini/getOrderDetail',
		method: 'post',
		data
	})
}
