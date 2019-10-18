const { validatePinCode } = require('../helpers/validations')
const helper = require('../helpers/PinCodeHelpers')

module.exports = {
  async createPinCode (req, res) {
    const { userId } = req.params
    const { pinCode, pinCodeConfirmation } = req.body
    if (validatePinCode(pinCode, pinCodeConfirmation)) {
      try {
        await helper.createPinCode(userId, pinCode)
        return res.status(200).json({
          success: true,
          message: 'Pin Code created!'
        })
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: error.message
        })
      }
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid Pin Code! Please, make sure it is valid!'
      })
    }
  },
  async updatePinCode (req, res) {
    const { userId } = req.params
    const { pinCode, newPinCode, newPinCodeConfirmation } = req.body
    if (validatePinCode(newPinCode, newPinCodeConfirmation)) {
      try {
        await helper.authenticatePinCode(userId, pinCode)
        await helper.updatePinCode(userId, newPinCode)
        return res.status(200).json({
          success: true,
          message: 'Pin Code updated!'
        })
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: error.message
        })
      }
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid Pin Code! Please, make sure it is valid!'
      })
    }
  },
  async deletePinCode (req, res) {
    const { userId } = req.params
    const { pinCode } = req.body
      try {
        await helper.authenticatePinCode(userId, pinCode)
        await helper.updatePinCode(userId, pinCode)
        return res.status(200).json({
          success: true,
          message: 'Pin Code deleted!'
        })
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: error.message
        })
      }
  }
}
