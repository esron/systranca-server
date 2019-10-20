const User = require('../models/User')

module.exports = {
  updatePinCode (userId, pinCode) {
    return new Promise((resolve, reject) => {
      User.findOneAndUpdate(
        { _id: userId },
        { $set: { pinCode } },
        { new: true }
      ).then(result => {
        if (result) {
          resolve(result)
        } else {
          reject(new Error('Database Error!'))
        }
      })
        .catch(err => {
          reject(err)
        })
    })
  },
  authenticatePinCode (userId, pinCode) {
    return new Promise((resolve, reject) => {
      User.findOne({ _id: userId, pinCode })
        .then(res => {
          if (res) {
            resolve(true)
          } else {
            reject(new Error('Pin Code authentication error!'))
          }
        }).catch((err) => {
          reject(err)
        })
    })
  },
}
