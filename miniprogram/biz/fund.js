const { wxGet,wxPost, isEnableBtn, showMaskNavigationBarColor, closeMaskNavigationBarColor } = require('../utils/common.js')
import { DrawKLine } from '../utils/DrawKLine.js'

const show = 'fundShow'
const items = 'fundItems'

export default {
  data: {
    [show]: false,
    [items]: [],
    fundDetailShow:false,
    fundItem:0,
    canvasHeight:null,
    canvasWidth:null,
    fundMoney:'',
    diffMoney:'',
    sellMoney:'',
    buyMoney:''
  },
  bindSellInput(e){
    this.setData({
      sellMoney: e.detail.value
    })
  },
  bindBuyInput(e) {
    this.setData({
      buyMoney: e.detail.value
    })
  },
  watch: {
    [show]: function (n, o) {
      if (!n) {
        //reset scollbar 
        const dateItem = this.data[items]
        this.setData({ [items]: [] })
        this.setData({ [items]: dateItem })
      }
    },
    'fundDetailShow':function(n,o){
      if(!n){
        this.setData({//init
          fundItem: 0,
          sellMoney:'',
          buyMoney:'',
          fundMoney:'',
          diffMoney:''
        })
        setTimeout(()=>{
          const dl = new DrawKLine()
          const cvs = wx.createCanvasContext('kline')
          dl.clearCanvas(cvs, this.data)
        },200)
       
      }else{
        if(n && !this.data.fundItem){
          this.setData({//init
            fundItem: 0
          })
        }
      }
    }
  },
  actionFund: function () {
    if (this.data.hangOn && this.data.eventShow) return 
    showMaskNavigationBarColor()
    this.setData({ [show]: true, maskShow: true })
    this.voiceContext().playClick()

    const userId = this.data.userData.userId
    wxGet('/user/fund/market',{userId},
      (({data})=>{
        if (data.errorCode >= 0) {
          let array = this.data[items]
          array.forEach(o=>{
            o['increase'] = data[o.id] ? data[o.id]:0
          })
          this.setData({
            [items]:array
          })
        }
      })
    )
  },
  closeFund: function () {
    closeMaskNavigationBarColor()
    this.setData({ [show]: false, maskShow: false })
    this.voiceContext().playClick()
  },
  actionFundDetail:function(e){
    if (this.data.hangOn && this.data.eventShow) return 
    const fundItem=e.currentTarget.dataset.item
    this.setData({ [show]: false, maskShow: false, fundItem})
    this.voiceContext().playClick()
    //
    const that = this
    const userId = that.data.userData.userId
    const fundId = fundItem.id
    setTimeout(()=>{
      this.setData({ fundDetailShow: true, maskShow: true })

      if (that.data.canvasHeight && this.data.canvasWidth) {
        that.loadCanvas(userId, fundId)
      } else {
        const query = wx.createSelectorQuery()
        query.select('#cvsWrap').boundingClientRect()
        query.exec(function (res) {
          that.setData({
            canvasHeight: res[0].height,
            canvasWidth: res[0].width
          })
          that.loadCanvas(userId, fundId)
        })
      }  
    },100)
  },
  loadCanvas(userId, fundId){
    const that=this
    const dl = new DrawKLine()
    const cvs = wx.createCanvasContext('kline')
    wxGet('/user/fund/trade', { userId, fundId },
      (({ data }) => {
        if (data.errorCode >= 0) {
          const array = data.market['market']
          dl.drawNewLine(array, cvs, that.data.canvasWidth, that.data.canvasHeight)
          that.setData({
            fundMoney: data.fundMoney,
            diffMoney: data.diffMoney
          })
        }
      })
    )
  },
  closeFundDetail:function(){
    closeMaskNavigationBarColor()
    this.setData({ [show]: false, maskShow: false, fundDetailShow:false })
    this.voiceContext().playClick()
  },
  applyFundBuy: function (e) {
    const that = this
    const isNotNum = isNaN(that.data.buyMoney)
    const money = parseFloat((that.data.userState.money + '').replace(/,/gi, ''))
    const amount = parseFloat(that.data.buyMoney)
    if ((that.data.userState.fundLimit == 1 && that.data.submitFlag) || isNotNum || money < amount) {
      if (money < amount){
        wx.showToast({
          title: '你并没有那么多钱可买入',
          icon: 'none',
          duration: 1500
        })
        console.info('buy 持有不足')
      } else if (isNotNum){
        wx.showToast({
          title: '请输入正确的数字',
          icon: 'none',
          duration: 1500
        })
        console.info('buy 非数字')
      }
      return false
    } else {
      that.voiceContext().playClick()
      that.setData({ submitFlag: true })
      let fundId = e.currentTarget.dataset.id
      const userId = that.data.userData.userId
      if (fundId) {
        wxPost('/user/fund/buy',
          { userId, fundId, money: amount},
          ({ data }) => {
            if (data.errorCode >= 0) {
              //that.getEventStack().push({ category: 'random-fund-buy' })
              that.setData({ submitFlag: false, 'fundDetailShow': false, dialogShow: true, dialogResult: data.resultArray })
              that.voiceContext().playMoney()
            }
          }
        )
      }
    }
  },
  applyFundSell: function (e) {
    const that = this
    const isNotNum = isNaN(that.data.sellMoney)
    const money = parseFloat((e.currentTarget.dataset.money + '').replace(/,/gi, ''))
    const amount = parseFloat(that.data.sellMoney)
    if ((that.data.userState.fundLimit == 1 && that.data.submitFlag) || isNotNum || money < amount) {
      if (money < amount) {
        wx.showToast({
          title: '你并没有那么多钱可赎回',
          icon: 'none',
          duration: 1500
        })
        console.info('sell 持有不足')
      } else if (isNotNum) {
        wx.showToast({
          title: '请输入正确的数字',
          icon: 'none',
          duration: 1500
        })
        console.info('sell 非数字')
      }
      return false
    } else {
      that.voiceContext().playClick()
      that.setData({ submitFlag: true })
      let fundId = e.currentTarget.dataset.id
      const userId = that.data.userData.userId
      if (fundId) {
        wxPost('/user/fund/sell',
          { userId, fundId, money: amount },
          ({ data }) => {
            if (data.errorCode >= 0) {
             // that.getEventStack().push({ category: 'random-fund-sell' })
              that.setData({ submitFlag: false, 'fundDetailShow': false, dialogShow: true, dialogResult: data.resultArray })
              that.voiceContext().playMoney()
            }
          }
        )
      }
    }
  }
}
