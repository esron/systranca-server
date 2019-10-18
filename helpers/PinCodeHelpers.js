const User = require('../models/User')

module.exports = {
  createPinCode (userId, pincode) {
    return new Promise((resolve, reject) => {
      User.findOneAndUpdate(
        { _id: userId },
        { $set: { pincode } },
        { new: true }
      )
    })
  }
}
