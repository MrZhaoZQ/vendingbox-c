<template>
	<view class="container">
		<view v-if="list.length" class="list">
			<view
				v-for="item in list"
				:key="item.orderId" class="item"
				@click="toDetailFn(item.orderId)"
			>
				<view class="head flex-sb-c">
					<view class="time">{{item.createdTime}}</view>
					<view class="status">{{item.orderStatus}}</view>
				</view>
				<!-- <view class="prods">
					<view class="prod" v-for="prod in item.prods" :key="prod.code">
						<view class="prodName">{{prod.name}}</view>
						<text class="priceNnum">
							<text>¥{{prod.price}}</text> x <text>{{prod.num}}</text>
						</text>
					</view>
				</view> -->
				<view class="total flex-sb-c">
					<view>共计<text class="quantity">{{item.productCount}}</text>件商品</view>
					<view>合计支付金额：<text class="amount">¥{{item.amount}}</text></view>
				</view>
				<view class="infoList">
					<view class="infoItem">
						<view>支付状态</view>
						<view class="paystatus">{{item.payStatusTxt}}</view>
					</view>
					<view class="infoItem">
						<view>支付方式</view>
						<view class="flex-fe-c">
							<image v-if="item.payment_Method == 2" class="payscore" src="../../static/imgs/wxzff.png" mode="widthFix"></image>
							<text>{{item.payType}}</text>
						</view>
					</view>
					<view class="infoItem">
						<view>订单号</view>
						<view class="flex-fe-c" @click.stop="copyFn(item.orderId)">
							<text>{{item.orderId}}</text>
							<view class="copy">复制</view>
						</view>
					</view>
					<view class="infoItem flex-fe-c">
						<view>设备号</view>
						<view>{{item.machineSerialNum}}</view>
					</view>
					<view class="infoItem">
						<view>设备地址</view>
						<view>{{item.machineAddress}}</view>
					</view>
				</view>
				<view class="checkDetail flex-sb-c">
					<text>查看订单详情</text>
					<uni-icons type="right" color="#686868"></uni-icons>
				</view>
			</view>
		</view>
		<view v-else class="empty">
			<image class="empty-img" src="../../static/imgs/no_orders.svg" mode="widthFix"></image>
			<view class="empty-txt">您的订单空空如也，去首页下几单再来查看吧</view>
			<view class="empty-btn" @click="toIndexFn">去首页下单</view>
		</view>
	</view>
</template>

<script setup>
	import { ref } from 'vue';
	import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app';
	import { getOrderList } from '@/api/order.js';
	let pageNum = 1, pageSize = 10, requesting = false, more = true;
	const list = ref([]);
	const payTypeList = {
		"1": "微信支付",
		"2": " 微信支付分先购后付"
	};
	// 获取订单列表
	const getOrderListFn = (refreshing) => {
		if (requesting) return;
		requesting = true;
		uni.showLoading({
			mask: true
		});
		getOrderList({
			currentPage: refreshing ? 1 : pageNum,
			pageSize,
		}).then(res => {
			requesting = false;
			uni.hideLoading();
			if (refreshing) uni.stopPullDownRefresh();
			// console.log(res)
			if (res.errcode == 0 && res.data) {
				// 下拉刷新时重置数据和标识
				if (refreshing) {
					let len = list.value.length;
					list.value.splice(0, len);
					pageNum = 1;
					more = true;
				}
				// 处理数据和标识
				let arr = res.data || [];
				for (let i in arr) {
					arr[i].orderStatus = arr[i].status == 0 ? '服务进行中' : '服务结束';
					arr[i].payType = payTypeList[arr[i].payment_Method];
					switch (arr[i].payStatus) {
						case 0:
							arr[i].payStatusTxt = "交易中";
							break;
						case 1:
							arr[i].payStatusTxt = "交易成功";
							break;
						case -1:
							arr[i].payStatusTxt = "交易取消";
							break;
						case -2:
							arr[i].payStatusTxt = "交易异常";
							break;
						default:
							arr[i].payStatusTxt = "";
							break;
					}
				}
				list.value.push(...arr);
				if (arr.length < pageSize) {
					more = false;
				} else {
					pageNum += 1;
				}
				// console.log(pageNum, more, list)
			} else {
				uni.showToast({
					title: res?.errmsg || '获取我的订单失败，请稍后重试~',
					mask: true,
					icon: "none"
				});
			}
		}, errMsg => {
			requesting = false;
			uni.hideLoading();
			if (refreshing) uni.stopPullDownRefresh();
			uni.showToast({
				title: errMsg || '获取我的订单失败，请稍后重试~',
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
	// 查看订单详情
	const toDetailFn = (orderId) => {
		uni.navigateTo({
			url: '/pages/order/detail?orderId=' + orderId
		});
	};
	// 去首页下单
	const toIndexFn = () => {
		uni.switchTab({
			url: "/pages/index/index"
		});
	};
	// 监听页面加载
	onLoad((options) => {
		// console.log('onLoad: ', options);
		getOrderListFn(false);
	});
	// 监听页面刷新
	onPullDownRefresh(() => {
		getOrderListFn(true);
	});
	// 监听页面滚动到底部
	onReachBottom(() => {
		if (more) {
			getOrderListFn(false);
		}
	});
</script>

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
	
	.list {
		width: 100%;
		box-sizing: border-box;
		padding: 0 25rpx;
		background-color: #f6f6f6;
		.item {
			width: 100%;
			box-sizing: border-box;
			padding: 0 25rpx;
			background-color: #fff;
			border-bottom: 20rpx #f6f6f6 solid;
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
			// .prods {
			// 	width: 100%;
			// 	padding: 10rpx 0 0;
			// 	.prod {
			// 		width: 100%;
			// 		padding-bottom: 10rpx;
			// 		display: flex;
			// 		justify-content: space-between;
			// 		font-size: 24rpx;
			// 		.prodName {
			// 			width: 426rpx;
			// 			line-height: 32rpx;
			// 		}
			// 		.priceNnum {
			// 			display: flex;
			// 			justify-content: flex-end;
			// 		}
			// 	}
			// }
			.total {
				width: 100%;
				padding: 20rpx 0;
				// border-top: 2rpx #f2f2f2 solid;
				border-bottom: 2rpx #f2f2f2 solid;
				.quantity, .amount {
					color: #e27b26;
					font-weight: bolder;
				}
				.quantity {
					padding: 0 5rpx;
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
			.checkDetail {
				width: 100%;
				padding: 20rpx 0;
			}
		}
	}
	
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
			margin-bottom: 30rpx;
		}
		.empty-txt {
			width: 568rpx;
			margin-bottom: 30rpx;
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