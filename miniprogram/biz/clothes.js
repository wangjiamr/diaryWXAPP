const { wxPost, isEnableBtn, showMaskNavigationBarColor, closeMaskNavigationBarColor } = require('../utils/common.js')


const show = 'clothesShow'
const foldShow = 'myClothesShow'
const items = 'clothesItems'

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
  actionClothes: function () {
    if (this.data.hangOn && this.data.eventShow) return 
    showMaskNavigationBarColor()
    this.setData({ [show]: true, maskShow: true })
    this.voiceContext().playClick()
  },
  closeClothes: function () {
    closeMaskNavigationBarColor()
    this.setData({ [show]: false, maskShow: false })
    this.voiceContext().playClick()
  },
  showMyClothes: function () {
    if (this.data.hangOn && this.data.eventShow) return 
    showMaskNavigationBarColor()
    this.setData({ [foldShow]: true, maskShow: true })
    this.voiceContext().playClick()
  },
  closeMyClothes: function () {
    closeMaskNavigationBarColor()
    this.setData({ [foldShow]: false, maskShow: false })
    this.voiceContext().playClick()
  },
  buyClothes: function (e) {
    const that = this
    if (that.data.userState.clothesLimit == 1 && that.data.submitFlag) {
      return false
    } else {
      that.voiceContext().playClick()
      that.setData({ submitFlag: true })
      let clothesId = e.currentTarget.dataset.id
      if (clothesId) {
        wxPost(
          '/user/buyClothes',
          {
            userId: that.data.userData.userId,
            clothesId: clothesId
          },
          ({ data }) => {
            if (data.errorCode >= 0) {
              that.setData({ submitFlag: false, [show]: false, dialogShow: true, dialogResult: data.resultArray })
              that.resultVoice(data)
            }
          }
        )
      }
    }
  },
  sellClothes: function (e) {
    const that = this
    if (that.data.userState.clothesLimit == 1 && that.data.submitFlag) {
      return false
    } else {
      that.voiceContext().playClick()
      that.setData({ submitFlag: true })
      let clothesId = e.currentTarget.dataset.id
      if (clothesId) {
        wxPost(
          '/user/sellClothes',
          {
            userId: that.data.userData.userId,
            clothesId: clothesId
          },
          ({ data }) => {
            if (data.errorCode >= 0) {
            //  that.getEventStack().push({ category: 'random-clothes' })
              that.setData({ submitFlag: false, [foldShow]: false, [show]: false, dialogShow: true, dialogResult: data.resultArray })
              that.resultVoice(data)
            }
          }
        )
      }
    }
  }
}