// pages/index/help.js
const { wxGet, } = require('../../utils/common.js')
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    char_lt: '<',
    tipArray:false,
    gender:'',
    activeType: 'base',
    wxNumber:'https://img.jinrongzhushou.com/common/zhenjia.jpeg'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loadRankings()
    
  },
  selected: function (e) {
    const that = this
    let activetype = e.currentTarget.dataset.activetype
    that.setData({
      activeType: activetype
    })
    
  },
  loadRankings: function (f) {
    const that = this
    wx.showLoading({
      title: '请稍等...',
    })

    wxGet(`/user/help/`, null, ({ data }) => {
      if (data.errorCode >= 0) {
        const { tipArray } = data
        that.setData({
          tipArray, gender: app.globalData.userData.gender
        })
      }
    }, null, () => {
      setTimeout(function () {
        wx.hideLoading()
      }, 500)
    })
  },

  previewImage: function () {
    var current = this.data.wxNumber
    console.info(current)
    wx.previewImage({
      current: current, // 当前显示图片的http链接
      urls: [current]
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
   
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage(opt) {
    let title = '全民混北京，三分靠努力，七分靠打拼，剩下九十分靠天意！'
    let imgSrc = ''
    if (app.globalData.shareObj) {
      title = app.globalData.shareObj.title
      imgSrc = app.globalData.shareObj.imgSrc
    }
    return {
      title: title,
      imageUrl: imgSrc,
      path: '/pages/index/index',
      success: (res) => {
        console.log("转发成功", res);
      },
      fail: (res) => {
        console.log("转发失败", res);
      }
    }
  }
})