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
const ClothesDao = require('../dao/ClothesDao.js')


const UserManDao = require('../dao/UserManDao.js')
const UserLadyDao = require('../dao/UserLadyDao.js')
const UserClothesDao = require('../dao/UserClothesDao.js')
const UserLimitDao = require('../dao/UserLimitDao.js')


const clothesDao = new ClothesDao()

const userManDao = new UserManDao()
const userLadyDao = new UserLadyDao()
const userClothesDao = new UserClothesDao()
const userLimitDao = new UserLimitDao()

class UserClothesService {

  constructor() { }

  async buyClothes(ctx, next) {
    const event = ctx._req.event
    let {
      userId,
      clothesId,
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

    let clothesGet = new Promise((resolve, reject) => {
      const clothes = clothesDao.getById(clothesId)
      resolve(clothes)
    })

    let clothesEffectGet = new Promise((resolve, reject) => {
      const clothesEffectList = clothesDao.getEffectListByClothesId(clothesId)
      resolve(clothesEffectList)
    })

    let userClothesLimitGet = new Promise((resolve, reject) => {
      const clothesLimit = userLimitDao.getCountByUserIdDayAction(userId, userObj.days, 'CLOTHES')
      resolve(clothesLimit)
    })

    let clothesGetResult = {},
      clothesEffectGetResult = [],
      userClothesLimitGetResult = {}
    await Promise.all([clothesGet, clothesEffectGet, userClothesLimitGet]).then((results) => {
      clothesGetResult = results[0]
      clothesEffectGetResult = results[1]
      userClothesLimitGetResult = results[2]
    }).catch((error) => {
      console.log(error)
    })
    await buyProccess(userId,
      clothesId,
      gender, clothesGetResult, clothesEffectGetResult, userClothesLimitGetResult, userObj, data)

    result = CommonResponse(0, 'success', data)
    ctx.body = result
  }

  async sellClothes(ctx, next) {
    const event = ctx._req.event
    let {
      userId,
      clothesId,
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

    let clothesGet = new Promise((resolve, reject) => {
      const clothes = clothesDao.getById(clothesId)
      resolve(clothes)
    })

    let userClothesGet = new Promise((resolve, reject) => {
      const userClothesList = userClothesDao.getListByUserIdClothesId(userId, clothesId)
      resolve(userClothesList)
    })

    let userClothesLimitGet = new Promise((resolve, reject) => {
      const clothesLimit = userLimitDao.getCountByUserIdDayAction(userId, userObj.days, 'CLOTHES')
      resolve(clothesLimit)
    })

    let clothesGetResult = {},
      userClothesGetResult = {},
      userClothesLimitGetResult = {}
    await Promise.all([clothesGet, userClothesGet, userClothesLimitGet]).then((results) => {
      clothesGetResult = results[0]
      userClothesGetResult = results[1]
      userClothesLimitGetResult = results[2]
    }).catch((error) => {
      console.log(error)
    })
    await sellProccess(userId,
      clothesId,
      gender, clothesGetResult, userClothesGetResult, userClothesLimitGetResult, userObj, data)

    result = CommonResponse(0, 'success', data)
    ctx.body = result
  }
}
async function buyProccess(userId,
  clothesId,
  gender, clothesGetResult, clothesEffectGetResult, userClothesLimitGetResult, userObj, data) {
  if (userClothesLimitGetResult == 0) {
    let currentBuyPrice = dynamicPrice(userObj.days, clothesGetResult.buyPrice, clothesGetResult.offsetBuy)
    let haveMoney = userObj['money']
    haveMoney = parseInt(haveMoney)
    if (haveMoney >= currentBuyPrice) {
      let clothesLimitData = {}
      clothesLimitData._userId = userId
      clothesLimitData.action = 'CLOTHES'
      clothesLimitData.day = userObj.days

      let userClothesData = {}
      userClothesData._userId = userId
      userClothesData._clothesId = clothesId

      let oldUserObj = Object.assign({}, userObj)

      userObj['money'] = haveMoney - currentBuyPrice

      useEffect(clothesEffectGetResult, userObj)



      if (gender == 1) {
        effectArray = diffEffectMan(oldUserObj, userObj)
        await userManDao.save(userObj, 'update')
      } else {
        effectArray = diffEffectLady(oldUserObj, userObj)
        await userLadyDao.save(userObj, 'update')
      }
      await userClothesDao.save(userClothesData, 'add')
      await userLimitDao.save(clothesLimitData, 'add')

      let resultArray = []
      addResultArray(resultArray, '恭喜你,阔气！喜提:' + clothesGetResult.title, false)
      addResultArray(resultArray, '最终:', effectArray)
      data.resultArray = resultArray
    } else {
      let resultArray = []
      addResultArray(resultArray, '有梦想是好的，但是现实也需要真金白银！', false)
      data.resultArray = resultArray
    }
  } else {
    let resultArray = []
    addResultArray(resultArray, '抱歉，每日只能进行一次买卖车辆', false)
    data.resultArray = resultArray
  }
}

async function sellProccess(userId,
  clothesId,
  gender, clothesGetResult, userClothesGetResult, userClothesLimitGetResult, userObj, data) {
  if (userClothesLimitGetResult == 0) {
    let currentSellPrice = dynamicPrice(userObj.days, clothesGetResult.sellPrice, clothesGetResult.offsetSell)
    let haveMoney = userObj['money']
    haveMoney = parseInt(haveMoney)

    let clothesLimitData = {}
    clothesLimitData._userId = userId
    clothesLimitData.action = 'CLOTHES'
    clothesLimitData.day = userObj.days

    let sellUserClothesId = userClothesGetResult[0]._id


    let oldUserObj = Object.assign({}, userObj)

    userObj['money'] = haveMoney + currentSellPrice



    if (gender == 1) {
      effectArray = diffEffectMan(oldUserObj, userObj)
      await userManDao.save(userObj, 'update')
    } else {
      effectArray = diffEffectLady(oldUserObj, userObj)
      await userLadyDao.save(userObj, 'update')
    }
    await userClothesDao.deleteById(sellUserClothesId)
    await userLimitDao.save(clothesLimitData, 'add')

    let resultArray = []
    addResultArray(resultArray, '成功出售车辆:' + clothesGetResult.title, false)
    addResultArray(resultArray, '最终:', effectArray)
    data.resultArray = resultArray
  } else {
    let resultArray = []
    addResultArray(resultArray, '抱歉，每日只能进行一次买卖车辆', false)
    data.resultArray = resultArray
  }
}
module.exports = UserClothesService