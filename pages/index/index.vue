<template>
	<view class="container">
		<!-- 扫码 -->
		<view class="scanCode" v-if="showScanCode">
			<image class="kv" src="../../static/imgs/kv.jpg" mode="widthFix"></image>
			<view class="scan" @click="scanFn">扫描货柜</view>
			<view v-if="!unBNPLpage" class="payscore">
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
		
		<!-- 非“先买后付”的购买页面：货柜信息 & 商品列表 & 购物车 -->
		<view v-if="unBNPLpage && !showScanCode" class="un-BNPL-page">
			<!-- 顶部 -->
			<view class="header">
				<view class="mach-name">{{machInfo.name}}</view>
				<view class="notice">公告：如有疑问可点击 订单--查看详情--联系商家～</view>
				<view class="mach-info">{{machInfo.address}}（{{machInfo.id}}）</view>
			</view>
			<!-- 商品列表 -->
			<view class="main">
				<scroll-view class="category-list" scroll-y>
					<view
						v-for="(item, index) in list"
						:key="index"
						:class="['category', currCateIdx == index ? 'active' : '']"
						@click="tapCategoryFn(item.cateId, index)">
						<text>{{ item.title }}</text>
					</view>
					<view class="placeholder"></view>
				</scroll-view>
				<scroll-view
					class="goods-list"
					scroll-y
					scroll-with-animation
					:scroll-into-view="scrollTo"
					@scroll="scrollFn"
				>
					<block v-for="(item, index) in list" :key="index">
						<view class="category" :id="'cateId' + item.cateId">{{ item.title }}</view>
						<view class="goods" v-for="(goods, idx) in item.list" :key="goods.productId">
							<image class="goods-img" lazy-load :src="goods.imageUrl"></image>
							<view class="goods-info">
								<view class="goods-name">{{ goods.name }}</view>
								<view class="price-btns">
									<view class="price">￥{{ goods.price }}</view>
									<view v-if="goods.stock > 0" class="btns">
										<template v-if="goods.num > 0">
											<view class="sub" @click.stop="addOrSubOnMenuFn(index, idx, 0)">-</view>
											<view class="num">{{ goods.num }}</view>
										</template>
										<view class="add" @click.stop="addOrSubOnMenuFn(index, idx, 1)">+</view>
									</view>
									<view v-else class="sold-out">售罄</view>
								</view>
							</view>
						</view>
					</block>
					<view class="placeholder"></view>
				</scroll-view>
			</view>
			<!-- 购物车 -->
			<uni-popup ref="cartListPopup" type="bottom" :safe-area="false">
				<view class="cart-list-popup">
					<view class="cart-head">
						<view class="added">已选商品<text>（共{{count}}件）</text></view>
						<view class="delAll" @click="delAllFn">清空购物车</view>
					</view>
					<scroll-view class="cart-list" scroll-y>
						<view
							v-for="item in cartList"
							:key="item.productId"
							class="cart-item"
						>
							<view class="goods">
								<view>{{item.name}}</view>
								<view class="goods-price">¥{{item.price}}</view>
							</view>
							<view class="goods-num">
								<uni-number-box @change="changeNumFn($event, item)" v-model="item.num"></uni-number-box>
							</view>
						</view>
					</scroll-view>
				</view>
			</uni-popup>
			
			<!-- 底部 -->
			<view class="footer">
				<view class="total" @click="switchCartFn">
					<view class="cart">
						<uni-icons type="cart" size="30" color="#e27b26"></uni-icons>
						<view class="cart-num">{{count}}</view>
					</view>
					<view class="line"></view>
					<view class="acount">
						<text v-if="amount > 0">¥ {{amount.toFixed(2)}}</text>
						<text v-else>请选择商品</text>
					</view>
				</view>
				<view class="pay" @click="buyFn">支付</view>
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
	import { createWxScoreOrder, createUnBNPLorder, openDoor } from '@/api/order.js';
	import { getGoodsListByMach, getCartList, updateCartList, clearCartList } from '@/api/cart.js';
	const BNPL = false; // 先买后付：buy now, pay later
	const showScanCode = ref(false);
	const showAuthPhone = ref(false);
	const showPrivacy = ref(false);
	const openDoorPopup = ref('');
	const showNotPass = ref(false);
	const unBNPLpage = ref(false);
	const machInfo = ref({});
	const cartListPopup = ref('');
	const list = ref([
		// {cateId: 1, title: '分类一', list: [
		// 	{productId: 1, stock: 10, imageUrl: '/static/imgs/wxzff.png', name: '测试商品1', price: 0.01, num: 0},
		// 	{productId: 2, stock: 10, imageUrl: '/static/imgs/wxzff.png', name: '测试商品2测试商品2测试商品2测试商品2测试商品2测试商品2测试商品2', price: 0.01, num: 0}
		// ]},
		// {cateId: 2, title: '分类二', list: [
		// 	{productId: 3, stock: 10, imageUrl: '/static/imgs/wxzff.png', name: '测试商品3', price: 0.01, num: 0},
		// 	{productId: 4, stock: 0, imageUrl: '/static/imgs/wxzff.png', name: '测试商品4', price: 0.01, num: 0},
		// 	{productId: 5, stock: 1, imageUrl: '/static/imgs/wxzff.png', name: '测试商品5', price: 0.01, num: 0},
		// 	{productId: 6, stock: 10, imageUrl: '/static/imgs/wxzff.png', name: '测试商品6', price: 0.01, num: 0},
		// 	{productId: 7, stock: 2, imageUrl: '/static/imgs/wxzff.png', name: '测试商品7', price: 0.01, num: 0},
		// 	{productId: 8, stock: 10, imageUrl: '/static/imgs/wxzff.png', name: '测试商品8', price: 0.01, num: 0}
		// ]},
		// {cateId: 3, title: '分类三', list: [
		// 	{productId: 9, stock: 10, imageUrl: '/static/imgs/wxzff.png', name: '测试商品9', price: 0.01, num: 0},
		// 	{productId: 10, stock: 10, imageUrl: '/static/imgs/wxzff.png', name: '测试商品10', price: 0.01, num: 0}
		// ]}
	]);
	const currCateIdx = ref(0);
	const scrollTo = ref('cateId3');
	const cartList = ref([]);
	const count = ref(0);
	const amount = ref(0);
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
			// 判断是否 非 先买后付
			if (!BNPL) {
				unBNPLpage.value = true;
				// 获取商品分类、列表数据
				return getGoodsListFn();
			}
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
						// 判断是否 非 先买后付
						if (!BNPL) {
							// 判断是否有柜码
							if (getApp().globalData.machId) {
								unBNPLpage.value = true;
								// 获取商品分类、列表数据
								return getGoodsListFn();
							} else {
								showScanCode.value = true;
							}
						}
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
	// ---------- 非“先买后付（BNPL）” start-----------
	// 屏幕宽度
	let winWidth = 0;
	// 监听滚动
	const scrollFn = e => {
		// 判断是否已获取到屏幕宽度
		if (winWidth) {
			let sTop = e.detail.scrollTop,
				listV = list.value,
				cateHeight = (80 * winWidth) / 750,
				goodsHeight = (160 * winWidth) / 750,
				sumHeight = 0;
			for (let i in listV) {
				let len = listV[i].list.length;
				sumHeight += cateHeight + len * goodsHeight;
				// console.log(sTop, sumHeight, catNameHeight)
				if (sTop <= sumHeight - cateHeight) {
					currCateIdx.value = i;
					break;
				}
			}
		}
	};
	// 点击左侧菜单分类列表
	const tapCategoryFn = (id, cateIdx) => {
		scrollTo.value = 'cateId' + id;
		currCateIdx.value = cateIdx;
	};
	// 加减商品（操作菜单列表）cateIdx=>菜单一级分类列表索引值; idx=>菜单二级列表索引值; type=>1:加、0:减
	const addOrSubOnMenuFn = (cateIdx, idx, type) => {
		const arr = list.value;
		if (type) {
			arr[cateIdx].list[idx].num += 1;
		} else {
			arr[cateIdx].list[idx].num -= 1;
		}
		list.value = arr;
		// 更新购物车数据
		updateCartListFn(arr[cateIdx].list[idx]);
	};
	// 购物车内加减商品商量
	const changeNumFn = (e, goods) => {
		// console.log(e, goods)
		// 更新商品列表对应的商品数量
		const arr = list.value;
		for (let i in arr) {
			for(let j in arr[i].list) {
				if (arr[i].list[j].productId === goods.productId) {
					arr[i].list[j].num = e
				}
			}
		}
		// 更新购物车数据
		updateCartListFn(goods);
	};
	// 更新购物车数据
	const updateCartListFn = (goods) => {
		uni.showLoading({ mask: true });
		updateCartList({
			product: {
				...goods,
				count: goods.num
			},
			machineSerialNum: getApp().globalData.machId,
			cartId: ''
		}).then(res => {
			// console.log(res);
			uni.hideLoading();
			if (res.data?.list) {
				const arr = res.data.list;
				for (let i in arr) {
					arr[i].num = arr[i].count;
					arr[i].img = arr[i].imageUrl;
				}
				cartList.value = arr;
				// 更新购物车总量&总价
				totalFn();
			} else {
				uni.showToast({
					title: res?.errmsg || '获取购物车更新失败，请稍后重试~',
					icon: 'none',
					mask: true
				});
			}
		}, errMsg => {
			uni.hideLoading();
			uni.showToast({
				title: errMsg,
				icon: 'none',
				mask: true
			});
		});
	};
	// 更新购物车商品总量&总价
	const totalFn = () => {
		let t1 = 0, t2 = 0;
		const arr = cartList.value;
		for (let i in arr) {
			t1 += arr[i].num;
			t2 += arr[i].price * arr[i].num;
		}
		count.value = t1;
		amount.value = t2;
	};
	// 清空购物车
	const delAllFn = () => {
		uni.showModal({
			content: "确定要清空购物车内的商品吗？",
			success: (res) => {
				if (res.confirm) {
					uni.showLoading({ mask: true });
					clearCartList({
						machineSerialNum: getApp().globalData.machId
					}).then(() => {
						// 清空商品列表数量
						const arr = list.value;
						for (let i in arr) {
							for(let j in arr[i].list) {
								arr[i].list[j].num = 0;
							}
						}
						// 清空购物车数据
						cartList.value = [];
						totalFn();
						uni.hideLoading();
					}, errMsg => {
						uni.hideLoading();
						uni.showToast({
							title: errMsg,
							icon: 'none',
							mask: true
						});
					});
				}
			}
		})
	};
	// 展示/隐藏购物车列表
	let showCartList = false;
	const switchCartFn = () => {
		showCartList ? cartListPopup.value.close() : cartListPopup.value.open();
		showCartList = !showCartList;
	};
	// 支付
	const buyFn = () => {
		// 检查是否可下单
		if (cartList.value.length < 1) return uni.showToast({
			title: '请先添加商品到购物车',
			icon: 'none',
			mask: true
		});
		uni.showLoading({ mask: true });
		createUnBNPLorder({
			machineSerialNum: getApp().globalData.machId
		}).then(res => {
			if (res.data) {
				// 微信小程序支付
				// #ifdef MP-WEIXIN
				wx.requestPayment({
					timeStamp: res.data.timeStamp,
					nonceStr: res.data.nonceStr,
					package: res.data.package,
					signType: res.data.signType,
					paySign: res.data.paySign,
					success: succ => {
						console.log(succ)
						uni.hideLoading();
						uni.navigateTo({
							url: '/pages/order/detail?orderId=' + res.data.outOrderId
						});
					},
					fail: ({errMsg}) => {
						uni.hideLoading();
						// console.log(errMsg)
						if (errMsg && errMsg.indexOf('cancel') < 0) {
							uni.showToast({
								title: '支付失败，请稍后重试',
								mask: true,
								icon: "none"
							});
						}
					}
				});
				// #endif
			} else {
				uni.showToast({
					title: res?.errmsg || '下单失败，请稍后重试~',
					mask: true,
					icon: "none"
				});
			}
		}, errMsg => {
			uni.hideLoading();
			uni.showToast({
				title: errMsg,
				icon: 'none',
				mask: true
			});
		});
	};
	// 获取购物车列表数据
	const getCartListFn = () => {
		getCartList({
			machineSerialNum: getApp().globalData.machId
		}).then(res => {
			uni.hideLoading();
			if (res.data?.list) {
				// 合并购物车内相同ID的商品
				const arr1 = res.data.list || [];
				const arr2 = list.value;
				cartList.value = arr1;
				// 更新商品列表已加入购物车的商品数量
				for (let i in arr1) {
					arr1[i].num = arr1[i].count;
					for (let j in arr2) {
						for (let k in arr2[j].list) {
							if (arr2[j].list[k].productId == arr1[i].productId) {
								arr2[j].list[k].num = arr1[i].num;
								arr2[j].list[k].count = arr1[i].num;
							}
						}
					}
				}
				// 更新购物车商品的总量&总价
				totalFn();
			} else {
				uni.showToast({
					title: res?.errmsg || '获取购物车信息失败，请稍后重试~',
					mask: true,
					icon: "none"
				});
			}
		}, errMsg => {
			uni.hideLoading();
			uni.showToast({
				title: errMsg,
				icon: "none",
				mask: true
			});
		});
	};
	// 获取商品分类、列表数据
	const getGoodsListFn = () => {
		uni.showLoading({ mask: true });
		getGoodsListByMach({
			machineSerialNum: getApp().globalData.machId
		}).then(res => {
			// console.log(res)
			if (res.data) {
				// 柜子数据
				machInfo.value = {
					id: getApp().globalData.machId,
					name: res.data.machineName,
					address: res.data.machineAddress
				};
				// 商品数据
				const obj = res.data.products || {};
				let cateId = 0, arr = [];
				for (let key in obj) {
					for (let j in obj[key]) {
						obj[key][j].num = 0;
						obj[key][j].stock = 99; // 暂时无库存限制
					}
					arr.push({
						cateId: cateId += 1,
						title: key,
						list: obj[key]
					});
				}
				list.value = arr;
				// 获取购物车列表数据
				getCartListFn();
			} else {
				uni.hideLoading();
				uni.showToast({
					title: res?.errmsg || '获取商品列表失败，请稍后重试~',
					mask: true,
					icon: "none"
				});
			}
		}, errMsg => {
			uni.hideLoading();
			uni.showToast({
				title: errMsg,
				icon: "none",
				mask: true
			});
		});
	};
	// ---------- 非“先买后付（BNPL）” end-----------
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
				// 判断是否 非 先买后付 且 有柜码
				if (!BNPL) {
					unBNPLpage.value = true;
				}
				showScanCode.value = true;
			}
		} else {
			mpLogin();
		}
		
		// 获取屏幕宽度，用于非”先买后付“的商品列表的滚动高度计算
		uni.getSystemInfo({
			success: sysInfo => {
				// console.log(sysInfo)
				// 存储屏幕宽度和高度
				winWidth = sysInfo.screenWidth
			},
			fail: err => {
				console.log('获取屏幕宽度失败：', err);
			}
		});
	});
	// 监听页面显示，页面每次出现在屏幕上都触发
	onShow(() => {
		pageShowTimes += 1;
		if (pageShowTimes > 1) {
			// // 判断是否已登录
			// if (uni.getStorageSync('customerId')) {
			// 	// 判断当前是否有柜码
			// 	if (getApp().globalData.machId) {
			// 		// 获取用户信息
			// 		getUserInfoFn();
			// 	} else {
			// 		showScanCode.value = true;
			// 	}
			// } else {
			// 	mpLogin();
			// }
			// 判断是否 非 先买后付 且 有柜码
			if (!BNPL && getApp().globalData.machId) {
				unBNPLpage.value = true;
				// 获取商品分类、列表数据
				getGoodsListFn();
			}
		}
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
	
	.un-BNPL-page {
		width: 100%;
		box-sizing: border-box;
		padding-top: 15rpx;
		background-color: #f6f6f6;
		.header {
			width: 690rpx;
			height: 166rpx;
			margin: 0 auto 15rpx;
			background-color: #fff;
			border-radius: 15rpx;
			box-sizing: border-box;
			padding: 10rpx 20rpx;
			.mach-name {
				font-size: 36rpx;
				font-weight: bolder;
			}
			.notice {
				margin: 10rpx 0;
				color: #686868;
				font-size: 24rpx;
			}
			.mach-info {
				display: flex;
				font-size: 26rpx;
			}
		}
		.main {
			width: 100%;
			height: calc(100vh - 196rpx);
			display: flex;
			.category-list {
				width: 168rpx;
				height: 100%;
				.category {
					width: 168rpx;
					height: auto;
					box-sizing: border-box;
					padding: 20rpx 10rpx;
					overflow: hidden;
					font-weight: bolder;
					&.active {
						background-color: #fff;
						color: #e27b26;
					}
				}
			}
			.goods-list {
				width: 582rpx;
				height: 100%;
				background-color: #fff;
				.category {
					width: 100%;
					height: 80rpx;
					box-sizing: border-box;
					padding: 0 20rpx;
					line-height: 80rpx;
					font-weight: bolder;
				}
				.goods {
					width: 100%;
					height: 160rpx;
					display: flex;
					align-items: center;
					.goods-img {
						width: 126rpx;
						height: 126rpx;
						margin: 0 20rpx;
					}
					.goods-info {
						flex: 1;
						.goods-name {
							width: 396rpx;
							margin-bottom: 16rpx;
							line-height: 36rpx;
							max-height: 72rpx;
							overflow: hidden;
							text-overflow: ellipsis;
							display: -webkit-box;
							-webkit-line-clamp: 2;
							-webkit-box-orient: vertical;
						}
						.price-btns {
							display: flex;
							justify-content: space-between;
							align-items: center;
							.price {
								font-weight: bolder;
								color: #e27b26;
							}
							.btns {
								box-sizing: border-box;
								padding: 0 20rpx;
								display: flex;
								justify-content: flex-end;
								align-items: center;
								.sub, .add {
									width: 56rpx;
									height: 56rpx;
									background-color: #e27b26;
									border-radius: 50%;
									text-align: center;
									line-height: 54rpx;
									color: #fff;
									font-size: 40rpx;
								}
								.num {
									width: 68rpx;
									text-align: center;
									font-size: 32rpx;
								}
							}
							.sold-out {
								box-sizing: border-box;
								padding-right: 20rpx;
								color: #e10d26;
								font-weight: bolder;
							}
						}
					}
				}
			}
			.placeholder {
				width: 100%;
				height: 120rpx;
			}
		}
		.footer {
			width: 690rpx;
			height: 80rpx;
			border-radius: 40rpx;
			background-color: #010101;
			overflow-y: hidden;
			position: fixed;
			z-index: 999;
			left: 30rpx;
			bottom: 20rpx;
			display: flex;
			.total {
				width: 522rpx;
				display: flex;
				justify-content: flex-start;
				align-items: center;
				color: #e27b26;
				.cart {
					width: 110rpx;
					height: 100%;
					display: flex;
					justify-content: center;
					align-items: center;
					position: relative;
					.cart-num {
						width: auto;
						padding: 0 10rpx;
						border-radius: 50%;
						background-color: #e10d26;
						color: #fff;
						font-size: 24rpx;
						font-weight: bolder;
						position: absolute;
						right: 16rpx;
						top: 0;
					}
				}
				.line {
					width: 2rpx;
					height: 36rpx;
					margin-right: 30rpx;
					background-color: #f6f6f6;
				}
			}
			.pay {
				width: 168rpx;
				background-color: #e27b26;
				color: #fff;
				text-align: center;
				line-height: 80rpx;
			}
		}
	}
	
	.cart-list-popup {
		width: 100%;
		height: 576rpx;
		background-color: #fff;
		.cart-head {
			width: 100%;
			height: 76rpx;
			box-sizing: border-box;
			padding: 0 20rpx;
			background-color: #f6f6f6;
			display: flex;
			justify-content: space-between;
			align-items: center;
			.delAll {
				line-height: 76rpx;
				color: #e27b26;
			}
		}
		.cart-list {
			width: 100%;
			height: 500rpx;
			box-sizing: border-box;
			padding: 0 20rpx;
			.cart-item {
				width: 100%;
				height: 110rpx;
				box-sizing: border-box;
				border-bottom: 2rpx #f6f6f6 solid;
				display: flex;
				justify-content: space-between;
				align-items: center;
				.goods {
					width: 500rpx;
					.goods-price {
						font-size: 26rpx;
						color: #e27b26;
						font-weight: bolder;
					}
				}
				&:last-child {
					border-bottom: none;
				}
			}
		}
		.cart-empty {
			width: 100%;
			height: 500rpx;
		}
	}
</style>
