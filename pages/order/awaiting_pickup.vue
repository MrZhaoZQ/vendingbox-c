<template>
	<view class="container">
		<view class="list"></view>
		<view class="empty">
			<image class="empty-img" src="../../static/imgs/empty.svg" mode="widthFix"></image>
			<view class="empty-txt">待取货列表空空如也</view>
			<view class="empty-btn" @click="toIndexFn">去逛逛</view>
		</view>
	</view>
</template>

<script setup>
	// 去逛逛，跳转至首页
	const toIndexFn = () => {
		uni.switchTab({
			url: "/pages/index/index"
		});
	};
</script>

<style lang="scss" scoped>
	.empty {
		width: 100vw;
		height: 100vh;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		.empty-img {
			width: 200rpx;
			height: auto;
		}
		.empty-txt {
			width: 568rpx;
			margin-bottom: 40rpx;
			text-align: center;
		}
		.empty-btn {
			width: auto;
			height: 68rpx;
			padding: 0 50rpx;
			border-radius: 34rpx;
			background-color: #e27b26;
			text-align: center;
			line-height: 68rpx;
			color: #fff;
		}
	}
</style>