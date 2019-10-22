const User = require('../models/User')

module.exports = {
  createPinCode (userId, pinCode) {
    return new Promise((resolve, reject) => {
      User.findOneAndUpdate(
        { _id: userId, pinCode: { $exists: false } },
        { $set: { pinCode } },
        { new: true }
      ).then(result => {
        if (result) {
          resolve(result)
        } else {
          reject(new Error('Pin Code has already been set!'))
        }
      })
        .catch(err => {
          reject(err)
        })
    })
  },
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
          reject(new Error('Not found!'))
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
  }
}
