const cloud = require('wx-server-sdk')

class SettingDao {

  async getSetting() {
    const db = cloud.database()
    let data = {}

    await db.collection('setting').doc('522c6b47-66e2-41bb-a318-9d7c3e1f1831').get().then(res => {
      data = res.data
    })
    return data
  }
}
module.exports = SettingDao