const { param, validationResult, checkSchema } = require('express-validator/check')

const User = require('../models/User')

const UserController = {}

UserController.validate = (method) => {
  switch (method) {
    case 'createUser': {
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
        email: {
          in: ['body'],
          exists: {
            errorMessage: 'Email field is required'
          },
          isEmail: {
            errorMessage: 'Invalid Email'
          },
          custom: {
            options: async (value) => {
              const user = await User.find({ email: value })
              if (user.length) {
                return Promise.reject(new Error('Email already in use'))
              }
            }
          }
        }
      })
    }
    case 'getUser': {
      return [
        param('userId', 'Invalid userId')
          .isMongoId()
      ]
    }
    case 'updateUser': {
      return checkSchema({
        userId: {
          in: ['params'],
          isMongoId: {
            errorMessage: 'Invalid userId'
          }
        },
        name: {
          in: ['body'],
          optional: true,
          trim: true,
          escape: true,
          stripLow: true,
          isEmpty: {
            errorMessage: 'Name field cannot be empty',
            negated: true
          }
        },
        email: {
          in: ['body'],
          optional: true,
          isEmail: {
            errorMessage: 'Invalid Email'
          },
          custom: {
            options: async (value, { req }) => {
              const user = await User.findOne({ email: value })
              if (user && user.id !== req.params.userId) {
                return Promise.reject(new Error('Email already in use'))
              }
            }
          }
        },
        pinCode: {
          in: ['body'],
          optional: true,
          isNumeric: {
            errorMessage: 'Pin code field must be numeric'
          },
          isEmpty: {
            errorMessage: 'Pin code field cannot be empty',
            negated: true
          },
          isLength: {
            errorMessage: 'Pin code field must be between 4 and 6 characters',
            options: {
              min: 4,
              max: 6
            }
          }
        },
        status: {
          in: ['body'],
          optional: true,
          isIn: {
            options: ['enabled', 'disabled'],
            errorMessage: 'Status must be one of the following [\'enabled\', \'disabled\']'
          },
          isEmpty: {
            errorMessage: 'Name field cannot be empty',
            negated: true
          }
        }
      })
    }
  }
}

UserController.createUser = (req, res) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(422).send({ errors: errors.array() })
  }

  const { name, email } = req.body

  User.create({ name, email, status: 'enabled' })
    .then(user => res.status(200).send({ data: user }))
    .catch(err => res.status(500).send({
      errors: err,
      message: 'There was a problem creating the user.'
    }))
}

UserController.listUsers = (req, res) => {
  const { email } = req.query

  const filter = {}

  if (email) {
    filter.email = email
  }

  User.find(filter)
    .then((users) => res.status(200).send({ data: users }))
    .catch(err => res.status(500).send({
      errors: err,
      message: 'There was a problem finding the users.'
    }))
}

UserController.getUser = (req, res) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(422).send({ errors: errors.array() })
  }

  const { userId } = req.params

  User.findById(userId)
    .then(user => {
      if (!user) {
        return res.status(404).send({
          errors: {
            location: 'params',
            param: 'userId',
            value: userId,
            msg: 'User not found'
          }
        })
      }

      return res.status(200).send({ data: user })
    })
    .catch(err => res.status(500).send({
      errors: err,
      message: 'There was a problem finding the users.'
    }))
}

UserController.updateUser = (req, res) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(422).send({ errors: errors.array() })
  }

  const { userId } = req.params
  const toUpdate = req.body

  User.findOneAndUpdate({ _id: userId }, toUpdate, {
    new: true,
    useFindAndModify: false
  })
    .then(user => {
      if (!user) {
        return res.status(404).send({
          errors: {
            location: 'params',
            param: 'userId',
            value: userId,
            msg: 'User not found'
          }
        })
      }

      return res.status(200).send({ data: user })
    })
    .catch(err => res.status(500).send({
      errors: err,
      message: 'There was a problem finding the users.'
    }))
}

module.exports = UserController
