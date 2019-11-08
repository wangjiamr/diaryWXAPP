const { wxPost, isEnableBtn, showMaskNavigationBarColor, closeMaskNavigationBarColor ,wxGet} = require('../utils/common.js')

const app=getApp()
const show = 'planShow'
const items ='planItems'

export default {
  data: {
    [show]: false,
    [items]: []
  },
  watch:{
    [show]: function (n, o) {
      if (!n) {
        //reset scollbar 
        const dateItem = this.data[items]
        this.setData({ [items]: [] })
        this.setData({ [items]: dateItem })
      }
    }
  },
  actionPlan: function () {
    if (this.data.hangOn && this.data.eventShow) return 
    showMaskNavigationBarColor()
    this.setData({ [show]: true, maskShow: true })
    this.voiceContext().playClick()
  },
  closePlan: function () {
    closeMaskNavigationBarColor()
    this.setData({ [show]: false, maskShow: false })
    this.voiceContext().playClick()
  },
  applyPlan: function (e) {
    const that = this
    if (that.data.submitFlag || that.data.userState.hours==0) {
      wx.showModal({
        title: '提示',
        content: '当前不能操作',
        success(res) {
          
        }
      })
      return false
    } else {
      that.voiceContext().playClick()
      that.setData({ submitFlag: true })
      let planId = e.currentTarget.dataset.id
      if (planId) {
        wxPost(
          '/user/applyPlan',
          {
            userId: that.data.userData.userId,
            planId: planId
          },
          ({ data }) => {
            if (data.errorCode >= 0) {
              if (Math.ceil(Math.random() * 100) > 35) {
                that.getEventStack().push({ category: 'random',restart:true })
              } else {
                that.getEventStack().push({ category: 'random', restart: true})//删除plan的event 直接调用事件的event
                //that.getEventStack().push({ id: planId, category: 'plan' })
              }
              that.setData({
                findEventId:planId,
                findEventType:'plan',
                submitFlag: false, [show]: false, dialogShow: true, dialogResult: data.resultArray })
              that.resultVoice(data)
            }
           // console.info(data)
          }
        )
      }
    }
  }
}