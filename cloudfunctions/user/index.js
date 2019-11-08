// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async(event, context) => {
  const wxContext = cloud.getWXContext()
  const app = new TcbRouter({
    event
  })
  app.use(async(ctx, next) => {
    ctx.data = {}
    ctx.data.OPENID = wxContext.OPENID
    await next()
  })

  app.router('login', async(ctx, next) => {
    const db = cloud.database()
    ctx.data.userData = false
    ctx.data.days = 0
    ctx.data.hours = 0
    try {
      ctx.data.existUser = true
      console.info(ctx.data.OPENID)
      await db.collection('user').where({
        _openid: ctx.data.OPENID
      }).get().then(res => {
        if (res.data.length == 0) {
          ctx.data.existUser = false
        }
      })
    } catch (e) {}
    await next()
  }, async(ctx, next) => {
    try {
      const db = cloud.database()
      let {
        userInfo
      } = event
      if (!ctx.data.existUser) {
        await db.collection('user').add({
          data: {
            _openid: ctx.data.OPENID,
            nickName: userInfo.nickName,
            avatarUrl: userInfo.avatarUrl,
            gender: userInfo.gender,
            city: userInfo.city,
            province: userInfo.province,
            country: userInfo.country,
            lastComment: 'none',
            lastScore: 0,
            playNumber: 0
          }
        })
      } else {
        await db.collection('user').where({
          _openid: ctx.data.OPENID
        }).update({
          data: {
            nickName: userInfo.nickName,
            avatarUrl: userInfo.avatarUrl,
            gender: userInfo.gender,
            city: userInfo.city,
            province: userInfo.province,
            country: userInfo.country
          }
        })
      }
    } catch (e) {}
    await next()
  }, async(ctx, next) => {
    try {
      const db = cloud.database()
      await db.collection('setting').doc('522c6b47-66e2-41bb-a318-9d7c3e1f1831').get().then(res => {
        ctx.data.days = res.data.intDays
        ctx.data.hours = res.data.intHours
      })
      await db.collection('user').where({
        _openid: ctx.data.OPENID
      }).get().then(res => {
        ctx.data.userData = res.data[0]
      })
    } catch (e) {}
    await next()
  }, async(ctx, next) => {
    ctx.body = {
      code: 0,
      data: ctx.data
    }
  })




  return app.serve()
}