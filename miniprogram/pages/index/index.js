//index.js
//获取应用实例
const {
  wxGet,
  wxPost,
  parseUserState,
  isEnableBtn
} = require('../../utils/common.js')
import biz from '../../biz/biz.js'
import {
  EventStack
} from '../../utils/EventStack.js'
import {
  Voice
} from '../../utils/Voice.js'
const {
  setWatcher
} = require("../../utils/watcher.js");
const app = getApp()

var voice = false
const eventStack = new EventStack()
const options = {
  onShow: function() {
    const that = this
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          app.globalData.hasAuth = true
          that.setData({
            hasAuth: app.globalData.hasAuth
          })
        } else {
          app.globalData.hasAuth = false
          that.setData({
            hasAuth: app.globalData.hasAuth,
            waitLoading: false
          })
          wx.hideLoading()
        }
      }
    })
    that.setData({
      submitFlag: false
    })
  },
  onUnload: function() {
    if (voice) {
      voice.destroy()
    }
  },
  voiceContext: function() {
    if (voice) {
      return voice
    }
  },
  getEventStack: function() {
    return eventStack
  },
  onLoad: function(options) {
    console.info(options, 'options')
    if (options.scene) { //by qrcode
      let scene = decodeURIComponent(options.scene)
      console.info(scene, 'from  scan qrcode')
      wx.navigateTo({
        url: `./report?userId=${scene}&share=true`,
      })
    } else if (options.from === 'shareReport') { //by share
      wx.navigateTo({
        url: `./report?userId=${options.userId}&share=true`,
      })
    } else if (options.to === 'rankingList') { //by share
      wx.navigateTo({
        url: `./rankingList`,
      })
    }
    wx.showLoading({
      title: '请稍等...',
      mask: true
    })
    const that = this
    setWatcher(that)
    console.info('onLoad=' + app.globalData.userData)


    if (app.globalData.userData) {
      that.setData({
        userData: app.globalData.userData,
        hasAuth: app.globalData.hasAuth
      })
      that.checkError()
    } else if (that.data.canIUse) {

      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {

        app.globalData.userData = res.userInfo
        app.globalData.hasAuth = true
        that.setData({
          userData: app.globalData.userData,
          hasAuth: app.globalData.hasAuth
        })
        that.checkError()
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {

          app.globalData.userData = res.userInfo
          app.globalData.hasAuth = true
          that.setData({
            userData: app.globalData.userData,
            hasAuth: app.globalData.hasAuth
          })
          that.checkError()
        }
      })
    }
    voice = new Voice()
  },
  checkError: function() {
    const that = this
    if (app.globalData.hasAuth) {
       that.loadGame(false)
    } else {
      that.setData({
        waitLoading: false
      })
      wx.hideLoading()
    }
  },
  loadGame: function(e) {
    const that = this
    const userInfo = e? e.detail.userInfo : app.globalData.userData
    wx.cloud.callFunction({
      name: 'user',
      data: {
        $url: "login",
        userInfo
      }
    }).then(res => {
      console.info(res)
      if(res.result.code==0){
        const resData = res.result.data
        wx.setStorageSync('userId', resData.userData._id)
        app.globalData.userId = resData.userData._id
        app.globalData.userData = resData.userData
        app.globalData.hasAuth = true
        that.setData({
          currentDays: resData.days,
          currentHours: resData.hours,
          userData: resData.userData,
          hasAuth: app.globalData.hasAuth,
          lastComment: resData.userData.lastComment,
          submitFlag: false,
          waitLoading: false
        })



        wx.cloud.callFunction({
          name: 'res',
          data: {
            $url: "data",
            userId: app.globalData.userId
          }
        }).then(res => {
          console.info(res)
        }).catch(err => {
        })
      }
      wx.hideLoading()
    }).catch(err => {
      that.setData({
        waitLoading: false
      })
      wx.hideLoading()
      
    })
    // let shareGender = ''
    // if (app.globalData.userData) {
    //   shareGender = app.globalData.userData.gender
    // } else {
    //   shareGender = 2
    // }
    // wxGet('/user/share/' + shareGender,
    //   false,
    //   ({
    //     data
    //   }) => {
    //     //  console.info(data)
    //     if (data.errorCode === 0) {
    //       app.globalData.shareObj = data.share
    //     }
    //   })
  },
  gameAuth: function(e) {
    const that = this
    if (that.data.submitFlag) {
      return false
    } else {
      that.setData({
        submitFlag: true
      })
      if (!e.detail.userInfo) {
        wx.reLaunch({
          url: '../index/index?authReject=true'
        })
        return
      }
      wx.showLoading({
        title: '请稍等...',
        mask: true
      })
      that.loadGame(e)
    }
  },
  gameStart: function(e) {
    const that = this
    if (that.data.submitFlag) {
      return false
    } else {
      that.setData({
        submitFlag: true
      })
      wx.setNavigationBarColor({
        frontColor: '#ffffff',
        backgroundColor: '#000',
        animation: {
          duration: 500,
          timingFunc: 'easeIn'
        }
      })
      that.setData({
        nightClass: 'show'
      })
      if (!this.data.hasLogin) {
        if (app.globalData.userData.userId) {
          that.setData({
            userData: app.globalData.userData,
            hasLogin: true,
            submitFlag: false
          })
          that.start()
          that.resData()

        }
      } else {
        that.setData({
          submitFlag: false
        })
        that.start()
        that.resData()

      }
    }
  },
  resData: function() {
    const that = this
    wxGet('/user/resData/' + that.data.userData.userId,
      false,
      ({
        data
      }) => {
        //  console.info(data)
        if (data.errorCode === 0) {
          that.setData({
            planItems: data.planArray,
            jobItems: data.jobArray,
            carItems: data.carArray,
            houseItems: data.houseArray,
            clothesItems: data.clothesArray,
            luxuryItems: data.luxuryArray,
            coupleItems: data.coupleArray,
            luckItems: data.luckArray,
            tipItems: data.tipArray,
            fundItems: data.fundArray
          })
        }
      })
  },
  start: function() {
    const that = this
    wxPost('/user/start', {
        userId: that.data.userData.userId
      },
      ({
        data
      }) => {
        if (data.newGame) {
          that.getEventStack().init(true)
        }
        that.voiceContext().playNextDay()
        parseUserState(data, that)
        setTimeout(function() {
          that.setData({
            nightText: data.nightText,
            hasUserInfo: true,
            nightTip: '四处逛逛,生活节奏慢点可能触发偶遇'
          })
        }, 1200)
        setTimeout(function() {
          that.setData({
            nightClass: 'show hide',
            nightText: '',
            nightTip: ''
          })
          wx.setNavigationBarColor({
            frontColor: '#ffffff',
            backgroundColor: '#2e55af',
            animation: {
              duration: 1000,
              timingFunc: 'easeIn'
            }
          })
        }, 2500)
        setTimeout(function() {
          that.setData({
            nightClass: ''
          })
          if (data.resultArray) {
            that.setData({
              dialogPic: 'tishi',
              maskShow: true,
              dialogShow: true,
              dialogResult: data.resultArray
            })
            that.resultVoice(data)
          }
          that.autoTip()
        }, 3500)
      }
    )
  },
  nextDay: function(e) {
    const that = this
    if (that.data.userState.hours > 0 || that.data.submitFlag) {
      wx.showToast({
        title: '请继续四处逛逛消耗时间，再进入下一天。',
        icon: 'none',
        duration: 2000
      })
      return false
    } else {
      if (e) {
        that.pushFormSubmit(e)
      }
      that.voiceContext().playClick()
      that.setData({
        submitFlag: true,
        maskShow: true
      })
      wxPost(
        '/user/nextDay', {
          userId: that.data.userData.userId
        },
        ({
          data
        }) => {
          if (data.errorCode >= 0) {
            that.voiceContext().playNextDay()
            that.blackScreen('show', '过了一夜...', function() {
              that.setData({
                maskShow: false
              })
            }, function() {
              that.getEventStack().init(false)
              // that.getEventStack().push({ category: 'random' })
              that.voiceContext().playResult()
              that.setData({
                submitFlag: false,
                maskShow: true,
                dialogShow: true,
                dialogResult: data.resultArray
              })
            })
          }
          console.info(data)
        }
      )
    }
  },
  done: function(e) {
    const that = this
    if (that.data.userState.hour > 0 || that.data.submitFlag) {
      wx.showToast({
        title: '请继续四处逛逛消耗时间，再完成评分。',
        icon: 'none',
        duration: 2000
      })
      return false
    } else {
      that.voiceContext().playClick()
      if (e) {
        that.pushFormSubmit(e)
      }
      that.setData({
        submitFlag: true,
        lastComment: 'zhenjia'
      })
      wx.navigateTo({
        url: './report',
        complete: () => {
          that.setData({
            submitFlag: false
          })
          setTimeout(function() {
            that.setData({
              hasUserInfo: false
            })
          }, 2000)
        }
      })
    }
  },
  viewHelp: function() {
    wx.navigateTo({
      url: './help',
    })
  },
  viewRankingList: function() {
    wx.navigateTo({
      url: './rankingList',
    })
  },
  viewMyReport: function() {
    if (this.data.lastComment && this.data.currentDays == 0 && this.data.currentHours == 0) {
      wx.navigateTo({
        url: './report',
      })
    }
  },
  pushFormSubmit: function(e) {
    if (e) {
      console.info(e)
      if (app.globalData.userData && e.detail.formId) {
        e.target.dataset.action
        wxPost('/user/submit', {
          'userId': app.globalData.userData.userId,
          'formId': e.detail.formId,
          'action': e.target.dataset.action
        }, ({
          data
        }) => {
          console.info(data)
        })
      }
    }
  },

  onShareAppMessage(opt) {
    let title = '全民混北京，三分靠努力，七分靠打拼，剩下九十分靠天意！'
    let imgSrc = ''
    if (app.globalData.shareObj) {
      title = app.globalData.shareObj.title
      imgSrc = app.globalData.shareObj.imgSrc
    }
    console.info("onShareAppMessage");
    return {
      title: title,
      imageUrl: imgSrc,
      path: '/pages/index/index',
      success: function (res) {
        console.info('a')
        // 转发成功之后的回调
        if (res.errMsg == 'shareAppMessage:ok') {
        }
      },
      fail: function () {
        // 转发失败之后的回调
        if (res.errMsg == 'shareAppMessage:fail cancel') {
          // 用户取消转发
        } else if (res.errMsg == 'shareAppMessage:fail') {
          // 转发失败，其中 detail message 为详细失败信息
        }
      }, complete: function () {
        // 转发结束之后的回调（转发成不成功都会执行）
      }
    }
  }
}

Object.assign(options, biz)

Page(options)