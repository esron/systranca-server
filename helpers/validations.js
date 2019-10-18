module.exports = {
  validatePinCode (pincode) {
    return pincode.length === 6 && /^\d+$/.test(pincode)
  }
}
