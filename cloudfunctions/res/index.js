// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router');
const CommonService = require('./service/CommonService.js');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const app = new TcbRouter({
    event
  })
  
  const commonService = new CommonService()

  app.use(async (ctx, next) => {
    ctx.data = {}
    ctx.data.OPENID = wxContext.OPENID
    await next()
  })

  
  app.router('data', commonService.getResData)


  // app.router('data', async (ctx, next) => {
  //   try {
  //     let {
  //       userId
  //     } = event
  //     console.info(userId)
  //     const db = cloud.database()

  //     await db.collection('user').doc(userId).get().then(res => {
  //       ctx.data.gender = res.data.gender
  //     })


      
  //     let jobGet = db.collection('res_job').where({
  //       gender: ctx.data.gender
  //     }).orderBy('price', 'asc').get()

  //     let planGet = db.collection('res_plan').where({
  //       gender: ctx.data.gender
  //     }).orderBy('displayOrder', 'asc').get()

  //     await Promise.all([jobGet, planGet]).then((results) => {
  //       const jobGetResult = results[0]
  //       const planGetResult = results[1]
  //       ctx.data.jobArray = jobGetResult.data
  //       ctx.data.planArray = planGetResult.data
  //     }).catch((error) => {
  //       console.log(error)
  //     })


  //     // Promise((resolve, reject) => {
  //     //   db.collection('user').doc(userId).get().then(res => {
  //     //     ctx.data.gender = res.data.gender
  //     //     resolve()
  //     //   })
  //     // }).then(()=>{
  //     //    db.collection('res_job').where({
  //     //     gender: ctx.data.gender
  //     //   }).orderBy('price', 'asc').get().then(res => {
  //     //     ctx.data.jobArray = res.data
  //     //     console.info('jobArray')
  //     //   })
  //     //    db.collection('res_plan').where({
  //     //     gender: ctx.data.gender
  //     //   }).orderBy('displayOrder', 'asc').get().then(res => {
  //     //     ctx.data.planArray = res.data
  //     //     console.info('planArray')
  //     //   })
  //     // })
  //   } catch (e) { }
  //   ctx.body = {
  //     code: 0,
  //     data: ctx.data
  //   }
  // })
  return app.serve()
}