// pages/index/report.js
const app = getApp()
const { setWatcher } = require("../../utils/watcher.js");
import { DrawKLine } from '../../utils/DrawKLine.js'
const { wxGet, wxPost } = require('../../utils/common.js')
const descriptHeight = 500
const abilityHeight = 380
const color1 = '#8fc673'
const color2 = '#f6de4b'
const color3 = '#ed7c7c'
const color4 = '#eb9bf2'
const color5 ='#ee7206'
const qiong = '#959595'
const lu = '#37b44a'
const feng = '#ff9900'
const jing = '#ee7206'
const hun = '#eb9bf2'
Page({
  data: {
    canvasWidth: 400,
    canvasHeight: 300,
    screenHeight: null,
    screenWidth:null,
    userInfo: {},
    canvasSaveimg: '',
    Img:null,
    score:'',
    text:[],
    prop:'',
    shareImgShow: false,
    shareImgSrc: '',
    hideButton:false,
    dataDone:false,
    share:false,
    prepareData:null,
    tempPath:null
  },
  onLoad: function (options) {
    wx.showLoading({
      title: '请稍等...',
    })
    let screenHeight, screenWidth
    const totalHeight = abilityHeight + descriptHeight
    wx.getSystemInfo({
      success: function (res) {
        screenHeight = res.windowHeight,
        screenWidth = res.windowWidth
      }
    })
    console.info(screenWidth/2)
    this.setData({ screenHeight, screenWidth })
   
    const userId=wx.getStorageSync('userId')
    const viewId=options.userId
    const share = !!options.share
    
    if (viewId && viewId!==userId){
      this.setData({ hideButton: true, share})
      wxGet('/user/info', { userId: viewId},({data})=>{
        if(data.errorCode===0){
          this.setData({ userInfo: data.userData })
          const { gender, avatarUrl, nickName, lastComment } = data.userData
          this.getImageInfo(avatarUrl, nickName, viewId, lastComment, gender, viewId)
        }
      })
    }else if(userId){//report 
      wxPost('/user/done',{userId},({data})=>{
        if (data.errorCode === 0) {
          this.setData({ userInfo: data.userData })
          const { gender, avatarUrl, nickName } = data.userData
          this.getImageInfo(avatarUrl, nickName, userId, data.comment, gender, viewId)
        }
      })
    }else{
      wx.hideLoading()
      wx.showToast({
        title: '未找到相关用户ID,请重启小程序',
      })
    }
  },
  watch: {
    'userInfo': {
      handler(value) {
       // this.getImageInfo(value.avatarUrl, value.nickName)
      }
    }
  },
  getImageInfo(url, nickName, userId, commentUrl, gender, viewId) {//  图片缓存本地的方法
    console.info('url=' + url)
    console.info('nickName=' + nickName)

    console.info('userId=' + userId)

    console.info('commentUrl=' + commentUrl)

    commentUrl = `../../img/${commentUrl}.png`
    const that = this
    if (url) {
      that.setData({ commentImg: commentUrl })

      const avatar = new Promise((resolve, reject) => {
        wx.getImageInfo({
          src: url,
          success: res => {
            resolve(res)
            console.info('avatar done')

          },
          fail: error => {
            reject('avatar qrcode fail')
          }
        })
      })
      
      const report = new Promise((resolve, reject) => {
        let reportUrl =''
        if (viewId){
          reportUrl = `/user/report/${userId}`
        }else{
          reportUrl = `/user/myReport/${userId}`
        }
        
        wxGet(reportUrl, null, ({ data }) => {
          if (data.errorCode==0) {
            for (var i = 0; i < data.attrList.length; i++) {
              let v = data.data[data.attrList[i]['value']]
              if ((data.attrList[i]['value'].indexOf('asset') != -1 || data.attrList[i]['value'].indexOf('Asset')!=-1)){

                console.info(data.attrList[i]['value'] + 'indexOf=' + data.attrList[i]['value'].indexOf('asset'))
                if (v < 1000000) {
                  data.data[data.attrList[i]['value'] + 'Color'] = '1'
                }else if (v < 2000000) {
                  data.data[data.attrList[i]['value'] + 'Color'] = '2'
                } else if (v >= 2000000) {
                  data.data[data.attrList[i]['value'] + 'Color'] = '4'
                }
              }
            }
            that.setData({
              score: data.data.score,
              text: data.data.commentText,
              prop: data.data
            })
            console.info('reportUrl done')
          }
          resolve(data)
        }, (error) => {
          reject('report get fail')
        })
      })
     
      Promise.all([avatar, report]).then((result) => {
        console.info('Promise done')
        const avatarResult = result[0]
        const reportResult = result[1]
        wx.hideLoading()
        that.setData({
          dataDone: true
        })
        if (avatarResult.errMsg === 'getImageInfo:ok' && reportResult.errorCode >= 0) {
          that.setData({
            prepareData: Object.assign({
              avatar: avatarResult.path,
              nickName,
              comment: commentUrl,
              gender
            }, reportResult.data)
          })
         that.drawAttribute(reportResult.data)
          //that.drawNewShare(reportResult.data)
        }
      }).catch((error) => {
        console.info(error)
      })
    }
  },
  drawAttribute({
    attribute: props = [],
    cvsWidth = 280,
    shape = props.length,
    center = cvsWidth / 2,
    redius = center - 50,
    angle = Math.PI * 2 / shape,
    edgeColor = '#fff',
    textColor = '#f6de4b'
    
  } = {}) {
    const offset = 0, usedHeight = -40

    const ctx = wx.createCanvasContext('attribute')
    ctx.save()
    ctx.strokeStyle = edgeColor
    var r = redius / shape
    for (var i = 0; i < shape; i++) {
      ctx.beginPath()   //开始路径
      var currR = r * (i + 1);
      for (var j = 0; j < shape; j++) {
        var x = center + currR * Math.cos(angle * j)
        var y = center + currR * Math.sin(angle * j)
        ctx.lineTo(x - offset, y + usedHeight)
        //console.info(Math.abs(x), center)
      }
      ctx.closePath()  //闭合路径
      ctx.stroke()  // restore to the default state
    }
    ctx.restore()

    //draw line
    ctx.save()
    ctx.beginPath()
    ctx.strokeStyle = edgeColor
    for (var i = 0; i < shape; i++) {
      var x = center + redius * Math.cos(angle * i)
      var y = center + redius * Math.sin(angle * i)
      ctx.moveTo(center - offset, center + usedHeight)
      ctx.lineTo(x - offset, y + usedHeight)
    }
    ctx.stroke()
    ctx.restore()

    //draw region

    ctx.save()
    ctx.beginPath()
    for (var i = 0; i < shape; i++) {
      var x = center + redius * Math.cos(angle * i) * props[i][1] / 100;
      var y = center + redius * Math.sin(angle * i) * props[i][1] / 100;
      ctx.lineTo(x - offset, y + usedHeight)
    }
    ctx.closePath()
    ctx.fillStyle = 'rgba(255,0,0,0.2)'
    ctx.fill()
    ctx.restore()

    //draw text
    ctx.save()
    var fontSize = center / 10
    console.info(fontSize)
    ctx.font = fontSize + 'rpx Microsoft Yahei'
    ctx.fillStyle = textColor;
    for (var i = 0; i < shape; i++) {
      var x = center + redius * Math.cos(angle * i) - offset
      var y = center + redius * Math.sin(angle * i) + usedHeight
      //通过不同的位置，调整文本的显示位置
      if (angle * i >= 0 && angle * i <= Math.PI / 2) {
        ctx.fillText(props[i][0], x, y + fontSize)
      } else if (angle * i > Math.PI / 2 && angle * i <= Math.PI) {
        ctx.fillText(props[i][0], x - ctx.measureText(props[i][0]).width, y + fontSize)
      } else if (angle * i > Math.PI && angle * i <= Math.PI * 3 / 2) {
        ctx.fillText(props[i][0], x - ctx.measureText(props[i][0]).width, y)
      } else {
        ctx.fillText(props[i][0], x, y)
      }
    }
    ctx.restore()
    ctx.draw()
    const that=this
    setTimeout(() => {
      wx.canvasToTempFilePath({
        canvasId: 'attribute',
        //fileType: 'png',
        success: function (res) {
          that.setData({
            tempPath: res.tempFilePath
          })
        }
      })
    }, 500)
  },
  draw({
    avatar = '../../img/scjg.png',
    qrCodeImg = '',
    comment = '../../img/feng.png',
    point = '23178208',
    nickName = '张三',
    bgImg='',
    sloganImg=''
  } = {}, {
    coupleTitle = '左手',
    happy = '',
    health = '',
    positive = '',
    experience = '',
    houseTitle = [],
    score = '',
    money = '',
    carTitle = [],
    fundMoney = '',
    ability = '',
    jobTitle = '',
    connections = '',
    commentText = [],
    happyColor = '',
    healthColor = '',
    positiveColor = '',
    experienceColor = '',
    moneyColor='',
    abilityColor='',
    connectionsColor='',
    wisdom = '', 
    beauty='',
    popularity = '', 
    wisdomColor = '',
    beautyColor = '',
    popularityColor = '',
    clothesTitle=[],
    luxuryTitle=[]} = {},gender) {
      try{
    let { canvasWidth } = this.data
    const ctx = wx.createCanvasContext('share')
    let usedHeight = 15 //已使用的高度
    const padding = 20// 距左宽度
    const titleWidth = canvasWidth - padding * 2//标题宽度
    const rankWidth = 85//评级宽度
    const rankMargin = 25 //距离point宽度
    const pointFontSize = 25
    const maxTextWidth = titleWidth - 40//desc文本宽度
    let descHeight=50//预留高度,其中margintop=10,剩余为底
    for (let x = 0; x < commentText.length; x++) {
      const h = this.drawText(ctx, commentText[x], 0, 0, 10, maxTextWidth,true)
      descHeight += h
    }
    this.setData({
      canvasHeight: abilityHeight + descHeight + 120 //属性+描述+二维码
    })
    let { canvasHeight } = this.data
    //draw bg
    ctx.drawImage('../../img/body-bg.jpg', 0, 0, canvasWidth, canvasHeight += 15)
    //draw title
    ctx.drawImage('../../img/slogan.png', padding, usedHeight, titleWidth, usedHeight += 100)
    //draw avatar & rank
    usedHeight += 30//头像圆形上方,圆点需要+半径
    ctx.save()
    ctx.beginPath()
    let _r = 32//头像圆半径
    let _d = _r * 2//头像尺寸
    const center = padding + _r
    ctx.arc(center, usedHeight + _r, _r, 0, 2 * Math.PI);
    ctx.clip()
    ctx.setStrokeStyle('#fff')
    ctx.stroke()
    ctx.drawImage(avatar, padding, usedHeight, _d, _d)
    ctx.restore()
    ctx.drawImage(comment, center + 22, usedHeight + _r - 30, rankWidth, 36)
    ctx.setFillStyle('#f6de4b')
    ctx.setFontSize(14)
    ctx.fillText(nickName, center + 40, usedHeight + _r + 20)

    //point
    const starX = center + 22 + rankWidth + rankMargin
    const pointLength = canvasWidth - starX - 40
    ctx.save()
    ctx.beginPath()
    ctx.rect(starX, usedHeight + _r - 15, pointLength, _r + 15)
    ctx.setFontSize(pointFontSize)
    ctx.setFillStyle('#FFFFFF')
    ctx.setTextAlign('right')
    ctx.setFontSize(35)
    ctx.fillText(score, starX + pointLength - 5, usedHeight + _r + pointFontSize - 15)
    ctx.restore()
    ctx.setFontSize(14)
    ctx.setFillStyle('#FFFFFF')
    ctx.fillText('分', starX + pointLength, usedHeight + _r + 10)


    //draw prop
    usedHeight += 20 + _r * 2//头像直径+padding
    const itemPd = 10// 属性间距
    const itemH = 20 //属性高度
    const itemR = 10 //圆角半径
    const tripleW = (canvasWidth - padding * 2 - itemPd * 2) / 3
    const doubleW = (canvasWidth - padding * 2 - itemPd) / 2

    //line 1
    this.roundRect(ctx, padding, usedHeight, doubleW, itemH, itemR, '金 钱', money, moneyColor)
    this.roundRect(ctx, padding + doubleW + itemPd, usedHeight, doubleW, itemH, itemR, '投资财富', fundMoney, moneyColor)

    //line 2
    usedHeight += itemH + 10
    this.roundRect(ctx, padding, usedHeight, tripleW, itemH, itemR, '快 乐', happy, happyColor)
    this.roundRect(ctx, padding + tripleW + itemPd, usedHeight, tripleW, itemH, itemR, '健康', health,healthColor)
    if(gender===1){
      this.roundRect(ctx, padding + tripleW * 2 + itemPd * 2, usedHeight, tripleW, itemH, itemR, '人 脉', connections, connectionsColor)
    }else{
      this.roundRect(ctx, padding + tripleW * 2 + itemPd * 2, usedHeight, tripleW, itemH, itemR, '知名度', popularity, popularityColor)
    }

    //line 3  
    usedHeight += itemH + 10
    if (gender === 1) {
      this.roundRect(ctx, padding, usedHeight, tripleW, itemH, itemR, '社会经验', experience, experienceColor)
      this.roundRect(ctx, padding + tripleW + itemPd, usedHeight, tripleW, itemH, itemR, '正 义', positive, positiveColor)
    } else {
      this.roundRect(ctx, padding, usedHeight, tripleW, itemH, itemR, '智 慧', wisdom, wisdomColor)
      this.roundRect(ctx, padding + tripleW + itemPd, usedHeight, tripleW, itemH, itemR, '美 貌', beauty, beautyColor)
    }
    this.roundRect(ctx, padding + tripleW * 2 + itemPd * 2, usedHeight, tripleW, itemH, itemR, '能力才干', ability,abilityColor)

    //line 4
    usedHeight += itemH + 10
    if (gender === 1) {
      this.roundRect(ctx, padding, usedHeight, doubleW, itemH, itemR, '座 驾', carTitle ? carTitle[0] : '', 2)
      this.roundRect(ctx, padding + doubleW + itemPd, usedHeight, doubleW, itemH, itemR, '房 产', houseTitle ? houseTitle[0] : '', 2)
    } else {
      this.roundRect(ctx, padding, usedHeight, doubleW, itemH, itemR, '衣 品', clothesTitle ? clothesTitle[0] : '', 2)
      this.roundRect(ctx, padding + doubleW + itemPd, usedHeight, doubleW, itemH, itemR, '妆 容', luxuryTitle ? luxuryTitle[0] : '', 2)
    }
   

    //line 5
    usedHeight += itemH + 10
    this.roundRect(ctx, padding, usedHeight, doubleW, itemH, itemR, '伴 侣', coupleTitle,2)
    this.roundRect(ctx, padding + doubleW + itemPd, usedHeight, doubleW, itemH, itemR, '工 作', jobTitle,2)

    //description
    usedHeight += itemH + 10

    const descTop = 18, descBottom = 18

    console.info(padding, usedHeight, titleWidth, descTop)
    ctx.drawImage('../../img/desc-top.png', padding, usedHeight, titleWidth, descTop)
    ctx.drawImage('../../img/desc-mid.png', padding, usedHeight + descTop, titleWidth, descHeight - descTop * 2)
    ctx.drawImage('../../img/desc-bottom.png', padding, usedHeight + descHeight - descTop, titleWidth, descBottom)

    usedHeight += 50

    ctx.setTextAlign('left')
    ctx.setFillStyle('#000')
    for (let x = 0; x < commentText.length; x++) {
      const h = this.drawText(ctx, commentText[x], padding + 20, usedHeight, 10, maxTextWidth)
      usedHeight += h
    }

    //draw qrcode
    ctx.save()
    ctx.beginPath()
    let q_r = 45//二维码圆半径
    let q_d = q_r * 2//二维码尺寸
    const q_center = padding + q_r
    const bottom = canvasHeight - 120

    ctx.arc(q_center, bottom + q_r, q_r, 0, 2 * Math.PI);
    ctx.clip()
    ctx.stroke()
    ctx.drawImage(qrCodeImg, padding, bottom, q_d, q_d)
    ctx.restore()

    ctx.setFontSize(16)

    ctx.setFillStyle('#FFFFFF')
    ctx.fillText('长按图片,扫码来挑战', padding + q_d + 15, bottom + 45)
    ctx.fillText('马上开始鬼混吧!', padding + q_d + 15, bottom + 70)

    ctx.draw()
    // wx.hideLoading()
    // this.setData({
    //   dataDone: true
    // })
    } catch (ex) {
      console.info(ex)
    }
  },
  drawText(ctx, str, x, initHeight, titleHeight, canvasWidth,r) {
    var lineWidth = 0
    var lastSubStrIndex = 0; //每次开始截取的字符串的索引
    ctx.setFontSize(12)
    for (let i = 0; i < str.length; i++) {
      lineWidth += ctx.measureText(str[i]).width
      if (lineWidth > canvasWidth) {
        if (!r) {
          ctx.fillText(str.substring(lastSubStrIndex, i), x, initHeight)//
        }
        initHeight += 20//字体的高度
        lineWidth = 0
        lastSubStrIndex = i
        titleHeight += 30;
      }
      if (i == str.length - 1) {//绘制剩余部分
        if (!r) {
          ctx.fillText(str.substring(lastSubStrIndex, i + 1), x, initHeight)
        }
        if (lastSubStrIndex === 0) {
          titleHeight += 10 // titleHeight -initHeight(字体高度)
        }
      }
    }
    titleHeight = titleHeight + 4
    return titleHeight
  },
  roundRect(ctx, x, y, w, h, r, prop, point,colorIndex) {
    ctx.save()
    ctx.beginPath()
    ctx.setFillStyle('rgba(0, 0, 0, 0.4)')
    ctx.arc(x + r, y + r, r, Math.PI, Math.PI * 1.5)
    // border-top
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.lineTo(x + w, y + r)
    // 右上角
    ctx.arc(x + w - r, y + r, r, Math.PI * 1.5, Math.PI * 2)
    // border-right
    ctx.lineTo(x + w, y + h - r)
    ctx.lineTo(x + w - r, y + h)
    // 右下角
    ctx.arc(x + w - r, y + h - r, r, 0, Math.PI * 0.5)
    // border-bottom
    ctx.lineTo(x + r, y + h)
    ctx.lineTo(x, y + h - r)
    // 左下角
    ctx.arc(x + r, y + h - r, r, Math.PI * 0.5, Math.PI)
    // border-left
    ctx.lineTo(x, y + r)
    ctx.lineTo(x + r, y)
    // 这里是使用 fill 还是 stroke都可以，二选一即可，但是需要与上面对应
    ctx.fill()
    // ctx.stroke()
    ctx.closePath()
    // 剪切
    ctx.clip()
    ctx.restore()
    ctx.setFillStyle('#fff')
    ctx.setFontSize(12)
    ctx.setTextAlign('left')
    ctx.fillText(prop, x + 10, y + 14)
    let fontColor='#fff'
    if (colorIndex==1){
      fontColor=color1
    }else if (colorIndex == 2) {
      fontColor = color2
    } else if (colorIndex == 3) {
      fontColor = color3
    } else if (colorIndex == 4) {
      fontColor = color4
    } else if (colorIndex == 5) {
      fontColor = color5
    }
    ctx.setFillStyle(fontColor)
    ctx.setTextAlign('right')
    ctx.fillText(point, x + w - (r - 5), y + 14)

  },
  onShareAppMessage(opt) {
    const userId = wx.getStorageSync('userId')
    const that = this
    let title = '全民混北京，三分靠努力，七分靠打拼，剩下九十分靠天意！'
    let imgSrc = ''
    if (app.globalData.shareObj) {
      title = app.globalData.shareObj.title
      imgSrc = app.globalData.shareObj.imgSrc
    }
    return {
      title: title,
      imageUrl: imgSrc,
      path: `/pages/index/index?from=shareReport&userId=${userId}`,
      success: (res) => {
        console.log("转发成功", res);
      },
      fail: (res) => {
        console.log("转发失败", res);
      }
    }
  },
  saveAsImg: function () {
    const that = this
    if (this.data.prepareData) {
      const param1 = this.data.prepareData
      const userId = wx.getStorageSync('userId')
      wx.showLoading({
        title: '生成长图中...',
      })
      wx.getImageInfo({
        src: `https://game.jinrongzhushou.com/v1/user/QRCode/${userId}`,
        success: (res) => {
          param1.qrCodeImg = res.path
          that.drawNewShare(param1)
         // that.draw(param1, param2, gender)
          setTimeout(()=>{//cvs.draw() 方法有延迟 
            that._save()
          },1000)
        },
        fail: err => {
          wx.hideLoading()
          wx.showToast({
            title: '二维码获取失败'
          })
          setTimeout(() => {
            wx.hideToast()
          }, 2000)
        }
      })
    } else {
      wx.showToast({
        title: '数据不完整'
      })
      setTimeout(() => {
        wx.hideToast()
      }, 2000)
    }
  },
  _save:function(){
    const that=this
    wx.canvasToTempFilePath({
      canvasId: 'share',
      fileType: 'jpg',
      success: function (res) {
        const path = res.tempFilePath
        wx.saveImageToPhotosAlbum({
          filePath: path,
          success(res) {
            wx.hideLoading()
            // that.previewImage(path)
            that.setData({
              shareImgShow: true,
              shareImgSrc: path
            })
          },
          fail() {
            wx.hideLoading()
          }
        })
      }
    })
  },
  backHome: function () {
    wx.navigateBack({
      delta: 1
    })
  },
  closeShow:function(){
    this.setData({
      shareImgShow: false,
      shareImgSrc: ''
    })
  },
  challenge:function(){
    this.backHome()
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
   
  },
  rankingList:function(){
    wx.redirectTo({
      url: './rankingList'
    })
  },
  drawNewShare: function ({
    gender=1,
    attribute: props = [],
    cvsWidth = 220,
    offset = -180,//图片偏移量
    shape = props.length,
    center = cvsWidth / 2,
    redius = center - 50,
    angle = Math.PI * 2 / shape,
    edgeColor = '#fff',
    textColor = '#f6de4b',
    comment = 'feng',
    avatar = '../../img/feng.png',
    qrCodeImg = '../../img/scjg.png',
    nickName = '张三',
    commentText = [],
    score = '190000',
    asset='',
    assetColor = '',
    money = '',
    moneyColor='',
    fundMoney = '',
    houseAsset='',
    houseAssetColor = '',
    carAsset='',
    carAssetColor = '',
    clothesAsset='',
    clothesAssetColor = '',
    luxuryAsset='',
    luxuryAssetColor = '',
    myCarArray=[],
    myLuxuryArray=[],
    myClothesArray = [],
    myHouseArray = [],
    assetGtRate='',
    assetGtRateComment='',
    commentArray=[],
    jobTitleLevel='',
    jobTitle='',
    coupleTitleLevel='',
    coupleTitle = ''
  } = {}) {
    let usedHeight = 10 //已使用的高度
    const padding = 20// 距左宽度
    const rankWidth = 85//评级宽度
    const rankMargin = 25 //距离point宽度
    const pointFontSize = 25
    let { canvasWidth } = this.data
    const maxTextWidth = canvasWidth - 50//desc文本宽度
    const ctx = wx.createCanvasContext('share')
    const offsetTop = -15

    let _h = this.measureDescription(ctx, gender, true, {
      myCarArray, padding, usedHeight, maxTextWidth,
      myHouseArray, myClothesArray, myLuxuryArray, jobTitleLevel, jobTitle, coupleTitleLevel, coupleTitle, commentArray, assetGtRate, assetGtRateComment
    })+20
    this.setData({
      canvasHeight: 295 + _h + 90 //属性+描述+二维码
    })

    let { canvasHeight } = this.data
    
    //bgimg
    ctx.drawImage('../../img/body-bg.jpg', 0, 0, canvasWidth, canvasHeight += 15)
    usedHeight += 30//头像圆形上方,圆点需要+半径
    ctx.save()
    ctx.beginPath()
    let _r = 32//头像圆半径
    let _d = _r * 2//头像尺寸
    const _c = padding + _r
    ctx.arc(_c, usedHeight + _r, _r, 0, 2 * Math.PI);
    ctx.clip()
    ctx.setStrokeStyle('#fff')
    ctx.stroke()
    ctx.drawImage(avatar, padding, usedHeight, _d, _d)
    ctx.restore()
    ctx.drawImage(`../../img/${comment}.png`, _c + 22, usedHeight + _r - 30, rankWidth, 36)
    ctx.setFillStyle('#FFFFFF')
    ctx.setFontSize(14)
    ctx.fillText(nickName , _c + 40, usedHeight + _r + 20)
    const genderImg = `../../img/icon-${gender === 1 ? 'men' :'gilr'}.png`
    const _ident = ctx.measureText(nickName ).width
    ctx.drawImage(genderImg, _c + 45 + _ident, usedHeight + _r+7, 14, 14)

    //point
    const starX = _c + 22 + rankWidth + rankMargin
    const pointLength = canvasWidth - starX - 40
    ctx.save()
    ctx.beginPath()
    ctx.rect(starX, usedHeight + _r - 15, pointLength, _r + 15)
    ctx.setFontSize(pointFontSize)
    ctx.setFillStyle('#FFFFFF')
    ctx.setTextAlign('right')
    ctx.setFontSize(35)
    ctx.fillText(score, starX + pointLength - 5, usedHeight + _r + pointFontSize - 15)
    ctx.restore()
    ctx.setFontSize(14)
    ctx.setFillStyle('#FFFFFF')
    ctx.fillText('分', starX + pointLength, usedHeight + _r + 10)
    usedHeight += 50

    //
    ctx.save()
    ctx.strokeStyle = edgeColor
    const _offsetTop = usedHeight + offsetTop
    var r = redius / shape
    for (var i = 0; i < shape; i++) {
      ctx.beginPath()   //开始路径
      var currR = r * (i + 1);
      for (var j = 0; j < shape; j++) {
        var x = center + currR * Math.cos(angle * j)
        var y = center + currR * Math.sin(angle * j)
        ctx.lineTo(x - offset, y + _offsetTop)
      }
      ctx.closePath()  //闭合路径
      ctx.stroke()  // restore to the default state
    }
    ctx.restore()

    //draw line
    ctx.save()
    ctx.beginPath()
    ctx.strokeStyle = edgeColor
    for (var i = 0; i < shape; i++) {
      var x = center + redius * Math.cos(angle * i)
      var y = center + redius * Math.sin(angle * i)
      ctx.moveTo(center - offset, center + _offsetTop)
      ctx.lineTo(x - offset, y + _offsetTop)
    }
    ctx.stroke()
    ctx.restore()

    //draw region

    ctx.save()
    ctx.beginPath()
    for (var i = 0; i < shape; i++) {
      var x = center + redius * Math.cos(angle * i) * props[i][1] / 100;
      var y = center + redius * Math.sin(angle * i) * props[i][1] / 100;
      ctx.lineTo(x - offset, y + _offsetTop)
    }
    ctx.closePath()
    ctx.fillStyle = 'rgba(255,0,0,0.2)'
    ctx.fill()
    ctx.restore()

    //draw text
    ctx.save()
    var fontSize = center / 10
    ctx.font = fontSize + 'px Microsoft Yahei'
    ctx.fillStyle = textColor;
    for (var i = 0; i < shape; i++) {
      var x = center + redius * Math.cos(angle * i) - offset
      var y = center + redius * Math.sin(angle * i) + _offsetTop
      //通过不同的位置，调整文本的显示位置
      if (angle * i >= 0 && angle * i <= Math.PI / 2) {
        ctx.fillText(props[i][0], x, y + fontSize)
      } else if (angle * i > Math.PI / 2 && angle * i <= Math.PI) {
        ctx.fillText(props[i][0], x - ctx.measureText(props[i][0]).width, y + fontSize)
      } else if (angle * i > Math.PI && angle * i <= Math.PI * 3 / 2) {
        ctx.fillText(props[i][0], x - ctx.measureText(props[i][0]).width, y)
      } else {
        ctx.fillText(props[i][0], x, y)
      }
    }
    ctx.restore()

    //draw prop
    usedHeight += _r //头像直径+padding
    const itemPd = 10// 属性间距
    const itemH = 20 //属性高度
    const itemR = 10 //圆角半径
    const doubleW = (canvasWidth - padding * 2 - itemPd) / 2

    //line 1
    this.roundRect(ctx, padding, usedHeight, doubleW, itemH, itemR, '资产总额', asset, assetColor)
    //line 2
    usedHeight += itemH + 10
    this.roundRect(ctx, padding, usedHeight, doubleW, itemH, itemR, '可用现金', money, 2)
    //line 3
    usedHeight += itemH + 10
    this.roundRect(ctx, padding, usedHeight, doubleW, itemH, itemR, '金融资产', fundMoney, 2)
    //line 4
    usedHeight += itemH + 10
    if (gender===1) {
      this.roundRect(ctx, padding, usedHeight, doubleW, itemH, itemR, '房屋估值', houseAsset, houseAssetColor)
    } else {
      this.roundRect(ctx, padding, usedHeight, doubleW, itemH, itemR, '衣品估值', clothesAsset, clothesAssetColor)
    }

    //line 5
    usedHeight += itemH + 10
    if (gender===1) {
      this.roundRect(ctx, padding, usedHeight, doubleW, itemH, itemR, '车辆估值', carAsset, carAssetColor)
    } else {
      this.roundRect(ctx, padding, usedHeight, doubleW, itemH, itemR, '妆容估值', luxuryAsset, luxuryAssetColor)
    }
    usedHeight += itemH + 30
    
    //draw description
    usedHeight += this.measureDescription(ctx, gender, false, {
      myCarArray, padding, usedHeight, maxTextWidth,
      myHouseArray, myClothesArray, myLuxuryArray, jobTitleLevel, jobTitle, coupleTitleLevel, coupleTitle, commentArray, 
      assetGtRate, assetGtRateComment
    })

    //draw qrcode
    ctx.save()
    ctx.beginPath()
    let q_r = 45//二维码圆半径
    let q_d = q_r * 2//二维码尺寸
    const q_center = padding + q_r
    const bottom = canvasHeight - 120

    ctx.arc(q_center, bottom + q_r, q_r, 0, 2 * Math.PI);
    ctx.clip()
    ctx.stroke()
    ctx.drawImage(qrCodeImg, padding, bottom, q_d, q_d)
    ctx.restore()

    ctx.setFontSize(16)
    
    ctx.setFillStyle('#FFFFFF')
    let qrCodeTitle ='长按图片,体验你的北漂生活'
    if (app.globalData.shareObj) {
      qrCodeTitle = app.globalData.shareObj.qrCodeTitle
    }
    ctx.fillText(qrCodeTitle, padding + q_d + 15, bottom + 45)
    //ctx.fillText('你在北京能!', padding + q_d + 15, bottom + 70)

    ctx.draw()
  },
  drawTextNew(ctx, str, x, y, titleHeight, canvasWidth, r,indent,fontSize,fontColor) {
    var lineWidth = 0
    var lastSubStrIndex = 0; //每次开始截取的字符串的索引
    indent = indent?indent:0
    fontSize=fontSize?fontSize:14
    if (!fontColor){
      fontColor ='#FFFFFF'
    }
    ctx.setFontSize(fontSize)
    ctx.setFillStyle(fontColor)
    let newLine=false
    let lineW = canvasWidth
    for (let i = 0; i < str.length; i++) {
      lineWidth += ctx.measureText(str[i]).width

      if (!newLine){
        lineW = canvasWidth-indent
      }else{
        lineW = canvasWidth
      }
      if (lineWidth > lineW) {
        if (!r) {
          if(!newLine){
            ctx.fillText(str.substring(lastSubStrIndex, i), x + indent, y)//
          }else{
            ctx.fillText(str.substring(lastSubStrIndex, i), x, y)//
          }
        }
        y += 30//字体的高度
        lineWidth = 0
        lastSubStrIndex = i
        titleHeight += 30
        newLine=true
      }
      if (i == str.length - 1) {//绘制剩余部分
        if (!r) {
          if (!newLine) {
            ctx.fillText(str.substring(lastSubStrIndex), x + indent, y)//
          } else {
            ctx.fillText(str.substring(lastSubStrIndex), x, y)//
          }
        }
        if (lastSubStrIndex === 0) {
          titleHeight += titleHeight-fontSize // titleHeight -y(字体高度)
        }
      }
    }
    titleHeight = titleHeight + 20//行间距
    return { titleHeight, lineWidth}
  },
  measureDescription: function (ctx, gender, r, { myCarArray, padding, usedHeight, maxTextWidth,
    myHouseArray, myClothesArray, myLuxuryArray, jobTitleLevel, jobTitle, coupleTitleLevel, coupleTitle, commentArray, assetGtRate,assetGtRateComment}){
    ctx.setTextAlign('left')
    let temp = usedHeight
    const { lineWidth } = this.drawTextNew(ctx, '你资产超越了 ', padding, usedHeight, 10, maxTextWidth, r)
    const { lineWidth: indent } = this.drawTextNew(ctx, assetGtRate + '% 的人，', padding, usedHeight, 10, maxTextWidth, r, lineWidth, 20, color2)
    const { titleHeight } = this.drawTextNew(ctx, assetGtRateComment, padding, usedHeight, 10, maxTextWidth, r, lineWidth + indent)
    usedHeight += titleHeight
    usedHeight += 10
    
    if (gender === 1) {
      if (myCarArray.length > 0) {
        const { lineWidth } = this.drawTextNew(ctx, '有车一族，名下' + myCarArray.length +'辆爱车：', padding, usedHeight, 10, maxTextWidth, r)
        let str = ''
        for (let x = 0; x < myCarArray.length; x++) {
          let item = myCarArray[x]
          str += item.title + '*' + item.number + (x < myCarArray.length - 1 ? '、' : '')
        }
        const { titleHeight } = this.drawTextNew(ctx, str, padding, usedHeight, 10, maxTextWidth, r, lineWidth, 20, color3)
        usedHeight += titleHeight
        if (myCarArray.length == 1) {
          usedHeight += 10
        }
      }
      if (myHouseArray.length > 0) {
        const { lineWidth } = this.drawTextNew(ctx, '北京' + myHouseArray.length +'本房产证：', padding, usedHeight, 10, maxTextWidth, r)
        let str = ''
        for (let x = 0; x < myHouseArray.length; x++) {
          let item = myHouseArray[x]
          str += item.title + '*' + item.number + (x < myHouseArray.length - 1 ? '、' : '')
        }
        const { titleHeight } = this.drawTextNew(ctx, str, padding, usedHeight, 10, maxTextWidth, r, lineWidth, 20, color2)
        usedHeight += titleHeight
        if (myHouseArray.length==1){
          usedHeight += 10
        }
      }
    } else {
      if (myClothesArray.length > 0) {
        const { lineWidth } = this.drawTextNew(ctx, '爱买衣服，衣柜里' + myClothesArray.length+'件衣服：', padding, usedHeight, 10, maxTextWidth,r)
        let str = ''
        for (let x = 0; x < myClothesArray.length; x++) {
          let item = myClothesArray[x]
          str += item.title + '*' + item.number + (x < myClothesArray.length - 1 ? '、' : '')
        }
        const { titleHeight } = this.drawTextNew(ctx, str, padding, usedHeight, 10, maxTextWidth, r, lineWidth, 20)
        usedHeight += titleHeight
        if (myClothesArray.length == 1) {
          usedHeight += 10
        }
      }
      if (myLuxuryArray.length > 0) {
        const { lineWidth } = this.drawTextNew(ctx, '讲究排场，'+myLuxuryArray.length+'件装备，出门必备：', padding, usedHeight, 10, maxTextWidth,r)
        let str = ''
        for (let x = 0; x < myLuxuryArray.length; x++) {
          let item = myLuxuryArray[x]
          str += item.title + '*' + item.number + (x < myLuxuryArray.length - 1 ? '、' : '')
        }
        const { titleHeight } = this.drawTextNew(ctx, str, padding, usedHeight, 10, maxTextWidth, r, lineWidth, 20)
        usedHeight += titleHeight
        if (myLuxuryArray.length == 1) {
          usedHeight += 10
        }
      }
    }
    
    if (jobTitleLevel > 5) {
      const { lineWidth } = this.drawTextNew(ctx, '让人羡慕的工作：', padding, usedHeight, 10, maxTextWidth,r)
      const { titleHeight } = this.drawTextNew(ctx, jobTitle, padding, usedHeight, 10, maxTextWidth, r, lineWidth, 20, color1)
      usedHeight += titleHeight
    }
    if (coupleTitleLevel == 100) {
      const { lineWidth } = this.drawTextNew(ctx, '拥有一段爱情，你对象是', padding, usedHeight, 10, maxTextWidth,r)
      const { titleHeight } = this.drawTextNew(ctx, coupleTitle + '，北漂的你不再孤独', padding, usedHeight, 10, maxTextWidth, r, lineWidth, 20, color5)
      usedHeight += titleHeight
    } else if (coupleTitleLevel == 0) {
      const { lineWidth } = this.drawTextNew(ctx, '你感情路很顺，', padding, usedHeight, 10, maxTextWidth, r)
      const { titleHeight } = this.drawTextNew(ctx, '顺到一路上看不到一个人', padding, usedHeight, 10, maxTextWidth, r, lineWidth, 20, color1)
      usedHeight += titleHeight
    }
    if (commentArray.length > 0) {
      const { lineWidth } = this.drawTextNew(ctx, commentArray[0] + '，', padding, usedHeight, 10, maxTextWidth, r)
      let str = commentArray.slice(1).join('，')
      str = str.substring(0, str.length - 1)
      const { titleHeight } = this.drawTextNew(ctx, str, padding, usedHeight, 10, maxTextWidth, r, lineWidth, 20, color4)
      usedHeight += titleHeight
    }
   return usedHeight - temp
  },
  previewImage: function (downloadUrl) {
    console.info(downloadUrl)
    wx.previewImage({
      current: downloadUrl, // 当前显示图片的http链接
      urls: [downloadUrl]
    })
  }
})