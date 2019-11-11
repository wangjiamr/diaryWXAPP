const {
  minish,
  formatNumber,
  addResultArray,
  requirePass,
  useEffect,
  diffEffectMan,
  diffEffectLady,
  dynamicPrice
} = require('../utils/GameUtils.js')
const CommonResponse = require('../utils/CommonResponse.js')
const LuxuryDao = require('../dao/LuxuryDao.js')


const UserManDao = require('../dao/UserManDao.js')
const UserLadyDao = require('../dao/UserLadyDao.js')
const UserLuxuryDao = require('../dao/UserLuxuryDao.js')
const UserLimitDao = require('../dao/UserLimitDao.js')


const luxuryDao = new LuxuryDao()

const userManDao = new UserManDao()
const userLadyDao = new UserLadyDao()
const userLuxuryDao = new UserLuxuryDao()
const userLimitDao = new UserLimitDao()

class UserLuxuryService {

  constructor() { }

  async buyLuxury(ctx, next) {
    const event = ctx._req.event
    let {
      userId,
      luxuryId,
      gender
    } = event
    let data = {}
    let result = CommonResponse(-1, 'fail', data)
    let userObj
    if (gender == 1) {
      userObj = await userManDao.getByUserId(userId)
    } else {
      userObj = await userLadyDao.getByUserId(userId)
    }

    let luxuryGet = new Promise((resolve, reject) => {
      const luxury = luxuryDao.getById(luxuryId)
      resolve(luxury)
    })

    let luxuryEffectGet = new Promise((resolve, reject) => {
      const luxuryEffectList = luxuryDao.getEffectListByLuxuryId(luxuryId)
      resolve(luxuryEffectList)
    })

    let userLuxuryLimitGet = new Promise((resolve, reject) => {
      const luxuryLimit = userLimitDao.getCountByUserIdDayAction(userId, userObj.days, 'LUXURY')
      resolve(luxuryLimit)
    })

    let luxuryGetResult = {},
      luxuryEffectGetResult = [],
      userLuxuryLimitGetResult = {}
    await Promise.all([luxuryGet, luxuryEffectGet, userLuxuryLimitGet]).then((results) => {
      luxuryGetResult = results[0]
      luxuryEffectGetResult = results[1]
      userLuxuryLimitGetResult = results[2]
    }).catch((error) => {
      console.log(error)
    })
    await buyProccess(userId,
      luxuryId,
      gender, luxuryGetResult, luxuryEffectGetResult, userLuxuryLimitGetResult, userObj, data)

    result = CommonResponse(0, 'success', data)
    ctx.body = result
  }

