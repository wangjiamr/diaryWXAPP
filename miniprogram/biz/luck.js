const { wxPost, isEnableBtn, showMaskNavigationBarColor, closeMaskNavigationBarColor } = require('../utils/common.js')

const show = 'luckShow'
const items = 'luckItems'

export default {
  data: {
    [show]: false,
    [items]: []
  },
  watch: {
    [show]: function (n, o) {
      if (!n) {
        //reset scollbar 
        const dateItem = this.data[items]
        this.setData({ [items]: [] })
        this.setData({ [items]: dateItem })
      }
    }
  },
  actionLuck: function () {
    if (this.data.hangOn && this.data.eventShow) return 
    showMaskNavigationBarColor()
    this.setData({ [show]: true, maskShow: true })
    this.voiceContext().playClick()
  },
  closeLuck: function () {
    closeMaskNavigationBarColor()
    this.setData({ [show]: false, maskShow: false })
    this.voiceContext().playClick()
  },
  applyLuck: function (e) {
    const that = this
    if (that.data.userState.luckLimit == 1 && that.data.submitFlag) {
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
      let luckId = e.currentTarget.dataset.id
      if (luckId) {

        wx.cloud.callFunction({
          name: 'res',
          data: {
            $url: "applyLuck",
            userId: that.data.userData._id,
            gender: that.data.userData.gender,
            luckId: luckId
          }
        }).then(res => {
          console.info(res)
          const { errorCode, data } = res.result
          if (errorCode >= 0) {
            that.setData({ submitFlag: false, [show]: false, dialogShow: true, dialogResult: data.resultArray })
            that.resultVoice(data, true)
          }
        }).catch(err => {

        })
        // wxPost(
        //   '/user/applyLuck',
        //   {
        //     userId: that.data.userData.userId,
        //     luckId: luckId
        //   },
        //   ({ data }) => {
        //     if (data.errorCode >= 0) {
        //       //that.getEventStack().push({ category: 'random-luck' })
        //       that.setData({ submitFlag: false, [show]: false, dialogShow: true, dialogResult: data.resultArray })
        //       that.resultVoice(data,true)
        //     }
        //   }
        // )
      }
    }
  }
}