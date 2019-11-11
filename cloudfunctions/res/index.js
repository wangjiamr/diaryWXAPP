// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router')
const CommonService = require('./service/CommonService.js')
const UserJobService = require('./service/UserJobService.js')
const UserPlanService = require('./service/UserPlanService.js')
const UserCarService = require('./service/UserCarService.js')
const UserHouseService = require('./service/UserHouseService.js')
const UserClothesService = require('./service/UserClothesService.js')
const UserLuxuryService = require('./service/UserLuxuryService.js')
const UserLuckService = require('./service/UserLuckService.js')
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

  const userJobService = new UserJobService()

  const userPlanService = new UserPlanService()

  const userCarService = new UserCarService()

  const userHouseService = new UserHouseService()

  const userClothesService = new UserClothesService()

  const userLuxuryService = new UserLuxuryService()

  const userLuckService = new UserLuckService()

  app.use(async (ctx, next) => {
    ctx.data = {}
    ctx.data.OPENID = wxContext.OPENID
    await next()
  })

  
  app.router('data', commonService.getResData)

  app.router('start', commonService.start)

  app.router('init', commonService.init)

  app.router('applyJob', userJobService.applyJob)

  app.router('applyPlan', userPlanService.applyPlan)


  app.router('buyCar', userCarService.buyCar)
  app.router('sellCar', userCarService.sellCar)

  app.router('buyHouse', userHouseService.buyHouse)
  app.router('sellHouse', userHouseService.sellHouse)

  app.router('buyClothes', userClothesService.buyClothes)
  app.router('sellClothes', userClothesService.sellClothes)


  app.router('buyLuxury', userLuxuryService.buyLuxury)
  app.router('sellLuxury', userLuxuryService.sellLuxury)

  app.router('applyLuck', userLuckService.applyLuck)


  app.router('refresh', commonService.refresh)
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