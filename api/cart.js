import { request } from "./request"

/**
 * @description 获取当前柜子售卖的商品分类及列表
 * @param {*} data 
 */
export function getGoodsListByMach(data) {
	return request({
		url: '/Mini/getProductGroupByCategory',
		method: 'post',
		data
	})
}

/**
 * @description 获取购物车列表
 * @param {*} data 
 */
export function getCartList(data) {
	return request({
		url: '',
		method: 'post',
		data
	})
}

/**
 * @description 清空购物车
 * @param {*} data 
 */
export function clearCartList(data) {
	return request({
		url: '',
		method: 'post',
		data
	})
}

/**
 * @description 添加/修改购物车商品
 * @param {*} data 
 */
export function updateCartList(data) {
	return request({
		url: '',
		method: 'post',
		data
	})
}
