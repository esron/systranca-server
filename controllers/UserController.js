const { validationResult, checkSchema } = require('express-validator/check');

const User = require('../models/User');

const UserController = {};

UserController.validate = (method) => {
  switch (method) {
    case 'createUser': {
      return checkSchema({
        name: {
          in: ['body'],
          exists: {
            errorMessage: 'Name field is required',
          },
          trim: true,
          escape: true,
          stripLow: true,
        },
        email: {
          in: ['body'],
          exists: {
            errorMessage: 'Email field is required',
          },
          isEmail: {
            errorMessage: 'Invalid Email',
          },
          custom: {
            options: (value) => {
              return User.find({email: value}).then(user => {
                if (user.length) {
                  return Promise.reject('Email already in use');
                }
              });
            }
          }
        }
      });
    }
  }
}

UserController.createUser = (req, res) => {
  const errors = validationResult(req) // To get the result of above validade fn
  if (!errors.isEmpty()){
    return res.status(422).send({errors: errors.array()});
  }

  const { name, email } = req.body;

  User.create({ name, email, status: 'enabled' })
    .then(user => res.status(200).send(user))
    .catch(err => res.status(500).send({
      error: err,
      message: 'There was a problem creating the user.',
    }));
}

UserController.listUsers = (_, res) => {
  User.find({}, { password: 0 })
    .then((users) => res.status(200).send(users))
    .catch(err => res.status(500).send({
      error: err,
      message: 'There was a problem finding the users.'
    }));
}

module.exports = UserController;
