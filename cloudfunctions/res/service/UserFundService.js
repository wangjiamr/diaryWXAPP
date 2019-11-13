const {
  minish,
  gameDays,
  formatNumber,
  addResultArray,
  useEffect,
  diffEffectMan,
  diffEffectLady,
  toDecimal, fundMarket
} = require('../utils/GameUtils.js')
const CommonResponse = require('../utils/CommonResponse.js')
const FundDao = require('../dao/FundDao.js')


const UserManDao = require('../dao/UserManDao.js')
const UserLadyDao = require('../dao/UserLadyDao.js')
const UserFundDao = require('../dao/UserFundDao.js')
const UserLimitDao = require('../dao/UserLimitDao.js')


const fundDao = new FundDao()

const userManDao = new UserManDao()
const userLadyDao = new UserLadyDao()
const userFundDao = new UserFundDao()
const userLimitDao = new UserLimitDao()

class UserFundService {

  constructor() { }


  async market(ctx, next) {
    const event = ctx._req.event
    let {
      userId,
      gender
    } = event
    let data = {}
    let result = CommonResponse(-1, 'fail', data)
    let userObj
   

    let userObjGet = new Promise((resolve, reject) => {
      let userObj
      if (gender == 1) {
        userObj =  userManDao.getByUserId(userId)
      } else {
        userObj =  userLadyDao.getByUserId(userId)
      }
      resolve(userObj)
    })

    let fundListGet = new Promise((resolve, reject) => {
      const fundList = fundDao.getList()
      resolve(fundList)
    })

    let userObjResult = {},
      fundListResult = []
    await Promise.all([userObjGet, fundListGet]).then((results) => {
      userObjResult = results[0]
      fundListResult = results[1]
    }).catch((error) => {
      console.log(error)
    })
    await marketProccess(userId,
      gender, fundListResult, userObjResult, data)

    result = CommonResponse(0, 'success', data)
    ctx.body = result
  }
  async trade(ctx, next) {
    const event = ctx._req.event
    let {
      userId,
      gender,
      fundId
    } = event
    let data = {}
    let result = CommonResponse(-1, 'fail', data)
    let userObj


    let fundGet = new Promise((resolve, reject) => {
      const fund = fundDao.getById(fundId)
      resolve(fund)
    })

    let userObjGet = new Promise((resolve, reject) => {
      let userObj
      if (gender == 1) {
        userObj = userManDao.getByUserId(userId)
      } else {
        userObj = userLadyDao.getByUserId(userId)
      }
      resolve(userObj)
    })

    let userFundMarketGet = new Promise((resolve, reject) => {
      const userFundMarket = userFundDao.getMarketByUserFundId(userId,fundId)
      resolve(userFundMarket)
    })

    let userObjResult = {},
      fundResult = {}, userFundMarketResult = {}
    await Promise.all([userObjGet, fundGet, userFundMarketGet]).then((results) => {
      userObjResult = results[0]
      fundResult = results[1]
      userFundMarketResult = results[2]
    }).catch((error) => {
      console.log(error)
    })
    await tradeProccess(userId,
      gender, fundResult, userFundMarketResult,userObjResult, data)

    result = CommonResponse(0, 'success', data)
    ctx.body = result
  }
  
}
async function marketProccess(userId,
  gender, fundListResult, userObj, data) {

  let saveAppUserFundMarketList=[]
  let updateAppUserFundMarketList=[]
  if (fundListResult && fundListResult.length>0){
    for (let resFund of fundListResult) {
      let userFundMarket = await userFundDao.getMarketByUserFundId(userId, resFund._id)
      let doubleList=[]
      doubleList.push(resFund.probability)
      doubleList.push(toDecimal(1 - resFund.probability))

      let marketArray=[]
      let userFundMarketData={}
      userFundMarketData._userId=userId
      userFundMarketData._fundId = resFund._id

      let d = gameDays() - userObj.days
      let sum=7+d
      for (let i = 1; i <= sum; i++) {
        marketArray.push(fundMarket(doubleList, resFund.minNum, resFund.maxNum))
      }
      userFundMarketData.market = JSON.stringify(marketArray)

      let persistent='update'
      if (!userFundMarket){
        persistent='add'
      }else{
        userFundMarketData._id = userFundMarket._id
      }
      await userFundDao.saveMarket(userFundMarketData, persistent)
      data[resFund._id] = marketArray[marketArray.length-1]
    }
  }
}
async function tradeProccess(userId,
  gender, fundResult, userFundMarketGet,userObj, data) {

  let doubleList = []
  doubleList.push(fundResult.probability)
  doubleList.push(toDecimal(1 - fundResult.probability))

  let market = userFundMarketGet.market
  if(market){
    let marketArray = JSON.parse(market)
    let d = gameDays() - userObj.days
    let sum = 7 + d
    if (marketArray.length<sum){
      let diff = sum - marketArray.length
      for (let i = 1; i <= diff; i++) {
        marketArray.push(fundMarket(doubleList, fundResult.minNum, fundResult.maxNum))
      }
      let userFundMarketData={}
      userFundMarketData._id = userFundMarketGet._id
      userFundMarketData.market = JSON.stringify(marketArray)
      await userFundDao.saveMarket(userFundMarketData, 'update')
      market = JSON.stringify(marketArray)
    }
    data.market = market

    let userFund = await userFundDao.getByUserFundId(userId, fundResult._id)
    console.info(userFund)
    let fundMoney=0,buyAll=0
    if (userFund){
      fundMoney = userFund.money
      buyAll = userFund.buy
    }
    let diffMoney = fundMoney - buyAll
    data.diffMoney = diffMoney
    data.fundMoney = fundMoney
  }
}
module.exports = UserFundService