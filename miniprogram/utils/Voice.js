const host = 'https://img.jinrongzhushou.com/audio'
const bgm = `${host}/background.mp3`
const result = `${host}/result.mp3`
const nextDay = `${host}/nextDay.wav`
const click = `${host}/click.wav`
const money = `${host}/money.mp3`
const win = `${host}/win.mp3`
const fail = `${host}/fail.mp3`
const event = `${host}/event.mp3`
const over = `${host}/over.mp3`
class Voice {
  constructor() {
    this.context = wx.createInnerAudioContext()
    //this.context.volume=0.3
   // this.context.obeyMuteSwitch=false
  }
  destroy=()=>{
    this.context.destroy()
  }
  playOver = () => {
    this.context.src = over
    this.context.play()
  }
  playEvent = () => {
    this.context.src = event
    this.context.play()
  }
  playNextDay = () => {
    this.context.src = nextDay
    this.context.play()
  }
  playClick = () => {
    console.info(click)
    this.context.src = click
    this.context.play()
  }
  playMoney = () => {
    this.context.src = money
    this.context.play()
  }
  playWin = () => {
    this.context.src = win
    this.context.play()
  }
  playFail = () => {
    this.context.src = fail
    this.context.play()
  }
  playResult = () => {
    this.context.src = result
    this.context.play()
  }
}
export {
  Voice
}