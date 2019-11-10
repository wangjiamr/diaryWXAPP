exports.gameDays = ()=>{ return 7}
exports.initDays = () => { return 6 }
exports.initHours = () => { return 6 }

exports.attrList = (gender, isManage) => {
  var attrArray = []
  if (gender == 1) {
    attrArray.push({
      text: '健康',
      value: isManage == 0 ? "HEALTH" : "HEALTH".toLowerCase()
    })
    attrArray.push({
      text: '现金',
      value: isManage == 0 ? "MONEY" : "MONEY".toLowerCase()
    })
    if (isManage != 0) {
      attrArray.push({
        text: '理财收益',
        value: isManage == 0 ? "FUND" : "FUND".toLowerCase()
      })
    }
    attrArray.push({
      text: '工作能力',
      value: isManage == 0 ? "ABILITY" : "ABILITY".toLowerCase()
    })
    attrArray.push({
      text: '社会经验',
      value: isManage == 0 ? "EXPERIENCE" : "EXPERIENCE".toLowerCase()
    })
    attrArray.push({
      text: '快乐',
      value: isManage == 0 ? "HAPPY" : "HAPPY".toLowerCase()
    })
    attrArray.push({
      text: '正义',
      value: isManage == 0 ? "POSITIVE" : "POSITIVE".toLowerCase()
    })
    attrArray.push({
      text: '人脉',
      value: isManage == 0 ? "CONNECTIONS" : "CONNECTIONS".toLowerCase()
    })
  } else if (gender == 2) {
    attrArray.push({
      text: '健康',
      value: isManage == 0 ? "HEALTH" : "HEALTH".toLowerCase()
    })
    attrArray.push({
      text: '现金',
      value: isManage == 0 ? "MONEY" : "MONEY".toLowerCase()
    })
    if (isManage != 0) {
      attrArray.push({
        text: '理财收益',
        value: isManage == 0 ? "FUND" : "FUND".toLowerCase()
      })
    }
    attrArray.push({
      text: '工作能力',
      value: isManage == 0 ? "ABILITY" : "ABILITY".toLowerCase()
    })
    attrArray.push({
      text: '处世智慧',
      value: isManage == 0 ? "WISDOM" : "WISDOM".toLowerCase()
    })
    attrArray.push({
      text: '快乐',
      value: isManage == 0 ? "HAPPY" : "HAPPY".toLowerCase()
    })
    attrArray.push({
      text: '美貌',
      value: isManage == 0 ? "BEAUTY" : "BEAUTY".toLowerCase()
    })
    attrArray.push({
      text: '知名度',
      value: isManage == 0 ? "POPULARITY" : "POPULARITY".toLowerCase()
    })
  }
  return attrArray
}

exports.minish = (obj) => {
  if (obj) {
    delete obj["created"]
    delete obj["createdBy"]
    delete obj["updated"]
    delete obj["updatedBy"]
    delete obj["useYn"]
    return obj
  }
  return false
}



exports.formatNumber = (num, cent, isThousand) => {
  num = num.toString().replace(/\$|\,/g, '');

  // 检查传入数值为数值类型  
  if (isNaN(num))
    num = "0";

  // 获取符号(正/负数)  
  sign = (num == (num = Math.abs(num)));

  num = Math.floor(num * Math.pow(10, cent) + 0.50000000001); // 把指定的小数位先转换成整数.多余的小数位四舍五入  
  cents = num % Math.pow(10, cent); // 求出小数位数值  
  num = Math.floor(num / Math.pow(10, cent)).toString(); // 求出整数位数值  
  cents = cents.toString(); // 把小数位转换成字符串,以便求小数位长度  

  // 补足小数位到指定的位数  
  while (cents.length < cent)
    cents = "0" + cents;

  if (isThousand) {
    // 对整数部分进行千分位格式化.  
    for (var i = 0; i < Math.floor((num.length - (1 + i)) / 3); i++)
      num = num.substring(0, num.length - (4 * i + 3)) + ',' + num.substring(num.length - (4 * i + 3));
  }

  if (cent > 0)
    return (((sign) ? '' : '-') + num + '.' + cents);
  else
    return (((sign) ? '' : '-') + num);
}

exports.man = (userMan, jobLimit, luckLimit, houseLimit, carLimit, coupleLimit, fundLimit) => {
  if (userMan) {
    userMan['jobLimit'] = jobLimit
    userMan['luckLimit'] = luckLimit
    userMan['houseLimit'] = houseLimit
    userMan['carLimit'] = carLimit
    userMan['coupleLimit'] = coupleLimit
    userMan['fundLimit'] = fundLimit

    exports.minish(userMan)
    userMan['health'] = exports.formatNumber(userMan['health'],0,true)
    userMan['money'] = exports.formatNumber(userMan['money'], 0, true)
    userMan['ability'] = exports.formatNumber(userMan['ability'], 0, true)
    userMan['experience'] = exports.formatNumber(userMan['experience'], 0, true)
    userMan['happy'] = exports.formatNumber(userMan['happy'], 0, true)
    userMan['positive'] = exports.formatNumber(userMan['positive'], 0, true)
    userMan['connections'] = exports.formatNumber(userMan['connections'], 0, true)
  }
}

exports.currentDay = (day) => {
  return exports.gameDays() - day
}