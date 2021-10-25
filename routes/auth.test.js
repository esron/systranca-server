const request = require('supertest')
const app = require('../app')
const User = require('../models/User')

describe('POST /api/auth/token', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })
  test('validations are working', () => {
    return request(app)
      .post('/api/auth/token')
      .set('Accept', 'application/json')
      .then(response => {
        expect(response.statusCode).toBe(401)
        expect(response.body).toStrictEqual({
          errors: [
            {
              location: 'body',
              param: 'email',
              msg: 'Email field is required'
            },
            {
              location: 'body',
              param: 'email',
              msg: 'Email field cannot be empty'
            },
            {
              location: 'body',
              param: 'password',
              msg: 'Password field is required'
            },
            {
              location: 'body',
              param: 'password',
              msg: 'Password field cannot be empty'
            }
          ]
        })
      })
  })

  test('sends authentication error', () => {
    jest.spyOn(User, 'findOne').mockImplementation(() => Promise.resolve(null))

    return request(app)
      .post('/api/auth/token')
      .set('Accept', 'applications/json')
      .send({
        email: 'notvalid@notvalid.com',
        password: 'not_valid'
      })
      .then(response => {
        expect(response.statusCode).toBe(401)
        expect(response.body).toStrictEqual({
          errors: [{ msg: 'Invalid email or password.' }]
        })
      })
  })

  test('issues a valid token', () => {
    jest.spyOn(User, 'findOne').mockImplementation(() => Promise.resolve({
      id: 1,
      email: 'valid@valid.com'
    }))

    return request(app)
      .post('/api/auth/token')
      .set('Accept', 'applications/json')
      .send({
        email: 'valid@valid.com',
        password: 'valid'
      })
      .then(response => {
        expect(response.statusCode).toBe(200)
        expect(response.body).toMatchObject({
          token: expect.any(String)
        })
      })
  })
})
