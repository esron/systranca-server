const request = require('supertest')
const jwt = require('jsonwebtoken')
const app = require('../app')
const { secret } = require('../config/constants')
const User = require('../models/User')
const pinCodeHelpers = require('../helpers/PinCodeHelpers')

const user = { id: 1 }
const token = jwt.sign(user, secret)
const testUser = {
  _id: '617b4ad51df88902f507643f',
  name: 'Test user',
  email: 'test@test.com.br',
  status: 'enabled',
  phones: [],
  __v: 0
}

describe('POST /users', () => {
  test('default validations works', () => {
    const spy = jest.spyOn(User, 'find').mockResolvedValue([])
    return request(app)
      .post('/users')
      .set('Accept', 'application/json')
      .set('x-access-token', token)
      .then(response => {
        expect(response.statusCode).toBe(422)
        expect(response.body).toStrictEqual({
          errors: [
            {
              location: 'body',
              msg: 'Name field is required',
              param: 'name'
            },
            {
              location: 'body',
              msg: 'Name field cannot be empty',
              param: 'name'
            },
            {
              location: 'body',
              msg: 'Email field is required',
              param: 'email'
            },
            { location: 'body', msg: 'Invalid Email', param: 'email' }
          ]
        })
        expect(spy).toHaveBeenCalledWith({ email: undefined })
      })
  })

  test('repeated email validation works', () => {
    const testUser = {
      id: 1,
      email: 'test@test.com'
    }

    const spy = jest.spyOn(User, 'find').mockResolvedValue([testUser])

    return request(app)
      .post('/users')
      .set('Accept', 'application/json')
      .set('x-access-token', token)
      .send({
        name: 'Test user',
        email: testUser.email
      })
      .then(response => {
        expect(response.statusCode).toBe(422)
        expect(response.body).toStrictEqual({
          errors: [
            {
              location: 'body',
              msg: 'Email already in use',
              param: 'email',
              value: testUser.email
            }
          ]
        })
        expect(spy).toHaveBeenCalledWith({ email: testUser.email })
      })
  })

  test('if user creating fails returns an error', () => {
    const testUser = {
      name: 'Test user',
      email: 'test@test.com.br'
    }

    const spyFind = jest.spyOn(User, 'find').mockResolvedValue([])
    const spyCreate = jest.spyOn(User, 'create').mockRejectedValue('')

    return request(app)
      .post('/users')
      .set('Accept', 'application/json')
      .set('x-access-token', token)
      .send({
        name: testUser.name,
        email: testUser.email
      })
      .then(response => {
        expect(response.statusCode).toBe(500)
        expect(response.body).toStrictEqual({
          errors: [''],
          message: 'There was a problem creating the user.'
        })
        expect(spyFind).toHaveBeenCalledWith({ email: testUser.email })
        expect(spyCreate).toHaveBeenCalledWith({ status: 'enabled', ...testUser })
      })
  })

  test('can create a new user', () => {
    const testUser = {
      _id: '617b4ad51df88902f507643e',
      name: 'Test user',
      email: 'test@test.com.br',
      status: 'enabled',
      phones: [],
      __v: 0
    }

    const spyFind = jest.spyOn(User, 'find').mockResolvedValue([])
    const spyCreate = jest.spyOn(User, 'create').mockResolvedValue(testUser)

    return request(app)
      .post('/users')
      .set('Accept', 'application/json')
      .set('x-access-token', token)
      .send({
        name: testUser.name,
        email: testUser.email
      })
      .then(response => {
        expect(response.statusCode).toBe(200)
        expect(response.body).toStrictEqual({ data: testUser })
        expect(spyFind).toHaveBeenCalledWith({ email: testUser.email })
        expect(spyCreate).toHaveBeenCalledWith({
          status: 'enabled',
          name: testUser.name,
          email: testUser.email
        })
      })
  })
})

