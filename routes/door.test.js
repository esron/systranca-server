const request = require('supertest')
const jwt = require('jsonwebtoken')
const mqtt = require('mqtt')
const app = require('../app')
const { secret } = require('../config/constants')
const User = require('../models/User')

jest.mock('mqtt')

describe('POST /door', () => {
  const testUser = {
    _id: '617b4ad51df88902f507643f',
    id: '617b4ad51df88902f507643f',
    name: 'Test user',
    email: 'test@test.com.br',
    status: 'enabled',
    phones: [],
    __v: 0
  }
  const token = jwt.sign(testUser, secret)

  test('default validation works', () => {
    return request(app)
      .post('/door')
      .set('Accept', 'application/json')
      .set('x-access-token', token)
      .then(response => {
        expect(response.statusCode).toBe(422)
        expect(response.body).toStrictEqual({
          errors: [
            {
              location: 'body',
              msg: 'Pin code is required.',
              param: 'pinCode'
            }
          ]
        })
      })
  })

  test('returns 404 if the user is not found', () => {
    const spyUser = jest.spyOn(User, 'findById').mockResolvedValue(null)

    return request(app)
      .post('/door')
      .set('Accept', 'application/json')
      .set('x-access-token', token)
      .send({ pinCode: '123456' })
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
        expect(spyUser).toHaveBeenCalledWith(testUser._id, 'pinCode name')
      })
  })

  test('returns 403 if the pin code doesn\'t match', () => {
    const spyUser = jest.spyOn(User, 'findById').mockResolvedValue({
      ...testUser,
      pinCode: '654321'
    })

    return request(app)
      .post('/door')
      .set('Accept', 'application/json')
      .set('x-access-token', token)
      .send({ pinCode: '123456' })
      .then(response => {
        expect(response.statusCode).toBe(403)
        expect(response.body).toStrictEqual({
          errors: [{
            message: 'Incorrect pin code.'
          }]
        })
        expect(spyUser).toHaveBeenCalledWith(testUser._id, 'pinCode name')
      })
  })

  test('openDoor works', () => {
    const spyMqttClient = {
      publish: jest.fn().mockImplementation((a, b, cb) => {
        cb()
      }),
      end: jest.fn()
    }

    mqtt.connect.mockReturnValue(spyMqttClient)

    const spyUser = jest.spyOn(User, 'findById').mockResolvedValue({
      ...testUser,
      pinCode: '123456'
    })

    return request(app)
      .post('/door')
      .set('Accept', 'application/json')
      .set('x-access-token', token)
      .send({ pinCode: '123456' })
      .then(response => {
        expect(response.statusCode).toBe(200)
        expect(response.body).toStrictEqual({
          data: `Door opened by ${testUser.name}`
        })
        expect(spyUser).toHaveBeenCalledWith(testUser._id, 'pinCode name')
        expect(spyMqttClient.publish).toHaveBeenCalledWith(
          'hello',
          'Open the door',
          expect.any(Function)
        )
      })
  })
})
