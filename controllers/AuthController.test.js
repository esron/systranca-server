const request = require('supertest')
const app = require('../app')

/**
 * The validation of a token is being tested in every route test
 */
test('AuthController.validadeToken returns an error if a invalid token is provided', () => {
  return request(app)
    .get('/users')
    .set('x-access-token', 'some invalid token')
    .then(response => {
      expect(response.statusCode).toBe(401)
      expect(response.body).toStrictEqual({
        errors: [{
          message: 'Authentication error'
        }]
      })
    })
})
