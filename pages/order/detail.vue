<template>
	<view class="container">
		<!-- 订单确认倒计时 -->
		<view v-if="pendingConfirmation" class="countdown">
			<uni-countdown
				:showDay="false"
				:showHour="false"
				:minute="countdown.minute"
				:second="countdown.second"
				:font-size="30"
				color="#333333"
			></uni-countdown>
			<text class="txt">请仔细核对您的购物明细，若超时未确认则按此明细扣款</text>
		</view>
		
		<!-- 订单信息 -->
		<view class="orderInfo">
			<view class="head flex-sb-c">
				<view class="time">{{orderInfo.createdTime}}</view>
				<view class="status">{{orderInfo.orderStatus}}</view>
			</view>
			<view v-if="orderInfo.order_Details.length" class="prods">
				<view class="prod" v-for="prod in orderInfo.order_Details" :key="prod.productId">
					<view class="prodName">{{prod.productName}}</view>
					<text class="priceNnum">
						<text>¥{{prod.unitPrice}}</text> x <text>{{prod.quantity}}</text>
					</text>
				</view>
				<view class="total flex-sb-c">
					<view>共计<text class="quantity">{{orderInfo.productCount}}</text>件商品</view>
					<view>合计支付金额：<text class="amount">¥{{orderInfo.amount}}</text></view>
				</view>
			</view>
			<view v-else class="warning">
				<icon type="warning" color="#e27b26"></icon>
				<text>订单结算中，请耐心等待！\n请勿再次开门将商品放回！</text>
			</view>
			<view class="infoList">
				<view class="infoItem">
					<view>支付状态</view>
					<view class="paystatus">{{orderInfo.payStatusTxt}}</view>
				</view>
				<view class="infoItem">
					<view>支付方式</view>
					<view class="flex-fe-c">
						<image class="payscore" src="../../static/imgs/wxzff.png" mode="widthFix"></image>
						<text>微信支付分先购后付</text>
					</view>
				</view>
				<view class="infoItem">
					<view>订单号</view>
					<view class="flex-fe-c" @click="copyFn(orderInfo.orderId)">
						<text>{{orderInfo.orderId}}</text>
						<view class="copy">复制</view>
					</view>
				</view>
				<view class="infoItem flex-fe-c">
					<view>设备号</view>
					<view>{{orderInfo.machineSerialNum}}</view>
				</view>
				<view class="infoItem">
					<view>设备地址</view>
					<view>{{orderInfo.machineAddress}}</view>
				</view>
			</view>
			<view class="contact" @click="contactFn(orderInfo.phone)">
				<uni-icons type="phone"></uni-icons>
				<text>联系商家：{{orderInfo.phone}}</text>
			</view>
		</view>
		
		<!-- 刷新订单状态 -->
		<view v-if="pendingSettlement" class="refresh" @click="refreshFn">下拉页面或点击按钮刷新订单状态</view>
		
		<!-- 订单扣费有问题，我要申诉 -->
		<view v-if="orderInfo.paid" class="appeal" @click="appealFn">订单扣费有问题，我要申诉</view>
		
		<!-- 订单确认按钮 -->
		<view v-if="pendingConfirmation" class="confirm">
			<view class="placeholder"></view>
			<view class="btn" @click="confirmFn">订单确认无误</view>
		</view>
	</view>
</template>

<script setup>
	import { ref } from 'vue';
	import { onLoad, onPullDownRefresh } from '@dcloudio/uni-app';
	import { getOrderDetail } from '@/api/order.js';
	let orderId = "";
	const orderInfo = ref({
		order_Details: []
	});
	const countdown = ref({
		minute: 5,
		second: 0
	});
	const pendingSettlement = ref(false); // 订单结算中
	const pendingConfirmation = ref(false); // 订单确认中
	// 获取订单详情
	const getDetailFn = (orderId, refreshing) => {
		if (!orderId) return;
		uni.showLoading({
			mask: true
		});
		getOrderDetail({orderId}).then(res => {
			uni.hideLoading();
			if (refreshing) uni.stopPullDownRefresh();
			// console.log(res)
			if (res.errcode == 0 && res.data) {
				let detail = res.data;
				detail.orderStatus = detail.status == 0 ? '服务进行中' : '服务结束';
				switch (detail.payStatus) {
					case 0:
						detail.payStatusTxt = "交易中";
						break;
					case 1:
						detail.payStatusTxt = "交易成功";
						break;
					case -1:
						detail.payStatusTxt = "交易取消";
						break;
					case -2:
						detail.payStatusTxt = "交易异常";
						break;
					default:
						detail.payStatusTxt = "";
						break;
				}
				// 判断是否已支付
				if (detail.payTime) {
					pendingSettlement.value = false;
					// 判断支付时间是否超出当前时间5分钟
					let delta = Date.now() - detail.payTime;
					if (delta > 0 && delta <= 5 * 60 * 1000) {
						let m = delta % 60000;
						let s = delta - m * 60000;
						countdown.value = {
							minute: m,
							second: s
						};
						pendingConfirmation.value = true;
					} else {
						pendingConfirmation.value = false;
					}
				} else {
					pendingSettlement.value = true;
					pendingConfirmation.value = false;
				}
				orderInfo.value = detail;
			} else {
				uni.showToast({
					title: res?.errmsg || '获取订单详情失败，请稍后重试~',
					mask: true,
					icon: "none"
				});
			}
		}, errMsg => {
			uni.hideLoading();
			if (refreshing) uni.stopPullDownRefresh();
			uni.showToast({
				title: errMsg || '获取订单详情失败，请稍后重试~',
				mask: true,
				icon: "none"
			});
		});
	};
	// 复制订单号
	const copyFn = (orderId) => {
		uni.setClipboardData({
			data: orderId
		});
	};
	// 联系商家
	const contactFn = (phoneNo) => {
		uni.makePhoneCall({
			phoneNumber: phoneNo
		});
	};
	// 刷新页面
	const refreshFn = () => {
		uni.startPullDownRefresh();
		getDetailFn(orderId, true);
	};
	// 确认订单
	const confirmFn = () => {
		
	};
	// 订单申诉
	const appealFn = () => {
		
	};
	// 监听页面加载
	onLoad((options) => {
		// console.log('onLoad: ', options);
		if (options?.orderId) {
			orderId = options.orderId;
			getDetailFn(orderId, false);
		}
	});
	// 监听页面刷新
	onPullDownRefresh(() => {
		getDetailFn(orderId, true);
	});
