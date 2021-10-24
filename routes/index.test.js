const request = require('supertest')
const app = require('../app')

describe('auth router', () => {
  test('issue toke', () => {
    return request(app)
      .get('/')
      .then(response => {
        expect(response.statusCode).toBe(200)
        expect(response.text).toMatch(/Express/)
      })
  })
})
