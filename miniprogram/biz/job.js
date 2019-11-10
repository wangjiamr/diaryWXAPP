const { wxPost, isEnableBtn, showMaskNavigationBarColor, closeMaskNavigationBarColor } = require('../utils/common.js')
const show ='jobShow'
const foldShow ='myJobShow'
const items = 'jobItems'

export default {
  data: {
    [foldShow]:false,
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
  actionJob: function () {
    if (this.data.hangOn && this.data.eventShow) return 
    showMaskNavigationBarColor()
    this.setData({ [show]: true, maskShow: true })
    this.voiceContext().playClick()
  },
  closeJob: function () {
    closeMaskNavigationBarColor()
    this.setData({ [show]: false, maskShow: false })
    this.voiceContext().playClick()
  },
  showMyJob:function(){
    if (this.data.hangOn && this.data.eventShow) return 
    showMaskNavigationBarColor()
    this.setData({ [foldShow]: true, maskShow: true })
    this.voiceContext().playClick()
  },
  closeMyJob:function(){
    closeMaskNavigationBarColor()
    this.setData({ [foldShow]: false, maskShow: false })
    this.voiceContext().playClick()
  },
  applyJob: function (e) {
    const that = this
    if (that.data.userState.jobLimit == 1 && that.data.submitFlag){
      wx.showModal({
        title: '提示',
        content: '当前不能操作',
        success(res) {

        }
      })
      return false
    }else{
      that.voiceContext().playClick()
      that.setData({ submitFlag: true })
      let jobId = e.currentTarget.dataset.id
      if(jobId){
        wx.cloud.callFunction({
          name: 'res',
          data: {
            $url: "applyJob",
            userId: that.data.userData._id,
            gender: that.data.userData.gender,
            jobId: jobId
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
        //   '/user/applyJob',
        //   {
        //     userId:that.data.userData.userId,
        //     jobId:jobId
        //   },
        //   ({ data }) => {
        //     if(data.errorCode>=0){
        //       that.setData({ submitFlag: false, [show]: false, dialogShow: true, dialogResult: data.resultArray })
        //       that.resultVoice(data)
        //      // that.getEventStack().push({ category: 'random-job' })
        //     }
        //   }
        // )
      }
    }
  }
}