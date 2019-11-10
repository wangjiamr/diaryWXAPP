const { wxPost, isEnableBtn, showMaskNavigationBarColor, closeMaskNavigationBarColor } = require('../utils/common.js')

const show = 'carShow'
const foldShow = 'myCarShow'
const items = 'carItems'

export default {
  data: {
    [foldShow]: false,
    [show]: false,
    [items]: []
  },
  watch: {
    [show]: function(n,o) {
      if (!n) {
        //reset scollbar 
        const dateItem = this.data[items]
        this.setData({ [items]: [] })
        this.setData({ [items]: dateItem })
      }
    }
  },
  actionCar: function () {
    if (this.data.hangOn && this.data.eventShow) return 
    showMaskNavigationBarColor()
    this.setData({ [show]: true, maskShow: true })
    this.voiceContext().playClick()
  },
  closeCar: function () {
    closeMaskNavigationBarColor()
    this.setData({ [show]: false, maskShow: false })
    this.voiceContext().playClick()
  },
  showMyCar: function () {
    if (this.data.hangOn && this.data.eventShow) return 
    showMaskNavigationBarColor()
    this.setData({ [foldShow]: true, maskShow: true })
    this.voiceContext().playClick()
  },
  closeMyCar: function () {
    closeMaskNavigationBarColor()
    this.setData({ [foldShow]: false, maskShow: false })
    this.voiceContext().playClick()
  },
  buyCar:function(e){
    const that = this
    if (that.data.userState.carLimit == 1 && that.data.submitFlag) {
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
      let carId = e.currentTarget.dataset.id
      if (carId) {
        wx.cloud.callFunction({
          name: 'res',
          data: {
            $url: "buyCar",
            userId: that.data.userData._id,
            gender: that.data.userData.gender,
            carId: carId
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
        //   '/user/buyCar',
        //   {
        //     userId: that.data.userData.userId,
        //     carId: carId
        //   },
        //   ({ data }) => {
        //     if (data.errorCode >= 0) {
        //       that.setData({ submitFlag: false, [show]: false, dialogShow: true, dialogResult: data.resultArray })
        //       that.resultVoice(data)
        //     }
        //     console.info(data)
        //   }
        // )
      }
    }
  },
  sellCar: function (e) {
    const that = this
    if (that.data.userState.carLimit == 1 && that.data.submitFlag) {
      return false
    } else {
      that.voiceContext().playClick()
      that.setData({ submitFlag: true })
      let carId = e.currentTarget.dataset.id
      if (carId) {
        wxPost(
          '/user/sellCar',
          {
            userId: that.data.userData.userId,
            carId: carId
          },
          ({ data }) => {
            if (data.errorCode >= 0) {
             // that.getEventStack().push({ category: 'random-car' })
              that.setData({ submitFlag: false, [foldShow]: false, [show]: false, dialogShow: true, dialogResult: data.resultArray })
              that.resultVoice(data)
            }
          }
        )
      }
    }
  }
}