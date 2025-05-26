<template>
	<view class="container">
		<view class="user">
			<!-- #ifdef MP-WEIXIN -->
			<open-data type="userAvatarUrl" class="avatar"></open-data>
			<open-data type="userNickName" class="nickname"></open-data>
			<!-- #endif -->
			
			<!-- #ifndef MP-WEIXIN -->
			<image class="avatar" src="" mode="widthFix"></image>
			<view class="nickname"></view>
			<!-- #endif -->
		</view>
		<view class="more">
			<view class="item" @click="toMyOrderListFn">
				<view class="left">
					<uni-icons type="list"></uni-icons>
					<text class="txt">我的订单</text>
				</view>
				<uni-icons type="right" color="#b6b6b6"></uni-icons>
			</view>
			<button class="item contact" open-type="contact">
				<view class="left">
					<uni-icons type="chat"></uni-icons>
					<text class="txt">联系客服</text>
				</view>
				<uni-icons type="right" color="#b6b6b6"></uni-icons>
			</button>
			<button class="item share" open-type="share">
				<view class="left">
					<uni-icons type="redo"></uni-icons>
					<text class="txt">分享给朋友</text>
				</view>
				<uni-icons type="right" color="#b6b6b6"></uni-icons>
			</button>
			<view class="item" @click="toPolicyFn">
				<view class="left">
					<uni-icons type="info"></uni-icons>
					<text class="txt">用户协议</text>
				</view>
				<uni-icons type="right" color="#b6b6b6"></uni-icons>
			</view>
			<!-- <view class="item" @click="toAfterSaleFn">
				<view class="left">
					<uni-icons type="help"></uni-icons>
					<text class="txt">关于售后</text>
				</view>
				<uni-icons type="right" color="#b6b6b6"></uni-icons>
			</view> -->
		</view>
	</view>
</template>

<script setup>
	import { onShareAppMessage } from '@dcloudio/uni-app';
	// 查看我的订单
	const toMyOrderListFn = () => {
		uni.switchTab({
			url: '/pages/order/list',
		});
	};
	const toPolicyFn = () => {
		uni.navigateTo({
			url: '/pages/mine/privacy_policy',
		});
	};
	// 查看关于售后
	const toAfterSaleFn = () => {
		uni.navigateTo({
			url: '/pages/mine/after_sale',
		});
	};
	// 监听页面分享
	onShareAppMessage((res) => {
		// if (res.from === 'button') {// 来自页面内分享按钮
		// 	// console.log(res)
		// }
		return {
			title: '自定义分享标题',
			imageUrl: '',
			path: '/pages/index/index'
		}
	});
</script>

<style>
	page {
		background-color: #f8f8f8;
	}
</style>
<style lang="scss" scoped>
	.user {
		width: 100%;
		height: 268rpx;
		box-sizing: border-box;
		padding: 0 40rpx 30rpx;
		display: flex;
		align-items: center;
		background-color: #e27b26;
		.avatar {
			width: 100rpx;
			height: 100rpx;
			border-radius: 50%;
			overflow: hidden;
		}
		.nickname {
			box-sizing: border-box;
			padding: 0 20rpx;
			color: #fff;
		}
	}
	
	.more {
		width: 690rpx;
		margin: 0 auto;
		box-sizing: border-box;
		padding: 0 35rpx;
		border-radius: 20rpx;
		background-color: #fff;
		position: relative;
		left: 0;
		top: -30rpx;
		.item {
			height: 100rpx;
			display: flex;
			justify-content: space-between;
			align-items: center;
			border-bottom: 1px #f6f6f6 solid;
			font-size: 28rpx;
			&:last-child {
				border-bottom: none;
			}
			.left {
				display: flex;
				align-items: center;
				.txt {
					padding-left: 20rpx;
				}
			}
		}
	}
</style>