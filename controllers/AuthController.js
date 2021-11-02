const { validationResult, checkSchema } = require('express-validator/check')
const jwt = require('jsonwebtoken')

const { secret } = require('../config/constants')
const User = require('../models/User')

module.exports = {
  validate (method) {
    switch (method) {
      case 'issueToken': {
        return checkSchema({
          email: {
            in: ['body'],
            exists: {
              errorMessage: 'Email field is required'
            },
            isEmpty: {
              errorMessage: 'Email field cannot be empty',
              negated: true
            },
            trim: true,
            escape: true,
            stripLow: true
          },
          password: {
            in: ['body'],
            exists: {
              errorMessage: 'Password field is required'
            },
            isEmpty: {
              errorMessage: 'Password field cannot be empty',
              negated: true
            },
            trim: true,
            escape: true,
            stripLow: true
          }
        })
      }
    }
  },

  issueToken (req, res) {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      return res.status(401).send({ errors: errors.array() })
    }

    const { email, password } = req.body

    User.findOne({ email, password })
      .then(user => {
        if (user === null) {
          return res.status(401).send({
            errors: [{ msg: 'Invalid email or password.' }]
          })
        }

        const tokenData = { id: user.id, email: user.email }

        const token = jwt.sign(tokenData, secret, { expiresIn: '1h' })

        res.status(200).send({ token })
      })
  },

  validateToken (req, res, next) {
    jwt.verify(req.headers['x-access-token'], secret, function (
      err,
      decoded
    ) {
      if (err) {
        res.status(401).json({
          errors: [{
            message: 'Authentication error'
          }]
        })
      } else {
        req.body.userId = decoded.id
        next()
      }
    })
  }
}
