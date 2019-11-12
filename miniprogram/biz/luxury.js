const { wxPost, isEnableBtn, showMaskNavigationBarColor, closeMaskNavigationBarColor } = require('../utils/common.js')


const show = 'luxuryShow'
const foldShow = 'myLuxuryShow'
const items = 'luxuryItems'

export default {
  data: {
    [foldShow]: false,
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
  actionLuxury: function () {
    if (this.data.hangOn && this.data.eventShow) return 
    showMaskNavigationBarColor()
    this.setData({ [show]: true, maskShow: true })
    this.voiceContext().playClick()
  },
  closeLuxury: function () {
    closeMaskNavigationBarColor()
    this.setData({ [show]: false, maskShow: false })
    this.voiceContext().playClick()
  },
  showMyLuxury: function () {
    if (this.data.hangOn && this.data.eventShow) return  
    showMaskNavigationBarColor()
    this.setData({ [foldShow]: true, maskShow: true })
    this.voiceContext().playClick()
  },
  closeMyLuxury: function () {
    closeMaskNavigationBarColor()
    this.setData({ [foldShow]: false, maskShow: false })
    this.voiceContext().playClick()
  },
  buyLuxury: function (e) {
    const that = this
    if (that.data.userState.luxuryLimit == 1 && that.data.submitFlag) {
      return false
    } else {
      that.voiceContext().playClick()
      that.setData({ submitFlag: true })
      let luxuryId = e.currentTarget.dataset.id
      if (luxuryId) {
        wx.cloud.callFunction({
          name: 'res',
          data: {
            $url: "buyLuxury",
            userId: that.data.userData._id,
            gender: that.data.userData.gender,
            luxuryId: luxuryId
          }
        }).then(res => {
          console.info(res)
          const { errorCode, data } = res.result
          if (errorCode >= 0) {
            that.setData({ submitFlag: false, [show]: false, dialogShow: true, dialogResult: data.resultArray })
            that.resultVoice(data)
          }
        }).catch(err => {

        })

        // wxPost(
        //   '/user/buyLuxury',
        //   {
        //     userId: that.data.userData.userId,
        //     luxuryId: luxuryId
        //   },
        //   ({ data }) => {
        //     if (data.errorCode >= 0) {
        //       that.setData({ submitFlag: false, [show]: false, dialogShow: true, dialogResult: data.resultArray })
        //       that.resultVoice(data)
        //     }
        //   }
        // )
      }
    }
  },
  sellLuxury: function (e) {
    const that = this
    if (that.data.userState.luxuryLimit == 1 && that.data.submitFlag) {
      return false
    } else {
      that.voiceContext().playClick()
      that.setData({ submitFlag: true })
      let luxuryId = e.currentTarget.dataset.id
      if (luxuryId) {
        wx.cloud.callFunction({
          name: 'res',
          data: {
            $url: "sellLuxury",
            userId: that.data.userData._id,
            gender: that.data.userData.gender,
            luxuryId: luxuryId
          }
        }).then(res => {
          console.info(res)
          const { errorCode, data } = res.result
          if (errorCode >= 0) {
            that.setData({ submitFlag: false, [foldShow]: false, [show]: false, dialogShow: true, dialogResult: data.resultArray })
            that.resultVoice(data)
          }
        }).catch(err => {

        })
        // wxPost(
        //   '/user/sellLuxury',
        //   {
        //     userId: that.data.userData.userId,
        //     luxuryId: luxuryId
        //   },
        //   ({ data }) => {
        //     if (data.errorCode >= 0) {
        //      // that.getEventStack().push({ category: 'random-luxury' })
        //       that.setData({ submitFlag: false, [foldShow]: false, [show]: false, dialogShow: true, dialogResult: data.resultArray })
        //       that.resultVoice(data)
        //     }
        //   }
        // )
      }
    }
  }
}