describe('GET /users ', () => {
  const users = [
    {
      _id: '617b4ad51df88902f507643e',
      name: 'Test user 1',
      email: 'test1@test.com.br',
      status: 'enabled',
      phones: [],
      __v: 0
    },
    {
      _id: '617b4ad51df88902f507643f',
      name: 'Test user 2',
      email: 'test2@test.com.br',
      status: 'enabled',
      phones: [],
      __v: 0
    }
  ]

  test('listUsers works', () => {
    const spy = jest.spyOn(User, 'find').mockResolvedValue(users)

    return request(app)
      .get('/users')
      .set('Accept', 'application/json')
      .set('x-access-token', token)
      .then(response => {
        expect(response.statusCode).toBe(200)
        expect(response.body).toStrictEqual({
          data: users
        })
        expect(spy).toHaveBeenCalledWith({})
      })
  })

  test('listUsers works with email filter', () => {
    const spy = jest.spyOn(User, 'find').mockResolvedValue(users[0])

    return request(app)
      .get('/users')
      .set('Accept', 'application/json')
      .set('x-access-token', token)
      .query({ email: users[0].email })
      .then(response => {
        expect(response.statusCode).toBe(200)
        expect(response.body).toStrictEqual({
          data: users[0]
        })
        expect(spy).toHaveBeenCalledWith({ email: users[0].email })
      })
  })

  test('listUsers sends an error if not able to find users', () => {
    const spy = jest.spyOn(User, 'find').mockRejectedValue('')

    return request(app)
      .get('/users')
      .set('Accept', 'application/json')
      .set('x-access-token', token)
      .then(response => {
        expect(response.statusCode).toBe(500)
        expect(response.body).toStrictEqual({
          errors: [''],
          message: 'There was a problem finding the users.'
        })
        expect(spy).toHaveBeenCalledWith({})
      })
  })
})

describe('GET /users/:userId', () => {
  test('validation rules works', () => {
    return request(app)
      .get('/users/anything_else')
      .set('Accept', 'application/json')
      .set('x-access-token', token)
      .then(response => {
        expect(response.statusCode).toBe(422)
        expect(response.body).toStrictEqual({
          errors: [
            {
              location: 'params',
              param: 'userId',
              value: 'anything_else',
              msg: 'Invalid userId'
            }
          ]
        })
      })
  })

  test('getUser returns a user', () => {
    const spy = jest.spyOn(User, 'findById').mockResolvedValue(testUser)

    return request(app)
      .get(`/users/${testUser._id}`)
      .set('Accept', 'application/json')
      .set('x-access-token', token)
      .then(response => {
        expect(response.statusCode).toBe(200)
        expect(response.body).toStrictEqual({ data: testUser })
        expect(spy).toHaveBeenCalledWith(testUser._id)
      })
  })

  test('getUser returns 404 if the user not found', () => {
    const spy = jest.spyOn(User, 'findById').mockResolvedValue(null)

    return request(app)
      .get(`/users/${testUser._id}`)
      .set('Accept', 'application/json')
      .set('x-access-token', token)
      .then(response => {
        expect(response.statusCode).toBe(404)
        expect(response.body).toStrictEqual({
          errors: {
            location: 'params',
            param: 'userId',
            value: testUser._id,
            msg: 'User not found'
          }
        })
        expect(spy).toHaveBeenCalledWith(testUser._id)
      })
  })

  test('getUser sends an error if not able to find users', () => {
    const spy = jest.spyOn(User, 'findById').mockRejectedValue('')

    return request(app)
      .get(`/users/${testUser._id}`)
      .set('Accept', 'application/json')
      .set('x-access-token', token)
      .then(response => {
        expect(response.statusCode).toBe(500)
        expect(response.body).toStrictEqual({
          errors: [''],
          message: 'There was a problem finding the users.'
        })
        expect(spy).toHaveBeenCalledWith(testUser._id)
      })
  })
})

