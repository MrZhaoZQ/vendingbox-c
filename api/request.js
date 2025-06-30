// 配置域名
const BASE_URL = "https://boxmp.banary.cn:40903/api"
const LOGIN_URLS = ["/Mini/Login"]

/**
 * 请求
 */
export function request({url, data, method}) {
	return new Promise((resolve, reject) => {
		let customerId = uni.getStorageSync('customerId')
		// 判断是否需要登录
		if (!customerId && !LOGIN_URLS.includes(url)) {
			// 重定向到首页走登录的逻辑
			return uni.reLaunch({
				url: '/pages/index/index?machId=' + getApp().globalData.machId
			})
		}
		uni.request({
			url: url.indexOf("http") > -1 ? url : BASE_URL + url,
			data: {customerId, ...data},
			method: method.toUpperCase(),
			header: {
				"content-type": "application/json; charset=utf-8"
			},
			dataType: "json",
			success: res => {
				// console.log(res)
				if (res.statusCode == 200 && res.errMsg == "request:ok") {
					if (res.data) {
						if (res.data.errcode == 0) {
							resolve(res.data);
						} else {
							reject(res.data.errmsg);
						}
					} else {
						reject("数据异常，请稍后再试~");
					}
				} else {
					reject(res.data?.errmsg || res.errMsg || "网络异常，请稍后再试~");
				}
			},
			fail: err => {
				// console.log(err);
				reject(err.errMsg || "网络异常，请稍后再试");
			}
		})
	})
}