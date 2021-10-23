const validations = require('./validations')

describe('Validations validatePinCode', () => {
  test('returns false if codes are different', () => {
    expect(validations.validatePinCode('144123', '144124')).toBe(false)
  })

  test('returns false if code length is bigger than 6', () => {
    expect(validations.validatePinCode('1234567', '1234567')).toBe(false)
  })

  test('returns false if code is not composed only by numbers', () => {
    expect(validations.validatePinCode('14412a', '14412a')).toBe(false)
  })

  test('returns true when all conditions are met', () => {
    expect(validations.validatePinCode('144124', '144124')).toBe(true)
  })
})