describe('PUT /users/:userId', () => {
  const validationErrorsPayload = {
    name: '',
    email: '',
    pinCode: '',
    status: ''
  }

  const repeatedEmailPayload = {
    name: testUser.name,
    email: 'same@test.com',
    pinCode: '123456',
    status: testUser.status
  }

  test('updateUser returns 404 when a invalid mongoId is provided', () => {
    return request(app)
      .put('/users/random_string')
      .set('Accept', 'application/json')
      .set('x-access-token', token)
      .then(response => {
        expect(response.statusCode).toBe(404)
        expect(response.body).toStrictEqual({
          errors: [
            {
              location: 'params',
              msg: 'Invalid userId',
              param: 'userId',
              value: 'random_string'
            }
          ]
        })
      })
  })

  test('default validation rules works', () => {
    const spy = jest.spyOn(User, 'findOne').mockResolvedValue(null)

    return request(app)
      .put(`/users/${testUser._id}`)
      .set('Accept', 'application/json')
      .set('x-access-token', token)
      .send(validationErrorsPayload)
      .then(response => {
        expect(response.statusCode).toBe(422)
        expect(response.body).toStrictEqual({
          errors: [
            {
              location: 'body',
              param: 'name',
              value: '',
              msg: 'Name field cannot be empty'
            },
            {
              location: 'body',
              param: 'email',
              value: '',
              msg: 'Invalid Email'
            },
            {
              location: 'body',
              param: 'pinCode',
              value: '',
              msg: 'Pin code field must be numeric'
            },
            {
              location: 'body',
              param: 'pinCode',
              value: '',
              msg: 'Pin code field cannot be empty'
            },
            {
              location: 'body',
              param: 'pinCode',
              value: '',
              msg: 'Pin code field must be between 4 and 6 characters'
            },
            {
              location: 'body',
              param: 'status',
              value: '',
              msg: 'Name field cannot be empty'
            }
          ]
        })
        expect(spy).toHaveBeenCalledWith({ email: validationErrorsPayload.email })
      })
  })

  test('updateUser returns an error if the email is already in use', () => {
    const spy = jest.spyOn(User, 'findOne').mockResolvedValue({
      id: testUser._id,
      ...testUser
    })

    return request(app)
      .put('/users/617b4ad51df88902f507643e')
      .set('Accept', 'application/json')
      .set('x-access-token', token)
      .send(repeatedEmailPayload)
      .then(response => {
        expect(response.statusCode).toBe(422)
        expect(response.body).toStrictEqual({
          errors: [
            {
              location: 'body',
              param: 'email',
              value: 'same@test.com',
              msg: 'Email already in use'
            }
          ]
        })
        expect(spy).toHaveBeenCalledWith({ email: repeatedEmailPayload.email })
      })
  })

  test('updateUser returns 404 if no user is found', () => {
    const spyFindOne = jest.spyOn(User, 'findOne').mockResolvedValue(null)
    const spyFindOneAndUpdate = jest.spyOn(User, 'findOneAndUpdate').mockResolvedValue(null)

    const notFoundId = '617b4ad51df88902f507643e'

    return request(app)
      .put(`/users/${notFoundId}`)
      .set('Accept', 'application/json')
      .set('x-access-token', token)
      .send(repeatedEmailPayload)
      .then(response => {
        expect(response.statusCode).toBe(404)
        expect(response.body).toStrictEqual({
          errors: [{
            location: 'params',
            param: 'userId',
            value: notFoundId,
            msg: 'User not found'
          }]
        })
        expect(spyFindOne).toHaveBeenCalledWith({ email: repeatedEmailPayload.email })
        expect(spyFindOneAndUpdate).toHaveBeenCalledWith(
          { _id: notFoundId },
          // userId: 1 comes from the token creation and middleware
          { userId: 1, ...repeatedEmailPayload },
          { new: true, useFindAndModify: false }
        )
      })
  })

  test('updateUser works', () => {
    const updatedName = 'New Test User'

    const spyFindOneAndUpdate = jest.spyOn(User, 'findOneAndUpdate').mockResolvedValue({
      ...testUser,
      name: updatedName
    })

    return request(app)
      .put(`/users/${testUser._id}`)
      .set('Accept', 'application/json')
      .set('x-access-token', token)
      .send({
        name: updatedName
      })
      .then(response => {
        expect(response.statusCode).toBe(200)
        expect(response.body).toStrictEqual({
          data: {
            ...testUser,
            name: updatedName
          }
        })
        expect(spyFindOneAndUpdate).toHaveBeenCalledWith(
          { _id: testUser._id },
          // userId: 1 comes from the token creation and middleware
          { userId: 1, name: updatedName },
          { new: true, useFindAndModify: false }
        )
      })
  })

  test('updateUser returns an error if mongo is not able to update a user', () => {
    const updatedName = 'New Test User'

    const spy = jest.spyOn(User, 'findOneAndUpdate').mockRejectedValue('')

    return request(app)
      .put(`/users/${testUser._id}`)
      .set('Accept', 'application/json')
      .set('x-access-token', token)
      .send({
        name: updatedName
      })
      .then(response => {
        expect(response.statusCode).toBe(500)
        expect(response.body).toStrictEqual({
          errors: [''],
          message: 'There was a problem finding the users.'
        })
        expect(spy).toHaveBeenCalledWith(
          { _id: testUser._id },
          // userId: 1 comes from the token creation and middleware
          { userId: 1, name: updatedName },
          { new: true, useFindAndModify: false }
        )
      })
  })
})

