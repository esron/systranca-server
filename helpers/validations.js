module.exports = {
  validatePinCode (pinCode, confirmation) {
    return pinCode === confirmation &&
    pinCode.length === 6 &&
    /^\d+$/.test(pinCode)
  }
}
