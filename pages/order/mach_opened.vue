<template>
	<view class="container">
		<icon class="success" size="56" type="success"></icon>
		<text class="title">开门成功</text>
		<view class="payscore">
			<image src="../../static/imgs/wxzff.png" mode="widthFix"></image>
			<text>微信支付分先购后付</text>
		</view>
		<view class="notice">
			<text>选购过程中请勿让陌生人拿取商品</text>
			<text>选购完成后请及时关门</text>
		</view>
	</view>
</template>

<script setup>
	import { ref } from 'vue';
	import { onLoad, onShow, onUnload } from '@dcloudio/uni-app';
	import { getDoorStatus } from '@/api/order.js';
	let timer = null;
	// 获取柜门状态
	const getDoorStatusFn = (orderId) => {
		getDoorStatus({orderId}).then(res => {
			// console.log(res)
			// status: 23表示柜门已关闭
			if (res.errcode == 0 && (res.data?.status == 23 || res.data?.status == 30 || res.data?.status == 3 || res.data?.status == 5 || res.data?.status == 0)) {
				uni.redirectTo({
					url: '/pages/order/mach_closed?orderId=' + orderId
				});
			} else {
				// 10秒后再次获取柜门状态
				timer = setTimeout(() => {
					getDoorStatusFn(orderId)
				}, 10000);
			}
		}, () => {
			// 10秒后再次获取柜门状态
			timer = setTimeout(() => {
				getDoorStatusFn(orderId)
			}, 10000);
		});
	};
	// 监听页面加载
	onLoad((options) => {
		// console.log('onLoad: ', options);
		if (options?.orderId) {
			getDoorStatusFn(options.orderId)
		}
	});
	// 监听页面显示，页面每次出现在屏幕上都触发
	onShow(() => {
		
	});
	// 监听页面监听页面卸载
	onUnload(() => {
		// 清除定时器
		clearTimeout(timer);
	});
</script>

<style lang="scss" scoped>
	.container {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.success {
		padding: 100rpx 0 20rpx;
	}
	.title {
		margin-bottom: 40rpx;
		font-size: 32rpx;
	}
	.payscore {
		margin-bottom: 40rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		image {
			width: 46rpx;
			height: auto;
			margin-right: 20rpx;
		}
	}
	.notice {
		max-width: 100%;
		box-sizing: border-box;
		padding: 30rpx;
		color: #e27b26;
		font-size: 32rpx;
		font-weight: bolder;
		text-align: center;
		text {
			display: block;
		}
	}
</style>