const { validationResult, checkSchema } = require('express-validator/check')
const jwt = require('jsonwebtoken')

const User = require('../models/User')

const AuthController = {}

AuthController.validate = (method) => {
  switch (method) {
    case 'issueToken': {
      return checkSchema({
        name: {
          in: ['body'],
          exists: {
            errorMessage: 'Name field is required'
          },
          isEmpty: {
            errorMessage: 'Name field cannot be empty',
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
}

AuthController.issueToken = (req, res) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(401).send({ errors: errors.array() })
  }

  const { name, password } = req.body

  User.findOne({ name, password })
    .then(user => {
      var tokenData = { id: user.id, name: user.name }

      var token = jwt.sign(tokenData, process.env.SECRET, { expiresIn: '1h' })

      res.status(200).send({ token })
    })
    .catch(err => res.status(401).send({
      errors: err,
      message: 'Invalid username or password.'
    }))
}

AuthController.validateToken = (req, res, next) => {
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

module.exports = AuthController
