const host = 'https://6465-dev-ckehx-1257883881.tcb.qcloud.la'
const bgm = `${host}/background.mp3`
const result = `${host}/result.mp3?sign=3f56e807982376b455f43f09b06c3923&t=1573315796`
const nextDay = `${host}/nextDay.wav?sign=94db19b07ed75ee5f21fc535289f356b&t=1573315765`
const click = `${host}/click.wav?sign=d7668e6b1c131f9f9861714df4c5e950&t=1573315781`
const money = `${host}/money.mp3?sign=12842ec9bc06a6ae6a111da6d52398d7&t=1573315834`
const win = `${host}/win.mp3?sign=d935000c03ac667c0baaf4148315260c&t=1573315845`
const fail = `${host}/fail.mp3?sign=0efebe6ad36d8381319175d981b9a389&t=1573315856`
const event = `${host}/event.mp3?sign=0330b0d6f3e084efa9003551768b343a&t=1573315706`
const over = `${host}/over.mp3?sign=00fa8a4dcc1cd9f227ef515094536cfb&t=1573315820`
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