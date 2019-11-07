// pages/index/temp.js
Page({
  data: {
    canvasWidth: 400,
    canvasHeight: 430,
  },
  onLoad: function (options) {
    const ctx = wx.createCanvasContext('share')
    const center={x:200,y:200}//圆点
    const redius=200//半径
  
    let   props = [
        ['爆发', 70],
        ['防御', 20],
        ['治疗', 50],
      ['控制', 20],
      ['控制', 30],
      ['控制', 60],
      ]
    this.drawNewShare({ attribute:props})
  },
  onShareAppMessage: function () {

  },
  drawNewShare: function ({
    attribute: props = [],
    cvsWidth = 280,
    cvsHeight = 200,
    offset = 20,//图片偏移量
    shape = props.length,
    center = cvsWidth / 2,
    redius = center - 50,
    angle = Math.PI * 2 / shape,
    edgeColor = 'pink',
    textColor = '#fff',
    comment = 'feng',
    avatar = '../../img/feng.png',
    qrCodeImg = '../../img/scjg.png',
    nickName = '张三',
    commentText = ['已使用的高度已使用的高度', '已使用的高度已使用的高度','已使用的高度已使用的高度'],
    score = '190000',
  } = {}) {
    let usedHeight = 10 //已使用的高度
    const padding = 20// 距左宽度
    const rankWidth = 85//评级宽度
    const rankMargin = 25 //距离point宽度
    const pointFontSize = 25
    let { canvasWidth, canvasHeight } = this.data
    const ctx = wx.createCanvasContext('share')



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
    ctx.fillText(nickName, _c + 40, usedHeight + _r + 20)

    //point
    const starX = _c + 22 + rankWidth + rankMargin
    const pointLength = canvasWidth - starX - 40
    ctx.save()
    ctx.beginPath()
    ctx.rect(starX, usedHeight + _r - 15, pointLength, _r + 15)
    ctx.setFontSize(pointFontSize)
    ctx.setFillStyle('#f6de4b')
    ctx.setTextAlign('right')
    ctx.setFontSize(35)
    ctx.fillText(score, starX + pointLength - 5, usedHeight + _r + pointFontSize - 15)
    ctx.restore()
    ctx.setFontSize(14)
    ctx.setFillStyle('#f6de4b')
    ctx.fillText('分', starX + pointLength, usedHeight + _r + 10)
    usedHeight += 50

    //
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
    ctx.font = fontSize + 'px Microsoft Yahei'
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

    //draw qrcode
    ctx.save()
    ctx.beginPath()
    let q_r = 45//二维码圆半径
    let q_d = q_r * 2//二维码尺寸
    let marginLeft = 280
    const q_center = marginLeft + q_r
    const bottom = canvasHeight - 110

    ctx.arc(q_center, bottom + q_r, q_r, 0, 2 * Math.PI);
    ctx.clip()
    ctx.stroke()
    ctx.drawImage(qrCodeImg, marginLeft, bottom, q_d, q_d)
    ctx.restore()

    ctx.setFontSize(16)

    ctx.setFillStyle('#000')
    ctx.fillText('长按图片,扫码来挑战,开始鬼混吧!', padding, bottom + 65)

    //description
    ctx.setTextAlign('left')
    ctx.setFillStyle('#000')
    const maxTextWidth = 400 - 280//desc文本宽度
    let textstart = 150
    for (let x = 0; x < commentText.length; x++) {
      const h = this.drawText(ctx, commentText[x], 260, textstart, 10, maxTextWidth)
      textstart += h
    }
    ctx.draw()
  },

  drawText(ctx, str, x, initHeight, titleHeight, canvasWidth, r) {
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
  }
})