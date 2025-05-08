<template>
	<view class="container">
		<!-- 扫码 -->
		<view class="scanCode" v-if="showScanCode">
			<image class="kv" src="../../static/imgs/kv.jpg" mode="widthFix"></image>
			<view class="scan" @click="scanFn">扫描货柜</view>
			<view class="payscore">
				<image src="../../static/imgs/wxzff.png" mode="widthFix"></image>
				<text>微信支付分｜550分及以上优享</text>
			</view>
		</view>
		
		<!-- 授权手机号 -->
		<view class="authPhone" v-if="showAuthPhone">
			<text class="headline">扫码开门选购 关门自动结算</text>
			<image src="/static/imgs/tips.jpg" mode="widthFix"></image>
			<view class="authTitle">小程序将获取以下授权</view>
			<view class="authSubtitle">获取您的手机号</view>
			<view class="authBtn" @click="authPhoneFn">同意授权</view>
		</view>
		
		<!-- 隐私协议弹框 -->
		<privacyPopup v-model="showPrivacy" @agree="agreeFn"></privacyPopup>
		
		<!-- 确认开门弹框 -->
		<uni-popup ref="openDoorPopup" :mask-click="false">
			<view class="agreement">
				<text class="title">本柜已开启AI智能识别\n多拿多扣，少拿自动退</text>
				<image class="ai-camera" src="../../static/imgs/ai_camera.png" mode="widthFix"></image>
				<text class="subtitle">请遵守智能货柜使用约定\n以下行为将面临违约扣款</text>
				<view class="list">
					<view class="item">
						<image src="../../static/imgs/forbidden1.png" mode="widthFix"></image>
						<text>故意遮挡摄像头</text>
					</view>
					<view class="item">
						<image src="../../static/imgs/forbidden2.png" mode="widthFix"></image>
						<text>尝试关闭货柜电源</text>
					</view>
					<view class="item">
						<image src="../../static/imgs/forbidden3.png" mode="widthFix"></image>
						<text>取货后长时间未关门</text>
					</view>
				</view>
				<view class="open" @click="openNowFn">立即开门</view>
				<view class="payscore">
					<image src="../../static/imgs/wxzff.png" mode="widthFix"></image>
					<text>微信支付分｜550分及以上优享</text>
				</view>
			</view>
		</uni-popup>
		
		<!-- 微信支付分评估未通过 -->
		<view v-show="showNotPass" class="notpass">
			<view class="popup">
				<icon type="warn" size="32"/>
				<text class="txt">微信支付分评估未通过，暂无法使用服务</text>
				<view class="btn" @click="gotItFn">我知道了</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import { ref } from 'vue';
	import { onLoad, onReady, onShow } from '@dcloudio/uni-app';
	import privacyPopup from '../../components/privacy.vue';
	import { getQueryStr } from '@/utils/tools.js';
	import { wxLogin, getUserInfo } from '@/api/user.js';
	import { createWxScoreOrder, openDoor } from '@/api/order.js';
	const showScanCode = ref(false);
	const showAuthPhone = ref(false);
	const showPrivacy = ref(false);
	const openDoorPopup = ref('');
	const showNotPass = ref(false);
	let pageShowTimes = 0;
	// 监听“同意”隐私协议、授权手机号事件
	const agreeFn = () => {
		openDoorPopup.value.open();
	};
	// 开门
	const openDoorFn = (orderId) => {
		uni.showLoading({ mask: true });
		openDoor({orderId}).then(res => {
			// console.log(res)
			uni.hideLoading();
			if (res.errcode == 0 && res.data?.orderId) {
				// 关闭“确认开门弹框”，此处与onShow的待处理内容相关
				// openDoorPopup.value.close();
				uni.redirectTo({
					url: '/pages/order/mach_opened?orderId=' + orderId
				});
			} else {
				uni.showToast({
					title: res?.errmsg || '开门失败，请稍后重试~',
					mask: true,
					icon: "none"
				});
			}
		}, errMsg => {
			uni.hideLoading();
			uni.showToast({
				title: errMsg || '开门失败，请稍后重试~',
				mask: true,
				icon: "none"
			});
		});
	};
	// 点击“立即开门”
	const openNowFn = () => {
		// #ifdef MP-WEIXIN
		if (wx.openBusinessView) {
			// 创建微信支付分订单，获取拉起微信支付分的参数
			uni.showLoading({ mask: true });
			createWxScoreOrder({machineSerialNum: getApp().globalData.machId}).then(res => {
				if (res.errcode == 0 && res.data?.orderId) {
					uni.hideLoading();
					wx.openBusinessView({
						businessType: 'wxpayScoreUse',
						extraData: {
							mch_id: res.data.mch_id,
							package: res.data.package,
							timestamp: res.data.timestamp,
							nonce_str: res.data.nonce_str,
							sign_type: res.data.sign_type,
							sign: res.data.sign
						},
						success: (succ) => {
							console.log("succ: ", succ)
							// 开门
							openDoorFn(res.data.orderId);
						},
						fail: (err) => {
							console.log("fail: ", err)
							//dosomething
						}
					});
				} else {
					uni.hideLoading();
					uni.showToast({
						title: res?.errmsg || '创建订单失败，请稍后重试~',
						mask: true,
						icon: "none"
					});
				}
			}, errMsg => {
				uni.hideLoading();
				uni.showToast({
					title: errMsg || '创建订单失败，请稍后重试~',
					mask: true,
					icon: "none"
				});
			});
		} else {
			// 引导用户升级微信版本
			uni.showModal({
				showCancel: false,
				title: '提示',
				content: '当前微信版本过低，请先升级您的微信版本'
			});
		}
		// #endif
	};
	// 我知道了
	const gotItFn = () => {
		// 隐藏微信支付分未通过弹窗
		showNotPass.value = false;
	};
	// 扫描
	const scanFn = () => {
		uni.scanCode({
			scanType: ['qrCode'],
			success: res => {
				console.log('扫码成功：', res);
				const {result, scanType} = res;
				const machId = getQueryStr(result, 'machId');
				// 根据scanType和result的规则特性判断需要执行的操作
				// 二维码：QR_CODE即普通二维码、WX_CODE即小程序码
				if (scanType == 'QR_CODE' && result.startsWith('https://vip.banary.cn:40902/mp.html?machId=') && machId) {
					// 柜码 则 reLaunch
					uni.reLaunch({
						url: '/pages/index/index?machId=' + machId
					});
				} else {
					uni.showToast({
						title: '请扫描货柜的二维码',
						mask: true,
						icon: "none"
					});
				}
			},
			fail: err => {
				console.log('扫码失败：', err);
			}
		});
	};
	// 点击“同意授权”
	const authPhoneFn = () => {
		// 展示隐私协议弹框
		showPrivacy.value = true;
	};
	// 获取用户信息
	const getUserInfoFn = () => {
		getUserInfo().then(res => {
			// 判断是否已授权手机号
			if (res?.phone) {
				openDoorPopup.value.open();
			} else {
				showAuthPhone.value = true;
			}
		}, errMsg => {
			uni.showToast({
				title: errMsg || '获取用户信息失败，请稍后重试~',
				mask: true,
				icon: "none"
			});
		});
	};
	// 登录
	const mpLogin = () => {
		if (uni.getStorageSync('customerId')) {
			// 获取用户信息
			return getUserInfoFn();
		};
		uni.login({
			success: ({code}) => {
				wxLogin({code}).then(res => {
					// console.log(res)
					if (res.errcode == 0 && res.data?.customerId) {
						// 存储用户标识
						uni.setStorage({
							key: 'customerId',
							data: res.data.customerId
						});
						// 判断是否已授权手机号
						if (res.data?.phone) {
							showAuthPhone.value = false;
							// 判断是否有柜码
							if (getApp().globalData.machId) {
								openDoorPopup.value.open();
							} else {
								showScanCode.value = true;
							}
						} else {
							// 判断是否有柜码
							if (getApp().globalData.machId) {
								showAuthPhone.value = true;
							} else {
								showScanCode.value = true;
							}
						}
					} else {
						uni.showToast({
							title: res?.errmsg || '登录异常，请稍后重试~',
							mask: true,
							icon: "none"
						});
					}
				}, errMsg => {
					uni.showToast({
						title: errMsg || '登录异常，请稍后重试~',
						mask: true,
						icon: "none"
					});
				});
			},
			fail: () => {
				mpLogin();
			}
		});
	};
	// 监听页面加载
	onLoad((options) => {
		// console.log('onLoad: ', options);
		if (options?.machId) {
			getApp().globalData.machId = options.machId;
		}
	});
	// 监听页面初次渲染完成，此时组件已挂载完成，DOM 树($el)已可用
	onReady(() => {
		// console.log('onReady');
		// 判断是否已登录
		if (uni.getStorageSync('customerId')) {
			// 判断当前是否有柜码
			if (getApp().globalData.machId) {
				// 获取用户信息
				getUserInfoFn();
			} else {
				showScanCode.value = true;
			}
		} else {
			mpLogin();
		}
	});
	// 监听页面显示，页面每次出现在屏幕上都触发
	onShow(() => {
		pageShowTimes += 1;
		// if (pageShowTimes > 1) {
		// 	// 判断是否已登录
		// 	if (uni.getStorageSync('customerId')) {
		// 		// 判断当前是否有柜码
		// 		if (getApp().globalData.machId) {
		// 			// 获取用户信息
		// 			getUserInfoFn();
		// 		} else {
		// 			showScanCode.value = true;
		// 		}
		// 	} else {
		// 		mpLogin();
		// 	}
		// }
		// 判断是否处于开门状态，若是=>则跳转至开门成功的页面，若否=>则...
		
	});
