const { wxPost, isEnableBtn, showMaskNavigationBarColor, closeMaskNavigationBarColor} = require('../utils/common.js')


const show = 'houseShow'
const foldShow = 'myHouseShow'
const items = 'houseItems'

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
  actionHouse: function () {
    if (this.data.hangOn && this.data.eventShow) return 
    showMaskNavigationBarColor()
    this.setData({ [show]: true, maskShow: true })
    this.voiceContext().playClick()
  },
  closeHouse: function () {
    closeMaskNavigationBarColor()
    this.setData({ [show]: false, maskShow: false })
    this.voiceContext().playClick()
  },
  showMyHouse: function () {
    if (this.data.hangOn && this.data.eventShow) return 
    showMaskNavigationBarColor()
    this.setData({ [foldShow]: true, maskShow: true })
    this.voiceContext().playClick()
  },
  closeMyHouse: function () {
    closeMaskNavigationBarColor()
    this.setData({ [foldShow]: false, maskShow: false })
    this.voiceContext().playClick()
  },
  buyHouse: function (e) {
    const that = this
    if (that.data.userState.houseLimit == 1 && that.data.submitFlag) {
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
      let houseId = e.currentTarget.dataset.id
      if (houseId) {
        wxPost(
          '/user/buyHouse',
          {
            userId: that.data.userData.userId,
            houseId: houseId
          },
          ({ data }) => {
            if (data.errorCode >= 0) {
              that.setData({ submitFlag: false, [show]: false, dialogShow: true, dialogResult: data.resultArray })
              that.resultVoice(data)
            }
            console.info(data)
          }
        )
      }
    }
  },
  sellHouse: function (e) {
    const that = this
    if (that.data.userState.houseLimit == 1 && that.data.submitFlag) {
      return false
    } else {
      that.voiceContext().playClick()
      that.setData({ submitFlag: true })
      let houseId = e.currentTarget.dataset.id
      if (houseId) {
        wxPost(
          '/user/sellHouse',
          {
            userId: that.data.userData.userId,
            houseId: houseId
          },
          ({ data }) => {
            if (data.errorCode >= 0) {
              //that.getEventStack().push({ category: 'random-house' })
              that.setData({ submitFlag: false, [foldShow]: false, [show]: false, dialogShow: true, dialogResult: data.resultArray })
              that.resultVoice(data)
            }
          }
        )
      }
    }
  }
}