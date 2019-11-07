
class DrawKLine {
  constructor() {

  }
  /**
   * Math.abs(topKeep-minRange) 差值越小k线波动越大.二者相加=cvs高度,k线表现为直线
   * @param array 文本内容
   * @param cvsW cvs width
   * @param cvsH cvs heigh
   * @param bottom 底部保留高度(空白高度)
   * @param topKeep 顶部保留高度
   * @param minRange 峰谷最小高度
   */
  drawKLine(array,ctx, cvsW, cvsH,{ bottom = 0, topKeep = 5, minRange=10,size=array.length-1}={}) {
        let maxValue, minValue
    array.forEach(o => {
      const v = o
      maxValue = maxValue < v || !maxValue ? v : maxValue
      minValue = v < minValue || !minValue ? v : minValue
    })
    const itemH = (cvsH - bottom - topKeep - minRange) / (maxValue - minValue)
    const lowestY = itemH * (maxValue - minValue) + topKeep
    const itemW = cvsW / 20

    if(topKeep+minRange>cvsH)
      throw new Error('Please keep a blank area.topKeep+minRange should less than cvsHeigh')

   
    const temp=[]
    ctx.beginPath()
    ctx.setStrokeStyle("#66a1d9") 
    ctx.setLineJoin("round")
    
    array.forEach((o, i) => {
      let x = (itemW * i)
      let y = lowestY - (o - minValue) * itemH
      if (x === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
      temp.push([x, y])
    })
    ctx.stroke()

    //shadow
    ctx.beginPath()
    ctx.fillStyle = "rgba(0, 150, 223, 0.1)"
    temp.forEach((o,i)=>{
      const [x,y]=o
      if(i===0){
        ctx.moveTo(0, cvsH - bottom)
        ctx.lineTo(x, y)
      }else{
        ctx.lineTo(x, y)
        if(i===temp.length-1){
          ctx.lineTo(x, cvsH - bottom)
          ctx.closePath()
          ctx.fill()
        }
      }
    })
    ctx.draw()
  }


  clearCanvas(ctx, {canvasWidth,canvasHeight}){
    ctx.clearRect(0, 0, canvasWidth, canvasHeight)
    ctx.draw()
  }

  /**
   * @param sizeW 网格个数 x轴
   * @param sizeH 网格个数 y轴
   * @param bottom 底部保留高度
   * @param topKeep 顶部保留高度
   * @param baseNum x轴线代表的数值
   * @param arrowPadding 距离网格距离
   * @param arrowRange 坐标箭头张开范围
   */
  drawNewLine(array, ctx, cvsW, cvsH, { sizeW = 20,sizeH=10, 
    bottom = 10, topKeep = 20, baseNum = 0,
    arrowPadding = 4,arrowRange=10}={}){
    ctx.clearRect(0, 0, cvsW, cvsH)
    const itemW = cvsW / (sizeW+2)
    const itemH=(cvsH-bottom-topKeep)/10
    const startY = topKeep
    const baseLineY = parseInt(sizeH / 2) * itemH + topKeep
    //max
    let max
    array.forEach((i)=>{
      let d = Math.abs(baseNum - i)
      max=!max?d:max<d?d:max
    })
    //1.25 *2 
    const pointH = (cvsH - bottom - topKeep)/(max*1.25*2)

    //draw table
    ctx.strokeStyle = "rgba(215,209,197,.3)"
    for (let i = 2; i <= sizeW + 2; i++) {
      ctx.beginPath()
      ctx.moveTo(itemW * (i - 1), startY)
      ctx.lineTo(itemW * (i - 1), cvsH - bottom)
      ctx.stroke()
    }
    for (let i = 1; i <= sizeH + 1; i++) {
      ctx.beginPath()
      ctx.moveTo(itemW, (i - 1) * itemH + topKeep)
      ctx.lineTo((sizeW + 1) * itemW, (i - 1) * itemH + topKeep)
      ctx.stroke()
    }
    ////draw arrow x
    const mid = sizeH / 2 
    ctx.beginPath() 
    ctx.setLineWidth(1.8)
    ctx.setStrokeStyle("#170f0d")
    ctx.moveTo(itemW/2, mid * itemH + topKeep)
    ctx.lineTo((sizeW + 1) * itemW, mid * itemH + topKeep)
    ctx.stroke()

    //draw arrow y
    ctx.beginPath()
    ctx.moveTo(itemW, topKeep - 5)
    ctx.lineTo(itemW, (sizeH) * itemH + topKeep)
    ctx.stroke()


    //arrow head x
    ctx.setFillStyle("#170f0d")
    const arrowHeardY = topKeep - arrowPadding
    ctx.beginPath() 
    ctx.moveTo(itemW - arrowRange / 2, arrowHeardY)
    ctx.lineTo(itemW, topKeep - itemW*0.75)
    ctx.lineTo(itemW + arrowRange / 2, arrowHeardY) 
    ctx.lineTo(itemW, topKeep-itemW*0.5)
    ctx.lineTo(itemW - arrowRange / 2, arrowHeardY) 
    ctx.fill()
    //arrow head y
    ctx.beginPath() 
    const arrowHeardX = itemW * (sizeW + 1) + arrowPadding
    ctx.moveTo(arrowHeardX, baseLineY -arrowRange/2)
    ctx.lineTo(itemW * (sizeW + 1) + itemW*0.75, baseLineY)
    ctx.lineTo(arrowHeardX, baseLineY + arrowRange / 2)
    ctx.lineTo(itemW * (sizeW + 1) + itemW * 0.5, baseLineY)
    ctx.lineTo(arrowHeardX, baseLineY - arrowRange / 2)
    ctx.fill()

   

    //kline
    ctx.beginPath()
    ctx.setStrokeStyle("#c87f79")
    ctx.setLineWidth(2.2)
    ctx.setLineJoin("round")
    array.forEach((o,i)=>{
      let x = itemW * (i + 1)
      let y = baseLineY - pointH * (o - baseNum)
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
      ctx.stroke()
    })
    setTimeout(()=>{
      ctx.draw()
    },500)
  
  }
}

export  { DrawKLine}