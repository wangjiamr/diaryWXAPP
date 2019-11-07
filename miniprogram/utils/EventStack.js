const key='event_used'
const h_key='event_h'
const { maxEventInDay}=require('../utils/common.js')

class EventStack{
  item = []//队列
  happened=[]//已加载的事件
  length=3
  maxTime = maxEventInDay//单日最大限制
  limit=0//事件计数器
  latestType=''//上次push的类型
  serialTime=0 //连续次数
  

  constructor(){
    this.limit = wx.getStorageSync(key) || 0
    this.happened = wx.getStorageSync(h_key)||''
    this.happened = this.happened.split(',')
  }

  isHappened(eventId){
    if (this.happened.includes(eventId)){
      this.limit--
      wx.setStorage({ key, data: this.limit })
      console.info(' is happened')
      return  true
    }
    this.happened.push(eventId)
    wx.setStorage({
      key: h_key,
      data: this.happened.join(','),
    })
    console.info('EventStack:new event push isHappened')
    return false
  }

  continueOdds=()=>{
    if (this.serialTime) {
      const odds = 100 / Math.pow(2, this.serialTime)
      return odds<40?odds:40
    }
    return 40
  }
  pop = () => {
    
    if (this.maxTime > this.limit && this.item.length > 0) {
      wx.setStorage({ key, data: ++this.limit })
      let o= this.item.pop()
      this.print()
      return o
    } else {
      if (!this.item.length){
        console.info(`EventStack:no more event in stack`)
      } else if (this.maxTime < this.limit){
        console.info(`EventStack:too much event in a day more than max time ${maxEventInDay}!`)
      }
    }
  }
  push = (event) => {
    if (this.item.length>0){//保证事件只有一个,不会空闲时间弹出一系列的偶遇 //TODO 
      return 
    }
    if (this.item.length < this.maxTime) {
      this.item.push(event)
      const { category, restart} = event
      if(restart){
        this.serialTime = 1
      }else{
        this.serialTime++
      }
      // if (category !== this.latestType){
      //   console.info(category,this.latestType,'ddd')
      //   this.latestType = category
      //   this.serialTime=1
      // } else if (category === this.latestType && this.latestType==='random'){
      //   this.serialTime++
      //   console.info(category, this.latestType, 'sss')
      // }
    } else {
      console.info(`EventStack:event size overflow ${this.item.length} !`)
    }
  }
  addMaxCount = () => {
    this.maxTime = this.maxTime+1
    console.info('addMaxCount=' + this.maxTime)
  }
  init=(newGame)=>{
    this.clear(newGame)
    wx.setStorage({ key, data: this.limit=0})
    wx.setStorage({ key: h_key,  data: ''})
  }
  clear = (newGame)=>{
    this.item=[]
    this.maxTime = maxEventInDay
    console.info('clear=' + this.maxTime)
    if (newGame){
      this.happened = []
    }
  }
  print=()=>{
    console.info(this.item.join(','))
  }

}
export  {EventStack}