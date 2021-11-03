const pinCodeHelpers = require('./PinCodeHelpers')
const User = require('../models/User')

const pinCode = '123456'
const testUser = {
  _id: '617b4ad51df88902f507643f',
  id: '617b4ad51df88902f507643f',
  name: 'Test user',
  email: 'test@test.com.br',
  status: 'enabled',
  phones: [],
  __v: 0
}

describe('PinCodeHelpers createPinCode', () => {
  test('Throws an error if the pin code was already set', () => {
    const spyUser = jest.spyOn(User, 'findOneAndUpdate').mockResolvedValue(null)

    pinCodeHelpers.createPinCode(testUser._id, pinCode)
      .catch(error => {
        expect(error.message).toBe('Pin Code has already been set!')
        expect(spyUser).toHaveBeenCalledWith(
          { _id: testUser._id, pinCode: { $exists: false } },
          { $set: { pinCode } },
          { new: true }
        )
      })
  })

  test('createPinCode works', () => {
    const spyUser = jest.spyOn(User, 'findOneAndUpdate').mockResolvedValue(testUser)

    pinCodeHelpers.createPinCode(testUser._id, pinCode)
      .then(result => {
        expect(result).toStrictEqual(testUser)
        expect(spyUser).toHaveBeenCalledWith(
          { _id: testUser._id, pinCode: { $exists: false } },
          { $set: { pinCode } },
          { new: true }
        )
      })
  })

  test('Throws an error if findOneAndUpdate returns an error', () => {
    const spyUser = jest.spyOn(User, 'findOneAndUpdate').mockRejectedValue('')

    pinCodeHelpers.createPinCode(testUser._id, pinCode)
      .catch(error => {
        expect(error).toBe('')
        expect(spyUser).toHaveBeenCalledWith(
          { _id: testUser._id, pinCode: { $exists: false } },
          { $set: { pinCode } },
          { new: true }
        )
      })
  })
})

describe('PinCodeHelpers updatePinCode', () => {
  test('Throws an error if the user is not found', () => {
    const spyUser = jest.spyOn(User, 'findOneAndUpdate').mockResolvedValue(null)

    pinCodeHelpers.updatePinCode(testUser._id, pinCode)
      .catch(error => {
        expect(error.message).toBe('Not found!')
        expect(spyUser).toHaveBeenCalledWith(
          { _id: testUser._id },
          { $set: { pinCode } },
          { new: true }
        )
      })
  })

  test('updatePinCode works', () => {
    const spyUser = jest.spyOn(User, 'findOneAndUpdate').mockResolvedValue(testUser)

    pinCodeHelpers.updatePinCode(testUser._id, pinCode)
      .then(result => {
        expect(result).toStrictEqual(testUser)
        expect(spyUser).toHaveBeenCalledWith(
          { _id: testUser._id },
          { $set: { pinCode } },
          { new: true }
        )
      })
  })

  test('Throws an error if findOneAndUpdate returns an error', () => {
    const spyUser = jest.spyOn(User, 'findOneAndUpdate').mockRejectedValue('')

    pinCodeHelpers.updatePinCode(testUser._id, pinCode)
      .catch(error => {
        expect(error).toBe('')
        expect(spyUser).toHaveBeenCalledWith(
          { _id: testUser._id },
          { $set: { pinCode } },
          { new: true }
        )
      })
  })
})

describe('PinCodeHelpers authenticatePinCode', () => {
  test('Throws an error if the user is not found', () => {
    const spyUser = jest.spyOn(User, 'findOne').mockResolvedValue(null)

    pinCodeHelpers.authenticatePinCode(testUser._id, pinCode)
      .catch(error => {
        expect(error.message).toBe('Pin Code authentication error!')
        expect(spyUser).toHaveBeenCalledWith({ _id: testUser._id, pinCode })
      })
  })

  test('authenticatePinCode works', () => {
    const spyUser = jest.spyOn(User, 'findOne').mockResolvedValue(testUser)

    pinCodeHelpers.authenticatePinCode(testUser._id, pinCode)
      .then(result => {
        expect(result).toStrictEqual(true)
        expect(spyUser).toHaveBeenCalledWith({ _id: testUser._id, pinCode })
      })
  })

  test('Throws an error if findOne returns an error', () => {
    const spyUser = jest.spyOn(User, 'findOne').mockRejectedValue('')

    pinCodeHelpers.authenticatePinCode(testUser._id, pinCode)
      .catch(error => {
        expect(error).toBe('')
        expect(spyUser).toHaveBeenCalledWith({ _id: testUser._id, pinCode })
      })
  })
})
