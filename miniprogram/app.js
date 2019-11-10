//app.js
const { wxPost, wxGet, wxRunAsync} = require('./utils/common.js')

App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    wx.cloud.init()
    
    const that = this
    
    wx.checkSession({
      success: function () {
        console.info('wx.checkSession ,success')
        const userId = wx.getStorageSync("userId")
        if (!userId) {
          that.globalData.userId = ''
          console.info('userId been deleted ,reGetUserId')
        } else {
          that.globalData.userId = userId
          console.info('userId from storage')
        }
      },
      fail: function () {
        console.info(' get userId timeout or be removed')
      }
    })

   
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          console.info('wx.getSetting ,success')
          this.globalData.hasAuth = true
          wx.getUserInfo({
            success: res => {
              
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userData = res.userInfo
              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            },
            fail:()=>{
              console.log('fail')
            }
          })
        }else{
          console.info('wx.getSetting userInfo,fail')
        }
      }
    })
  },
  globalData: {
    hasAuth:false,
    userData:null,
    userId:'',
    code:'',
    shareObj:null
  },
  appLogin: function () {
    const that=this
    return wxRunAsync((resolve, reject)=>{
      // 登录
      wx.login({
        success: res => {
          // 发送 res.code 到后台换取 openId, sessionKey, unionId
          wxPost('/user/login',
            {
              code: res.code,
              userId: that.globalData.userId,
              nickName: that.globalData.userData.nickName,
              avatarUrl: that.globalData.userData.avatarUrl,
              gender: that.globalData.userData.gender,
              city: that.globalData.userData.city,
              province: that.globalData.userData.province,
              country: that.globalData.userData.country
            },
            ({ data }) => {
              if (data.errorCode === 0) {
                wx.setStorageSync('userId', data.userData.userId)
                wx.setStorageSync('code', res.code)
                that.globalData.userId = data.userData.userId
                that.globalData.userData = data.userData
                that.aldstat.sendOpenid(data.userData.openId)
              }
              resolve()
            },
            ({ data }) => {

            })
        }
      })
    })
  }
})