<template>
	<view class="container">
		<icon class="success" size="56" type="success"></icon>
		<text class="title">关门成功</text>
		<view class="payscore">
			<image src="../../static/imgs/wxzff.png" mode="widthFix"></image>
			<text>微信支付分先购后付</text>
		</view>
		<view class="check" @click="toDetailFn">查看订单</view>
		<view class="section">
			<view class="subtitle">
				<uni-icons type="sound" size="26" color="#e27b26"></uni-icons>
				<text>温馨提示</text>
			</view>
			<text class="notice">感谢您的购买！当前服务器算力紧张，请耐心等待结算通知。您可先行离开，无需在设备前等待，欢迎再次购买。</text>
		</view>
	</view>
</template>

<script setup>
	import { onLoad } from '@dcloudio/uni-app';
	let orderId = "";
	// 查看订单
	const toDetailFn = () => {
		uni.redirectTo({
			url: '/pages/order/detail?orderId=' + orderId
		});
	};
	// 监听页面加载
	onLoad((options) => {
		// console.log('onLoad: ', options);
		if (options?.orderId) {
			orderId = options.orderId;
		}
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
	.check {
		width: 456rpx;
		height: 80rpx;
		border: 2rpx #26ab28 solid;
		color: #26ab28;
		text-align: center;
		line-height: 80rpx;
	}
	.section {
		width: 100%;
		box-sizing: border-box;
		padding: 40rpx 30rpx;
		.subtitle {
			display: flex;
			justify-content: flex-start;
			align-items: center;
			text {
				padding-left: 10rpx;
				color: #e27b26;
				font-weight: bolder;
			}
		}
		.notice {
			display: block;
			box-sizing: border-box;
			padding: 30rpx;
			background-color: #FFF9EA;
			color: #e27b26;
		}
	}
</style>