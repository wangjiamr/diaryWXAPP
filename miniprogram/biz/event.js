const { wxPost, isEnableBtn, showMaskNavigationBarColor, closeMaskNavigationBarColor } = require('../utils/common.js')

const show = 'eventShow'
const items = 'eventItems'

export default {
  data: {
    [show]: false,
    [items]: [],
    eventTitle:null
  },
  watch: {
    [show]: function (n, o) {
      if (!n) { //reset scollbar 
        const dateItem = this.data[items]
        this.setData({ [items]: [] })
        this.setData({ [items]: dateItem })
      }
    }
  },
  showEvent:function(data){
    setTimeout(()=>{
      wx.hideLoading()
      let hour = this.data.userState.hours
      hour = parseInt(hour)
      if (data && hour && hour !== 6) {
        //console.info(this)
        this.voiceContext().playEvent()
        this.setData({
          eventShow: true,
          maskShow: true,
          eventItems: data['eventResultArray'],
          eventTitle: data['event']['content']
        })
      }
    },1000) 
  },
  applyEvent: function (e) {
    const that = this
    if ( that.data.submitFlag) {
      return false
    } else {
      that.voiceContext().playClick()
      that.setData({ submitFlag: true })
      let resultId = e.currentTarget.dataset.id
      const userId=that.data.userData.userId
      if (resultId) {
        wxPost(
          '/userEvent/applyResult',
          { userId, resultId },
          ({ data }) => {
            if (data.errorCode >= 0) {
              that.setData({ submitFlag: false, [show]: false, dialogShow: true, dialogResult: data.resultArray })
              that.resultVoice(data)
            }
          }
        )
      }
    }
  }
}