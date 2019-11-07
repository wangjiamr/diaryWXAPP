const { wxPost, wxGet, isEnableBtn, showMaskNavigationBarColor, closeMaskNavigationBarColor } = require('../utils/common.js')


const show = 'coupleShow'
const foldShow = 'myCoupleShow'
const items = 'coupleItems'

export default {
  data: {
    [foldShow]: false,
    [show]: false,
    [items]: [],
    coupleState:[]
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
  actionCouple: function () {
    if (this.data.hangOn && this.data.eventShow) return 
    const that = this
    that.voiceContext().playClick()
    wxGet('/couple/state',
      {gender: that.data.userData.gender},
      ({ data }) => {
        console.info(data)
        if (data.errorCode === 0) {
          showMaskNavigationBarColor()
          that.setData({ [show]: true, maskShow: true, coupleState: data.state })
        }
      })
  },
  closeCouple: function () {
    closeMaskNavigationBarColor()
    this.setData({ [show]: false, maskShow: false })
    this.voiceContext().playClick()
  },
  showMyCouple: function () {
    if (this.data.hangOn && this.data.eventShow) return 
    showMaskNavigationBarColor()
    this.setData({ [foldShow]: true, maskShow: true })
    this.voiceContext().playClick()
  },
  closeMyCouple: function () {
    closeMaskNavigationBarColor()
    this.setData({ [foldShow]: false, maskShow: false })
    this.voiceContext().playClick()
  },
  relationship: function (e) {
    const that = this
    if (that.data.userState.coupleLimit == 1 && that.data.submitFlag) {
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
      let coupleId = e.currentTarget.dataset.id
      if (coupleId) {
        wxPost(
          '/user/relationship',
          {
            userId: that.data.userData.userId,
            coupleId: coupleId
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
  breakUp:function(e){
    const that = this
    if (that.data.userState.coupleLimit == 1 && that.data.submitFlag) {
      return false
    } else {
      that.voiceContext().playClick()
      that.setData({ submitFlag: true })
      let coupleId = e.currentTarget.dataset.id
      if (coupleId) {
        wxPost(
          '/user/breakUp',
          {
            userId: that.data.userData.userId,
            coupleId: coupleId
          },
          ({ data }) => {
            if (data.errorCode >= 0) {
             // that.getEventStack().push({ category: 'random-couple' })
              that.setData({ submitFlag: false, [foldShow]: false,[show]: false, dialogShow: true, dialogResult: data.resultArray })
              that.resultVoice(data)
            }
          }
        )
      }
    }
  }
}