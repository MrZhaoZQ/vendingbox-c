<script>
	import { getQueryStr } from '@/utils/tools.js'
	export default {
		globalData: {
			machId: "" // machId=YB96C
		},
		onLaunch: function(e) {
			// console.log('App Launch', e)
			
			// 获取普通二维码（合一码）打开小程序的参数
			if (e.query && e.query.q) {
				let qrUrl = decodeURIComponent(e.query.q)
				this.globalData.machId = getQueryStr(qrUrl, 'machId')
			}
			
			// 获取柜码参数
			if (e.query && e.query.machId) {
				this.globalData.machId = e.query.machId
			}
		},
		onShow: function(e) {
			// console.log('App Show', e)
			
			// 再次获取普通二维码（合一码）打开小程序的参数，以免扫码后再次扫另一新的码参数未更新
			if (e.query && e.query.q) {
				let qrUrl = decodeURIComponent(e.query.q)
				this.globalData.machId = getQueryStr(qrUrl, 'machId')
			}
			
			// 再次获取柜码参数，以免扫码后再次扫另一新的码参数未更新
			if (e.query && e.query.machId) {
				this.globalData.machId = e.query.machId
			}
		},
		onHide: function() {
			// console.log('App Hide')
		}
	}
</script>

<style>
	/* 主色：#e27b26 / rgb(226 123 38) */
	
	/*每个页面公共css */
	.container {
		width: 100%;
		font-size: 28rpx;
	}
	
	/* 去除按钮的默认样式 */
	button {
		margin: 0;
		padding: 0;
		border: none;
		background-color: #fff;
		font-size: 28rpx;
	}
	button:after {
		content: none;
	}
</style>
