const { validationResult, checkSchema } = require('express-validator/check')
const jwt = require('jsonwebtoken')

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
        var tokenData = { id: user.id, email: user.email }

        var token = jwt.sign(tokenData, process.env.SECRET, { expiresIn: '1h' })

        res.status(200).send({ token })
      })
      .catch(err => res.status(401).send({
        errors: err,
        message: 'Invalid email or password.'
      }))
  },

  validateToken (req, res, next) {
    jwt.verify(req.headers['x-access-token'], process.env.SECRET, function (
      err,
      decoded
    ) {
      if (err) {
        res.json({ status: 'error', message: err.message, data: null })
      } else {
        req.body.userId = decoded.id
        next()
      }
    })
  }
}
