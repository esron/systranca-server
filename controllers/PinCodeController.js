const { isPinCodeValid } = require('../helpers/validations')
const helper = require('../helpers/PinCodeHelpers')

module.exports = {
  async createPinCode (req, res) {
    const { userId, pinCode, pinCodeConfirmation } = req.body
    if ((pinCode === pinCodeConfirmation) && isPinCodeValid(pinCode)) {
      try {
        await helper.createPinCode(userId, pinCode)
        return res.status(200).json({
          success: true,
          message: 'Pin Code created!'
        })
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: 'Error creating Pin Code!'
        })
      }
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid Pin Code! Please, make sure it is valid!'
      })
    }
  }
}
