/**
 * @description // 获取url路径中的参数
 * @param {*} data 
 */
export function getQueryStr(url, name) {
	const reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
	const search = url.split('?')[1] || '';
	const r = search.match(reg) || [];
	return r[2];
}