  async sellLuxury(ctx, next) {
    const event = ctx._req.event
    let {
      userId,
      luxuryId,
      gender
    } = event
    let data = {}
    let result = CommonResponse(-1, 'fail', data)
    let userObj
    if (gender == 1) {
      userObj = await userManDao.getByUserId(userId)
    } else {
      userObj = await userLadyDao.getByUserId(userId)
    }

    let luxuryGet = new Promise((resolve, reject) => {
      const luxury = luxuryDao.getById(luxuryId)
      resolve(luxury)
    })

    let userLuxuryGet = new Promise((resolve, reject) => {
      const userLuxuryList = userLuxuryDao.getListByUserIdLuxuryId(userId, luxuryId)
      resolve(userLuxuryList)
    })

    let userLuxuryLimitGet = new Promise((resolve, reject) => {
      const luxuryLimit = userLimitDao.getCountByUserIdDayAction(userId, userObj.days, 'LUXURY')
      resolve(luxuryLimit)
    })

    let luxuryGetResult = {},
      userLuxuryGetResult = {},
      userLuxuryLimitGetResult = {}
    await Promise.all([luxuryGet, userLuxuryGet, userLuxuryLimitGet]).then((results) => {
      luxuryGetResult = results[0]
      userLuxuryGetResult = results[1]
      userLuxuryLimitGetResult = results[2]
    }).catch((error) => {
      console.log(error)
    })
    await sellProccess(userId,
      luxuryId,
      gender, luxuryGetResult, userLuxuryGetResult, userLuxuryLimitGetResult, userObj, data)

    result = CommonResponse(0, 'success', data)
    ctx.body = result
  }
}
async function buyProccess(userId,
  luxuryId,
  gender, luxuryGetResult, luxuryEffectGetResult, userLuxuryLimitGetResult, userObj, data) {
  console.info('aaa' + userLuxuryLimitGetResult)
  if (userLuxuryLimitGetResult == 0) {
    let currentBuyPrice = dynamicPrice(userObj.days, luxuryGetResult.buyPrice, luxuryGetResult.offsetBuy)
    let haveMoney = userObj['money']
    haveMoney = parseInt(haveMoney)
    if (haveMoney >= currentBuyPrice) {
      let luxuryLimitData = {}
      luxuryLimitData._userId = userId
      luxuryLimitData.action = 'LUXURY'
      luxuryLimitData.day = userObj.days

      let userLuxuryData = {}
      userLuxuryData._userId = userId
      userLuxuryData._luxuryId = luxuryId

      let oldUserObj = Object.assign({}, userObj)

      userObj['money'] = haveMoney - currentBuyPrice

      useEffect(luxuryEffectGetResult, userObj)



      if (gender == 1) {
        effectArray = diffEffectMan(oldUserObj, userObj)
        await userManDao.save(userObj, 'update')
      } else {
        effectArray = diffEffectLady(oldUserObj, userObj)
        await userLadyDao.save(userObj, 'update')
      }
      await userLuxuryDao.save(userLuxuryData, 'add')
      await userLimitDao.save(luxuryLimitData, 'add')

      let resultArray = []
      addResultArray(resultArray, '恭喜你,添置了:' + luxuryGetResult.title, false)
      addResultArray(resultArray, '最终:', effectArray)
      data.resultArray = resultArray
    } else {
      let resultArray = []
      addResultArray(resultArray, '有梦想是好的，但是现实也需要真金白银！', false)
      data.resultArray = resultArray
    }
  } else {
    let resultArray = []
    addResultArray(resultArray, '抱歉，每日只能进行一次买卖饰品', false)
    data.resultArray = resultArray
  }
}

async function sellProccess(userId,
  luxuryId,
  gender, luxuryGetResult, userLuxuryGetResult, userLuxuryLimitGetResult, userObj, data) {
  if (userLuxuryLimitGetResult == 0) {
    let currentSellPrice = dynamicPrice(userObj.days, luxuryGetResult.sellPrice, luxuryGetResult.offsetSell)
    let haveMoney = userObj['money']
    haveMoney = parseInt(haveMoney)

    let luxuryLimitData = {}
    luxuryLimitData._userId = userId
    luxuryLimitData.action = 'LUXURY'
    luxuryLimitData.day = userObj.days

    let sellUserLuxuryId = userLuxuryGetResult[0]._id


    let oldUserObj = Object.assign({}, userObj)

    userObj['money'] = haveMoney + currentSellPrice



    if (gender == 1) {
      effectArray = diffEffectMan(oldUserObj, userObj)
      await userManDao.save(userObj, 'update')
    } else {
      effectArray = diffEffectLady(oldUserObj, userObj)
      await userLadyDao.save(userObj, 'update')
    }
    await userLuxuryDao.deleteById(sellUserLuxuryId)
    await userLimitDao.save(luxuryLimitData, 'add')

    let resultArray = []
    addResultArray(resultArray, '已将不想要的' + luxuryGetResult.title +'出售，老娘需要更好的！', false)
    addResultArray(resultArray, '最终:', effectArray)
    data.resultArray = resultArray
  } else {
    let resultArray = []
    addResultArray(resultArray, '抱歉，每日只能进行一次买卖饰品', false)
    data.resultArray = resultArray
  }
}
module.exports = UserLuxuryService