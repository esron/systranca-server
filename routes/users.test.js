const request = require('supertest')
const jwt = require('jsonwebtoken')
const app = require('../app')
const { secret } = require('../config/constants')
const User = require('../models/User')

describe('POST /users', () => {
  const user = { id: 1 }
  const token = jwt.sign(user, secret)

  test('default validations works', () => {
    jest.spyOn(User, 'find').mockResolvedValue([])
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
      })
  })

  test('repeated email validation works', () => {
    const testUser = {
      id: 1,
      email: 'test@test.com'
    }

    jest.spyOn(User, 'find').mockResolvedValue([testUser])

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
      })
  })

  test('if user creating fails returns an error', () => {
    const testUser = {
      name: 'Test user',
      email: 'test@test.com.br'
    }

    jest.spyOn(User, 'find').mockResolvedValue([])
    jest.spyOn(User, 'create').mockRejectedValue('')

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

    jest.spyOn(User, 'find').mockResolvedValue([])
    jest.spyOn(User, 'create').mockResolvedValue(testUser)

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
      })
  })
})
