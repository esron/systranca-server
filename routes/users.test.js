const request = require('supertest')
const jwt = require('jsonwebtoken')
const app = require('../app')
const { secret } = require('../config/constants')
const User = require('../models/User')

const user = { id: 1 }
const token = jwt.sign(user, secret)

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
  const testUser = {
    _id: '617b4ad51df88902f507643f',
    name: 'Test user',
    email: 'test@test.com.br',
    status: 'enabled',
    phones: [],
    __v: 0
  }

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
