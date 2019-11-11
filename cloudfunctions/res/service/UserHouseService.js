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
const HouseDao = require('../dao/HouseDao.js')


const UserManDao = require('../dao/UserManDao.js')
const UserLadyDao = require('../dao/UserLadyDao.js')
const UserHouseDao = require('../dao/UserHouseDao.js')
const UserLimitDao = require('../dao/UserLimitDao.js')


const houseDao = new HouseDao()

const userManDao = new UserManDao()
const userLadyDao = new UserLadyDao()
const userHouseDao = new UserHouseDao()
const userLimitDao = new UserLimitDao()

class UserHouseService {

  constructor() { }

  async buyHouse(ctx, next) {
    const event = ctx._req.event
    let {
      userId,
      houseId,
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

    let houseGet = new Promise((resolve, reject) => {
      const house = houseDao.getById(houseId)
      resolve(house)
    })

    let houseEffectGet = new Promise((resolve, reject) => {
      const houseEffectList = houseDao.getEffectListByHouseId(houseId)
      resolve(houseEffectList)
    })

    let userHouseLimitGet = new Promise((resolve, reject) => {
      const houseLimit = userLimitDao.getCountByUserIdDayAction(userId, userObj.days, 'HOUSE')
      resolve(houseLimit)
    })

    let houseGetResult = {},
      houseEffectGetResult = [],
      userHouseLimitGetResult = {}
    await Promise.all([houseGet, houseEffectGet, userHouseLimitGet]).then((results) => {
      houseGetResult = results[0]
      houseEffectGetResult = results[1]
      userHouseLimitGetResult = results[2]
    }).catch((error) => {
      console.log(error)
    })
    await buyProccess(userId,
      houseId,
      gender, houseGetResult, houseEffectGetResult, userHouseLimitGetResult, userObj, data)

    result = CommonResponse(0, 'success', data)
    ctx.body = result
  }

  async sellHouse(ctx, next) {
    const event = ctx._req.event
    let {
      userId,
      houseId,
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

    let houseGet = new Promise((resolve, reject) => {
      const house = houseDao.getById(houseId)
      resolve(house)
    })

    let userHouseGet = new Promise((resolve, reject) => {
      const userHouseList = userHouseDao.getListByUserIdHouseId(userId, houseId)
      resolve(userHouseList)
    })

    let userHouseLimitGet = new Promise((resolve, reject) => {
      const houseLimit = userLimitDao.getCountByUserIdDayAction(userId, userObj.days, 'HOUSE')
      resolve(houseLimit)
    })

    let houseGetResult = {},
      userHouseGetResult = {},
      userHouseLimitGetResult = {}
    await Promise.all([houseGet, userHouseGet, userHouseLimitGet]).then((results) => {
      houseGetResult = results[0]
      userHouseGetResult = results[1]
      userHouseLimitGetResult = results[2]
    }).catch((error) => {
      console.log(error)
    })
    await sellProccess(userId,
      houseId,
      gender, houseGetResult, userHouseGetResult, userHouseLimitGetResult, userObj, data)

    result = CommonResponse(0, 'success', data)
    ctx.body = result
  }
}
async function buyProccess(userId,
  houseId,
  gender, houseGetResult, houseEffectGetResult, userHouseLimitGetResult, userObj, data) {
  if (userHouseLimitGetResult == 0) {
    let currentBuyPrice = dynamicPrice(userObj.days, houseGetResult.buyPrice, houseGetResult.offsetBuy)
    let haveMoney = userObj['money']
    haveMoney = parseInt(haveMoney)
    if (haveMoney >= currentBuyPrice) {
      let houseLimitData = {}
      houseLimitData._userId = userId
      houseLimitData.action = 'HOUSE'
      houseLimitData.day = userObj.days

      let userHouseData = {}
      userHouseData._userId = userId
      userHouseData._houseId = houseId

      let oldUserObj = Object.assign({}, userObj)

      userObj['money'] = haveMoney - currentBuyPrice

      useEffect(houseEffectGetResult, userObj)

     

      if (gender == 1) {
        effectArray = diffEffectMan(oldUserObj, userObj)
        await userManDao.save(userObj, 'update')
      } else {
        effectArray = diffEffectLady(oldUserObj, userObj)
        await userLadyDao.save(userObj, 'update')
      }
      await userHouseDao.save(userHouseData, 'add')
      await userLimitDao.save(houseLimitData, 'add')

      let resultArray = []
      addResultArray(resultArray, '恭喜你,眼光独到,入住:' + houseGetResult.title, false)
      addResultArray(resultArray, '最终:', effectArray)
      data.resultArray = resultArray
    } else {
      let resultArray = []
      addResultArray(resultArray, '有梦想是好的，但是现实也需要真金白银！', false)
      data.resultArray = resultArray
    }
  } else {
    let resultArray = []
    addResultArray(resultArray, '抱歉，每日只能进行一次买卖房屋', false)
    data.resultArray = resultArray
  }
}

async function sellProccess(userId,
  houseId,
  gender, houseGetResult, userHouseGetResult, userHouseLimitGetResult, userObj, data) {
  if (userHouseLimitGetResult == 0) {
    let currentSellPrice = dynamicPrice(userObj.days, houseGetResult.sellPrice, houseGetResult.offsetSell)
    let haveMoney = userObj['money']
    haveMoney = parseInt(haveMoney)

    let houseLimitData = {}
    houseLimitData._userId = userId
    houseLimitData.action = 'HOUSE'
    houseLimitData.day = userObj.days

    let sellUserHouseId = userHouseGetResult[0]._id


    let oldUserObj = Object.assign({}, userObj)

    userObj['money'] = haveMoney + currentSellPrice

    if (gender == 1) {
      effectArray = diffEffectMan(oldUserObj, userObj)
      await userManDao.save(userObj, 'update')
    } else {
      effectArray = diffEffectLady(oldUserObj, userObj)
      await userLadyDao.save(userObj, 'update')
    }
    await userHouseDao.deleteById(sellUserHouseId)
    await userLimitDao.save(houseLimitData, 'add')

    let resultArray = []
    addResultArray(resultArray, '成功出售房屋:' + houseGetResult.title, false)
    addResultArray(resultArray, '最终:', effectArray)
    data.resultArray = resultArray
  } else {
    let resultArray = []
    addResultArray(resultArray, '抱歉，每日只能进行一次买卖房屋', false)
    data.resultArray = resultArray
  }
}
module.exports = UserHouseService