describe('POST /users/:userId/pinCode', () => {
  test('default validation rules works', () => {
    return request(app)
      .post(`/users/${testUser._id}/pinCode`)
      .set('Accept', 'application/json')
      .set('x-access-token', token)
      .then(response => {
        expect(response.statusCode).toBe(422)
        expect(response.body).toStrictEqual({
          errors:
            [{
              location: 'body',
              msg: 'Pin code field must be numeric',
              param: 'pinCode'
            },
            {
              location: 'body',
              msg: 'Pin code field cannot be empty',
              param: 'pinCode'
            },
            {
              location: 'body',
              msg: 'Pin code field must be between 4 and 6 characters',
              param: 'pinCode'
            }]
        })
      })
  })

  test('equals validation rule works', () => {
    return request(app)
      .post(`/users/${testUser._id}/pinCode`)
      .set('Accept', 'application/json')
      .set('x-access-token', token)
      .send({ pinCode: '123456', pinCodeConfirmation: '1234567' })
      .then(response => {
        expect(response.statusCode).toBe(422)
        expect(response.body).toStrictEqual({
          errors:
            [{
              location: 'body',
              msg: 'Pin code confirmation doesn\'t match pin code',
              param: 'pinCodeConfirmation',
              value: '1234567'
            }]
        })
      })
  })

  test('returns 404 if a invalid mongo id is provided', () => {
    return request(app)
      .post('/users/invalid_id/pinCode')
      .set('Accept', 'application/json')
      .set('x-access-token', token)
      .then(response => {
        expect(response.statusCode).toBe(404)
        expect(response.body).toStrictEqual({
          errors:
            [{
              location: 'params',
              msg: 'Invalid user id',
              param: 'userId',
              value: 'invalid_id'
            },
            {
              location: 'body',
              msg: 'Pin code field must be numeric',
              param: 'pinCode'
            },
            {
              location: 'body',
              msg: 'Pin code field cannot be empty',
              param: 'pinCode'
            },
            {
              location: 'body',
              msg: 'Pin code field must be between 4 and 6 characters',
              param: 'pinCode'
            }]
        })
      })
  })

  test('returns 404 if the user is not found', () => {
    const spyUser = jest.spyOn(User, 'findById').mockResolvedValue(null)
    const pinCode = '123445'
    return request(app)
      .post(`/users/${testUser._id}/pinCode`)
      .set('Accept', 'application/json')
      .set('x-access-token', token)
      .send({ pinCode, pinCodeConfirmation: pinCode })
      .then(response => {
        expect(response.statusCode).toBe(404)
        expect(response.body).toStrictEqual({
          errors: [{
            message: 'User not found.'
          }]
        })
        expect(spyUser).toHaveBeenCalledWith(testUser._id)
      })
  })

  test('returns 500 if if not able to find a user', () => {
    const spyUser = jest.spyOn(User, 'findById').mockRejectedValue('')
    const pinCode = '123445'
    return request(app)
      .post(`/users/${testUser._id}/pinCode`)
      .set('Accept', 'application/json')
      .set('x-access-token', token)
      .send({ pinCode, pinCodeConfirmation: pinCode })
      .then(response => {
        expect(response.statusCode).toBe(500)
        expect(response.body).toStrictEqual({
          errors: [''],
          message: 'There was a problem creating the pin code.'
        })
        expect(spyUser).toHaveBeenCalledWith(testUser._id)
      })
  })

  test('createPinCode works', () => {
    const spyPinCodeHelper = jest.spyOn(pinCodeHelpers, 'createPinCode').mockResolvedValue(testUser)
    const spyUser = jest.spyOn(User, 'findById').mockResolvedValue(testUser)
    const pinCode = '123456'

    return request(app)
      .post(`/users/${testUser._id}/pinCode`)
      .set('Accept', 'application/json')
      .set('x-access-token', token)
      .send({ pinCode, pinCodeConfirmation: pinCode })
      .then(response => {
        expect(response.statusCode).toBe(200)
        expect(response.body).toStrictEqual({
          data: {
            message: 'Pin Code created!'
          }
        })
        expect(spyPinCodeHelper).toHaveBeenCalledWith(testUser._id, pinCode)
        expect(spyUser).toHaveBeenCalledWith(testUser._id)
      })
  })

  test('createPinCode returns an error if not able to create a pin code', () => {
    const spy = jest.spyOn(pinCodeHelpers, 'createPinCode').mockRejectedValue('')
    const pinCode = '123456'

    return request(app)
      .post(`/users/${testUser._id}/pinCode`)
      .set('Accept', 'application/json')
      .set('x-access-token', token)
      .send({ pinCode, pinCodeConfirmation: pinCode })
      .then(response => {
        expect(response.statusCode).toBe(500)
        expect(response.body).toStrictEqual({
          errors: [''],
          message: 'There was a problem creating the pin code.'
        })
        expect(spy).toHaveBeenCalledWith(testUser._id, pinCode)
      })
  })

  test('createPinCode returns an error if the token is already set', () => {
    const spy = jest.spyOn(pinCodeHelpers, 'createPinCode').mockRejectedValue(new Error('Pin Code has already been set!'))
    const pinCode = '123456'

    return request(app)
      .post(`/users/${testUser._id}/pinCode`)
      .set('Accept', 'application/json')
      .set('x-access-token', token)
      .send({ pinCode, pinCodeConfirmation: pinCode })
      .then(response => {
        expect(response.statusCode).toBe(403)
        expect(response.body).toStrictEqual({
          errors: ['Pin Code has already been set!'],
          message: 'There was a problem creating the pin code.'
        })
        expect(spy).toHaveBeenCalledWith(testUser._id, pinCode)
      })
  })
})