</script>

<style>
	page {
		background-color: #f6f6f6;
	}
</style>
<style lang="scss" scoped>
	.flex-sb-c {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.flex-fe-c {
		display: flex;
		justify-content: flex-end;
		align-items: center;
	}
	
	.container {
		width: 100%;
		box-sizing: border-box;
		padding: 25rpx;
	}
	
	.countdown {
		width: 100%;
		box-sizing: border-box;
		padding: 0 25rpx 30rpx;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		.txt {
			font-size: 26rpx;
			color: #e27b26;
			font-weight: bolder;
		}
	}
	
	.orderInfo {
		width: 100%;
		box-sizing: border-box;
		padding: 0 25rpx;
		background-color: #fff;
		.head {
			width: 100%;
			height: 78rpx;
			border-bottom: 2rpx #f2f2f2 solid;
			.time {
				font-size: 26rpx;
				color: #686868;
			}
			.status {
				width: auto;
				padding: 2rpx 16rpx;
				border-radius: 4rpx;
				background-color: #e27b26;
				color: #fff;
				font-size: 24rpx;
			}
		}
		.warning {
			width: 100%;
			padding: 20rpx 0;
			background-color: #f6f6f6;
			display: flex;
			justify-content: center;
			align-items: center;
			color: #e27b26;
			font-weight: bolder;
		}
		.prods {
			width: 100%;
			padding: 10rpx 0 0;
			.prod {
				width: 100%;
				padding-bottom: 10rpx;
				display: flex;
				justify-content: space-between;
				font-size: 24rpx;
				.prodName {
					width: 426rpx;
					line-height: 32rpx;
				}
				.priceNnum {
					display: flex;
					justify-content: flex-end;
				}
			}
			.total {
				width: 100%;
				padding: 20rpx 0;
				border-top: 2rpx #f2f2f2 solid;
				border-bottom: 2rpx #f2f2f2 solid;
				.quantity, .amount {
					color: #e27b26;
					font-weight: bolder;
				}
				.quantity {
					padding: 0 5rpx;
				}
			}
		}
		.infoList {
			width: 100%;
			padding: 15rpx 0 5rpx;
			.infoItem {
				width: 100%;
				padding: 5rpx 0;
				display: flex;
				justify-content: space-between;
				align-items: center;
				font-size: 26rpx;
				color: #686868;
				.paystatus {
					color: #e27b26;
				}
				.payscore {
					width: 36rpx;
					height: auto;
				}
				.copy {
					padding-left: 4rpx;
					color: #e27b26;
					text-decoration: underline;
				}
			}
		}
		.contact {
			width: 100%;
			padding: 20rpx 0;
			display: flex;
			justify-content: center;
			align-items: center;
			text {
				padding-left: 10rpx;
			}
		}
	}
	
	.refresh, .appeal {
		margin: 60rpx auto;
		width: 100%;
		height: 86rpx;
		box-sizing: border-box;
		border-radius: 5rpx;
		text-align: center;
		line-height: 86rpx;
	}
	.refresh {
		border: 2rpx #e27b26 solid;
		color: #e27b26;
	}
	.appeal {
		border: 2rpx #f2f2f2 solid;
		background-color: #fff;
	}
	
	.confirm {
		width: 100%;
		.placeholder {
			width: 100%;
			height: calc(188rpx + env(safe-area-inset-bottom));
		}
		.btn {
			width: 700rpx;
			height: 88rpx;
			box-sizing: border-box;
			border-radius: 46rpx;
			background-color: #e27b26;
			color: #fff;
			text-align: center;
			line-height: 88rpx;
			position: fixed;
			left: 25rpx;
			bottom: calc(100rpx + env(safe-area-inset-bottom));
		}
	}
</style>