<template>
	<uni-popup ref="privacyPopup" :mask-click="props.closable">
		<view class="privacy">
			<text class="title">用户隐私保护说明</text>
			<view class="context">
				欢迎使用潮链智能柜小程序，请仔细阅读<text class="link">《潮链智能柜小程序隐私保护指引》</text>。如您同意，请点击“同意”继续。
			</view>
			<view class="btns">
				<view class="btn disagree" @click="disagree">不同意</view>
				<button class="btn" open-type="getPhoneNumber" @getphonenumber="getPhoneNoFn">同意</button>
			</view>
		</view>
	</uni-popup>
</template>

<script setup>
	import { ref, watch } from 'vue';
	import { getWxPhoneNumber } from '@/api/user.js';
	const privacyPopup = ref('');
	const show = defineModel({ default: false });
	const props = defineProps({
		closable: {
			type: Boolean,
			default: false
		}
	});
	const emits = defineEmits(['agree']);
	const disagree = () => {
		show.value = false;
	};
	let requesting = false;
	const getPhoneNoFn = ({detail, detail: {code}}) => {
		// console.log(detail);
		if (code) {
			if (requesting) return;
			requesting = true;
			uni.showLoading({
				mask: true
			});
			getWxPhoneNumber({code}).then(res => {
				// console.log(res)
				requesting = false;
				uni.hideLoading();
				if (res.errcode == 0 && res.phone_info?.phoneNumber) {
					// 存储手机号码
					uni.setStorage({
						key: "phone",
						data: res.phone_info.phoneNumber
					});
					show.value = false;
					emits('agree', true);
				} else {
					uni.showToast({
						title: res.errmsg || "获取手机号失败，请稍后重试~",
						icon: "none",
						mask: true,
					});
				}
			}, errMsg => {
				requesting = false;
				uni.hideLoading();
				uni.showToast({
					title: errMsg || "获取手机号失败，请稍后重试~",
					icon: "none",
					mask: true,
				});
			});
		}
	};
	watch(show, (value) => {
		value ? privacyPopup.value.open() : privacyPopup.value.close();
	});
</script>

<style lang="scss" scoped>
	.privacy {
		width: 600rpx;
		height: auto;
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
		}
		.context {
			padding: 30rpx 0 40rpx;
			.link {
				color: #e27b26;
			}
		}
		.btns {
			width: 100%;
			display: flex;
			justify-content: space-between;
			.btn {
				width: 246rpx;
				height: 68rpx;
				border-radius: 34rpx;
				background-color: #e27b26;
				color: #fff;
				text-align: center;
				line-height: 68rpx;
				&.disagree {
					background-color: #cdcdcd;
				}
			}
		}
	}
</style>