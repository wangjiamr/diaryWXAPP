// pages/index/RankingList.js
const { formatTime } = require('../../utils/util.js') 
const { wxGet} = require('../../utils/common.js')
const app = getApp()
Page({
  data: {
    list:[],
    coupleArray:null,
    myData: null,
    lastUpdate:'',
    show:false,
    activeType:'score',
    ruleShow:false,
    char_lt:'<'
  },
  onLoad: function (options) {
    this.loadRankings(true)
  },
  selected: function (e){
    const that = this
    let activetype = e.currentTarget.dataset.activetype
    that.setData({
      activeType: activetype
    })
    if (activetype!='couple'){
      that.loadRankings()
    } else if (activetype === 'couple') {
      that.loadCouple()
    }
  },
  loadRankings:function(f){
    const that = this
    
    wx.showLoading({
      title: '请稍等...',
    })
    this.setData({
      show: false,
      lastUpdate: formatTime(new Date())
    })
    let userId = app.globalData.userId
   
    if (!userId) {
      userId = 86125
    }
    wxGet(`/user/rankings/${userId}`, { 'orderType': that.data.activeType}, ({ data }) => {
      if (data.errorCode >= 0) {
        if (!data.myData){
          data.myData=false
        }
        const { list, myData } = data
        that.setData({
          list, myData
        })
      }
    }, null, () => {
      setTimeout(function () {
        let t=500
        if(f){
          t+=500
        }
        that.setData({
          show: true
        })
        wx.hideLoading()
      }, 500)
    })
  },
  loadCouple: function () {
    const that = this

    wx.showLoading({
      title: '请稍等...',
    })
    this.setData({
      show: false,
      lastUpdate: formatTime(new Date())
    })
    
    wxGet(`/user/coupleRankings`, {}, ({ data }) => {
      if (data.errorCode >= 0) {
        
        const { coupleArray } = data
        that.setData({
          coupleArray
        })
      }
    }, null, () => {
      setTimeout(function () {
        let t = 500
        that.setData({
          show: true
        })
        wx.hideLoading()
      }, 500)
    })
  },
  viewMyReport: function (){
    if(this.data.myData.score>0){
      wx.navigateTo({
        url: './report?userId=' + app.globalData.userId,
      })
    }
  },
  viewReport: (e) => {
    let uid = e.currentTarget.dataset.id
    if (uid){
      wx.navigateTo({
        url: './report?userId=' + uid,
      })
    }
  },
  backHome:function(){
    wx.navigateBack({
      delta:1
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },
  onShareAppMessage(opt){
    wx.showShareMenu({
      withShareTicket: true
    })
    let title = '全民混北京，三分靠努力，七分靠打拼，剩下九十分靠天意！'
    let imgSrc = ''
    if (app.globalData.shareObj) {
      title = app.globalData.shareObj.title
      imgSrc = app.globalData.shareObj.imgSrc
    }
    console.info(opt)
    return {
      title: title,
      imageUrl: imgSrc,
      path: '/pages/index/index',
      success: function (res) {
        console.info('a')
        // 转发成功之后的回调
        if (res.errMsg == 'shareAppMessage:ok') {
        }
      },
      fail: function () {
        // 转发失败之后的回调
        if (res.errMsg == 'shareAppMessage:fail cancel') {
          // 用户取消转发
        } else if (res.errMsg == 'shareAppMessage:fail') {
          // 转发失败，其中 detail message 为详细失败信息
        }
      }, complete: function () {
        // 转发结束之后的回调（转发成不成功都会执行）
      }
    }
  }
})