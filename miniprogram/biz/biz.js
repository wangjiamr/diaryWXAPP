import job from './job.js'
import plan from './plan.js'
import car from './car.js'
import house from './house.js'
import couple from './couple.js'
import clothes from './clothes.js'
import luxury from './luxury.js'
import luck from './luck.js'
import event from './event.js'
import fund from './fund.js'

const { wxGet, parseUserState, showMaskNavigationBarColor,closeMaskNavigationBarColor } = require('../utils/common.js')
const app = getApp()
const commonData = {
  attrList: [],
  lastComment:'',
  currentDays:1,
  currentHours:1,
  userState: false,
  userData: false,
  hasUserInfo: false,
  hasLogin: false,
  hasAuth: false,
  waitLoading: true,
  canIUse: wx.canIUse('button.open-type.getUserInfo'),
  nightClass:'',
  nightText:'',
  nightTip:'',
  submitFlag: false,
  maskShow: false,
  dialogShow:false,
  dialogPic: 'jieguo',
  dialogResult:'',
  dialogBtn:'确 定',
  tipShow: false,
  tipItems: [],
  findEventId:'',
  findEventType:'',
  hangOn:false
}
function storeMixin(options) {
  let result = {
    data: commonData,
    watch:{
      'maskShow':function(n,o){
        const that=this
        if (!n) { //show event 
          setTimeout(() => {
            // const userId = this.data.userData.userId
            let hour = this.data.userState.hours
            let { userId, gender } = this.data.userData
            hour=parseInt(hour)
            if (!that.data.maskShow && userId && hour && hour !==6) {
              const { id: findEventId, category } = this.getEventStack().pop() || {}
              const stack = that.getEventStack()
              if (findEventId && category === 'plan') {
               // that.setData({ hangOn: true })
                wxGet('/user/plan/findEvent',
                  { userId, findEventId },
                  ({ data }) => {
                    const eventId = data['eventId']
                    if (stack.isHappened(eventId)){
                      stack.addMaxCount()
                      return 
                    }
                    if (data.errorCode >= 0) {
                      wxGet('/userEvent/load',
                        { userId, eventId },
                        ({ data }) => {
                          if (data.errorCode >= 0) {
                            if (!that.data.maskShow) {//请求结束再次判断时候有其他弹出
                              that.hiddenDialog()//如果有dialog显示,关闭dialog
                              that.showEvent(data)
                              setTimeout(()=>{
                                that.hiddenDialog()//如果有dialog显示,关闭dialog
                              },500)
                              if (Math.ceil(Math.random() * 100) < stack.continueOdds()) {
                                stack.push({ category: 'random' })
                              }
                            }
                          }
                          that.setData({ hangOn: false })
                        },  () => {//load complete callback
                          that.setData({ hangOn: false })
                        })
                    }else{
                      that.setData({ hangOn: false })
                    }
                  },  () => {//findEvent complete callback
                    that.setData({ hangOn: false })
                  })
              } else if (category && category !== 'plan') {
                wxGet('/userEvent/findEvent',
                  { userId },
                  ({ data }) => {
                    const eventId = data['eventId']
                    if (stack.isHappened(eventId)) {//加载到重复事件,50%继续添加
                      stack.addMaxCount()
                      if (Math.ceil(Math.random() * 100) > 50) {
                        stack.push({ category: 'random' })
                      }
                      return
                    }
                    wx.showLoading({
                      title: `${gender === 1 ? '骚年' : '少女'}留步...`,
                    })
                    setTimeout(()=>{//5s强制关闭loading
                      wx.hideLoading()
                    },5000)
                    if (data.errorCode >= 0) {
                     // that.setData({ hangOn: true })
                      wxGet('/userEvent/load',
                        { userId, eventId },
                        ({ data }) => {
                          if (data.errorCode >= 0) {
                            if (!that.data.maskShow) {//请求结束再次判断时候有其他弹出  
                              //console.info(this.data.userState)
                              that.hiddenDialog()//如果有dialog显示,关闭dialog
                              that.showEvent(data)
                              setTimeout(() => {
                                that.hiddenDialog()//如果有dialog显示,关闭dialog
                              }, 500)
                              const randomPoint = Math.ceil(Math.random() * 100)
                              const odds = stack.continueOdds()
                              if (randomPoint < odds) {
                                stack.push({ category: 'random' })
                                console.info(randomPoint, odds, ' still push event')
                              }
                            }else{
                              wx.hideLoading()
                            }
                          }else{
                            wx.hideLoading()
                          }
                          that.setData({ hangOn: false })
                        },  () => {//load fail callback
                          wx.hideLoading()
                          that.setData({ hangOn: false })
                        })
                    } else {
                      wx.hideLoading()
                      that.setData({ hangOn: false })
                    }
                  },  () => {//findEvent fail callback
                    that.setData({ hangOn: false })
                  })
              }
            }else{
              if(!hour || hour===6){
                console.info('wrong time for show event and hour = '+hour)
              }
            }
          }, 1500)
        }
      },
      'hangOn':function(n,o){
        if(n){
          const that=this
          setTimeout(()=>{
            that.setData({
              hangOn:false
            })
          },5000)
        }
      }
    },
    closeTip: function () {
      const that = this
      closeMaskNavigationBarColor()
      that.voiceContext().playClick()
      that.setData({ tipShow: false, maskShow: false })
    },
    actionTip: function () {
      const that = this
      wx.navigateTo({
        url: './help',
      })
    },
    resultVoice: function (data,luckWin){
      const that = this
      if (data){
        if (data.errorCode == 0) {
          if (luckWin){
            that.voiceContext().playWin()
          }else{
            that.voiceContext().playResult()
          }
        } else if (data.errorCode == 1) {
          that.voiceContext().playFail()
        }
      }
    },
    autoTip:function(){
      const that = this
      if (that.data.userState.hours == 0) {
        if (that.data.userState.days > 0) {
          wx.showToast({
            title: '当日小时已耗尽，点击右上角可以进入下一天',
            icon: 'none',
            duration: 2500
          })
        }else{
          wx.showToast({
            title: '点击右上角立刻获得评分',
            icon: 'none',
            duration: 2500
          })
        }
      }
    },
    dialogOK:function(){
      const that=this
      if (that.data.userState.live) {
        that.voiceContext().playClick()
        wx.cloud.callFunction({
          name: 'res',
          data: {
            $url: "refresh",
            userId: that.data.userData._id
          }
        }).then(res => {
          console.info(res)
          const { errorCode, data } = res.result
          if (errorCode >= 0) {
            parseUserState(data, that)
            closeMaskNavigationBarColor()
            if (data.userState.live) {
              that.setData({ maskShow: false, dialogShow: false, dialogPic: 'jieguo' })
              that.autoTip()
            } else {
              that.setData({ maskShow: false, dialogShow: false })
              that.voiceContext().playOver()
              setTimeout(function () {
                that.setData({ maskShow: true, dialogShow: true, dialogResult: data.resultArray })
              }, 2000)
            }
          }
        }).catch(err => {
        })
        // wxGet('/user/refresh/' + that.data.userData.userId,
        //   false,
        //   ({ data }) => {
        //     parseUserState(data, that)
        //     closeMaskNavigationBarColor()
        //     if (data.userState.live) {
        //       that.setData({ maskShow: false, dialogShow: false, dialogPic: 'jieguo' })
        //       that.autoTip()
        //     } else {
        //       that.setData({ maskShow: false, dialogShow: false })
        //       that.voiceContext().playOver()
        //       setTimeout(function () {
        //         that.setData({ maskShow: true, dialogShow: true,dialogResult: data.resultArray })
        //       }, 2000)
        //     }
        //   })
      }else{
        that.done()
      }
    },
    blackScreen:function(showClass,text,blackCallback,doneCallback){
      const that = this
      const times=showClass==='show'?1000:0
      wx.setNavigationBarColor({
        frontColor: '#ffffff',
        backgroundColor: '#000',
        animation: {
          duration: times,
          timingFunc: 'easeIn'
        }
      })
      that.setData({ nightClass: showClass })
      setTimeout(function () {
        that.setData({ nightText: text, nightTip:'四处逛逛,生活节奏慢点可能触发偶遇' })
        if (blackCallback) {
          blackCallback()
        }
      }, 1200)
      setTimeout(function () {
        that.setData({ nightClass: 'show hide', nightText: '', nightTip:'' })
        wx.setNavigationBarColor({
          frontColor: '#ffffff',
          backgroundColor: '#2e55af',
          animation: {
            duration: 1000,
            timingFunc: 'easeIn'
          }
        })
      }, 2500)
      setTimeout(function () {
        that.setData({ nightClass: '' })
        if (doneCallback){
          doneCallback()
        }
      }, 3500)
    },
    hiddenDialog:function(){
      this.setData({
        //maskShow:false,
        carShow:false,
        myCarShow:false,
        clothesShow:false,
        myClothesShow:false,
        coupleShow: false,
        myCoupleShow: false,
        fundShow: false,
        houseShow: false,
        myHouseShow: false,
        jobShow: false,
        myJobShow: false,
        luckShow:false,
        luxuryShow: false,
        myLuxuryShow: false,
        planShow: false
      })
    }
  }
  for (let k in options) {
    let value = options[k];
    if (value.data) {
      //result.data[k] = value.data
      Object.assign(result.data, value.data)
      delete value.data
    }
    if(value.watch){
      Object.assign(result.watch, value.watch)
      delete value.watch
    }
    Object.assign(result, value)
  }
  return result;
}

export default storeMixin({ job, plan, car, house, couple, clothes, luxury, luck, event, fund})