</script>

<style lang="scss" scoped>
	.container {
		width: 100vw;
		height: 100vh;
		overflow: hidden;
	}
	
	.payscore {
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 26rpx;
		font-weight: bolder;
		line-height: 40rpx;
		image {
			width: 40rpx;
			height: auto;
			margin-right: 10rpx;
		}
	}
	
	.scanCode {
		.kv {
			width: 100%;
			height: auto;
			max-width: 100%;
			max-height: 100%;
			display: block;
		}
		.scan {
			width: 456rpx;
			height: 88rpx;
			border-radius: 44rpx;
			background-color: #e27b26;
			text-align: center;
			line-height: 88rpx;
			color: #fff;
			position: fixed;
			left: 50%;
			transform: translateX(-50%);
			bottom: 120rpx;
		}
		.payscore {
			width: 568rpx;
			position: fixed;
			left: 50%;
			transform: translateX(-50%);
			bottom: 70rpx;
			color: #fff;
		}
	}
	
	.authPhone {
		text-align: center;
		.headline {
			display: block;
			padding: 40rpx 0 20rpx;
			font-size: 36rpx;
			font-weight: bolder;
		}
		image {
			width: 100%;
			height: auto;
			margin-bottom: 20rpx;
		}
		.authTitle {
			margin-bottom: 10rpx;
			font-size: 32rpx;
		}
		.authSubtitle {
			margin-bottom: 20rpx;
			color: #3a3a3a;
		}
		.authBtn {
			width: 600rpx;
			height: 88rpx;
			margin: 0 auto;
			border-radius: 43rpx;
			background-color: #e27b26;
			color: #fff;
			font-size: 30rpx;
			line-height: 88rpx;
		}
	}
	
	.agreement {
		width: 600rpx;
		height: 868rpx;
		box-sizing: border-box;
		padding: 40rpx;
		background-color: #fff;
		border-radius: 20rpx;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		.title {
			font-weight: bolder;
			font-size: 32rpx;
			color: #686868;
		}
		.ai-camera {
			width: 168rpx;
			height: 168rpx;
			display: block;
			margin: 20rpx 0;
		}
		.subtitle {
			font-weight: bolder;
			font-size: 32rpx;
			color: #26ab28;
		}
		.list {
			margin: 20rpx 0 40rpx;
			.item {
				padding: 6rpx 0;
				display: flex;
				align-items: center;
				image {
					width: 56rpx;
					height: auto;
					margin-right: 20rpx;
				}
			}
		}
		.open {
			width: 320rpx;
			height: 68rpx;
			margin-bottom: 10rpx;
			border-radius: 34rpx;
			background-color: #26ab28;
			text-align: center;
			line-height: 68rpx;
			color: #fff;
		}
	}
	
	.notpass {
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.6);
		position: fixed;
		left: 0;
		top: 0;
		z-index: 222;
		.popup {
			width: 100%;
			height: 44vh;
			box-sizing: border-box;
			padding: 4vh 30rpx 6vh;
			border-radius: 20rpx 20rpx 0 0;
			background-color: #ffffff;
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			position: absolute;
			left: 0;
			bottom: 0;
			font-weight: bolder;
			.txt {
				padding: 60rpx 0 80rpx;
			}
			.btn {
				width: 288rpx;
				height: 80rpx;
				background-color: #f0f0f0;
				border-radius: 10rpx;
				text-align: center;
				line-height: 80rpx;
			}
		}
	}
</style>