describe('PUT /users/:userId/pinCode', () => {
  test('default validation works', () => {
    return request(app)
      .put(`/users/${testUser._id}/pinCode`)
      .set('Accept', 'application/json')
      .set('x-access-token', token)
      .then(response => {
        expect(response.statusCode).toBe(422)
        expect(response.body).toStrictEqual({
          errors:
            [{
              location: 'body',
              msg: 'Pin code field must be numeric',
              param: 'pinCode'
            },
            {
              location: 'body',
              msg: 'Pin code field cannot be empty',
              param: 'pinCode'
            },
            {
              location: 'body',
              msg: 'Pin code field must be numeric',
              param: 'newPinCode'
            },
            {
              location: 'body',
              msg: 'Pin code field cannot be empty',
              param: 'newPinCode'
            },
            {
              location: 'body',
              msg: 'Pin code field must be between 4 and 6 characters',
              param: 'newPinCode'
            }]
        })
      })
  })

  test('returns 404 if an invalid mongo id is provided', () => {
    return request(app)
      .put('/users/invalid_id/pinCode')
      .set('Accept', 'application/json')
      .set('x-access-token', token)
      .then(response => {
        expect(response.statusCode).toBe(404)
        expect(response.body).toStrictEqual({
          errors:
            [{
              location: 'params',
              msg: 'Invalid user id',
              param: 'userId',
              value: 'invalid_id'
            },
            {
              location: 'body',
              msg: 'Pin code field must be numeric',
              param: 'pinCode'
            },
            {
              location: 'body',
              msg: 'Pin code field cannot be empty',
              param: 'pinCode'
            },
            {
              location: 'body',
              msg: 'Pin code field must be numeric',
              param: 'newPinCode'
            },
            {
              location: 'body',
              msg: 'Pin code field cannot be empty',
              param: 'newPinCode'
            },
            {
              location: 'body',
              msg: 'Pin code field must be between 4 and 6 characters',
              param: 'newPinCode'
            }]
        })
      })
  })

  test('returns 404 if the user is not found', () => {
    const spyUser = jest.spyOn(User, 'findById').mockResolvedValue(null)
    const pinCode = '123445'
    const newPinCode = '654321'

    return request(app)
      .put(`/users/${testUser._id}/pinCode`)
      .set('Accept', 'application/json')
      .set('x-access-token', token)
      .send({ pinCode, newPinCode, newPinCodeConfirmation: newPinCode })
      .then(response => {
        expect(response.statusCode).toBe(404)
        expect(response.body).toStrictEqual({
          errors: [{
            message: 'User not found.'
          }]
        })
        expect(spyUser).toHaveBeenCalledWith(testUser._id)
      })
  })

  test('returns 500 if if not able to find a user', () => {
    const spyUser = jest.spyOn(User, 'findById').mockRejectedValue('')
    const pinCode = '123445'
    const newPinCode = '654321'

    return request(app)
      .put(`/users/${testUser._id}/pinCode`)
      .set('Accept', 'application/json')
      .set('x-access-token', token)
      .send({ pinCode, newPinCode, newPinCodeConfirmation: newPinCode })
      .then(response => {
        expect(response.statusCode).toBe(500)
        expect(response.body).toStrictEqual({
          errors: [''],
          message: 'There was a problem updating the pin code.'
        })
        expect(spyUser).toHaveBeenCalledWith(testUser._id)
      })
  })

  test('updatePinCode works', () => {
    const spyUser = jest.spyOn(User, 'findById').mockResolvedValue(testUser)
    const spyAuthenticatePinCode = jest.spyOn(pinCodeHelpers, 'authenticatePinCode').mockResolvedValue(true)
    const spyUpdatePinCode = jest.spyOn(pinCodeHelpers, 'updatePinCode').mockResolvedValue(testUser)
    const pinCode = '123445'
    const newPinCode = '654321'

    return request(app)
      .put(`/users/${testUser._id}/pinCode`)
      .set('Accept', 'application/json')
      .set('x-access-token', token)
      .send({ pinCode, newPinCode, newPinCodeConfirmation: newPinCode })
      .then(response => {
        expect(response.statusCode).toBe(200)
        expect(response.body).toStrictEqual({
          data: { message: 'Pin Code updated!' }
        })
        expect(spyUser).toHaveBeenCalledWith(testUser._id)
        expect(spyAuthenticatePinCode).toHaveBeenCalledWith(testUser._id, pinCode)
        expect(spyUpdatePinCode).toHaveBeenCalledWith(testUser._id, newPinCode)
      })
  })

  test('returns 403 if the wrong pin code is provided', () => {
    const spyUser = jest.spyOn(User, 'findById').mockResolvedValue(testUser)
    const spyAuthenticatePinCode = jest.spyOn(pinCodeHelpers, 'authenticatePinCode').mockRejectedValue(new Error('Pin Code authentication error!'))
    const pinCode = '123445'
    const newPinCode = '654321'

    return request(app)
      .put(`/users/${testUser._id}/pinCode`)
      .set('Accept', 'application/json')
      .set('x-access-token', token)
      .send({ pinCode, newPinCode, newPinCodeConfirmation: newPinCode })
      .then(response => {
        expect(response.statusCode).toBe(403)
        expect(response.body).toStrictEqual({
          errors: ['Pin Code authentication error!'],
          message: 'There was a problem updating the pin code.'
        })
        expect(spyUser).toHaveBeenCalledWith(testUser._id)
        expect(spyAuthenticatePinCode).toHaveBeenCalledWith(testUser._id, pinCode)
      })
  })

  test('returns 500 if there is a problem with updatePinCode', () => {
    const spyUser = jest.spyOn(User, 'findById').mockResolvedValue(testUser)
    const spyAuthenticatePinCode = jest.spyOn(pinCodeHelpers, 'authenticatePinCode').mockResolvedValue(true)
    const spyUpdatePinCode = jest.spyOn(pinCodeHelpers, 'updatePinCode').mockRejectedValue('')
    const pinCode = '123445'
    const newPinCode = '654321'

    return request(app)
      .put(`/users/${testUser._id}/pinCode`)
      .set('Accept', 'application/json')
      .set('x-access-token', token)
      .send({ pinCode, newPinCode, newPinCodeConfirmation: newPinCode })
      .then(response => {
        expect(response.statusCode).toBe(500)
        expect(response.body).toStrictEqual({
          errors: [''],
          message: 'There was a problem updating the pin code.'
        })
        expect(spyUser).toHaveBeenCalledWith(testUser._id)
        expect(spyAuthenticatePinCode).toHaveBeenCalledWith(testUser._id, pinCode)
        expect(spyUpdatePinCode).toHaveBeenCalledWith(testUser._id, newPinCode)
      })
  })
})
