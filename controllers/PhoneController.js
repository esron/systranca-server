const { validationResult, checkSchema } = require('express-validator/check');
const User = require('../models/User');

const PhoneController = {};

PhoneController.validate = (method) => {
  switch(method) {
    case 'setUserPhones': {
      return checkSchema({
        'phones.*.userId': {
          in: ['params'],
          isMongoId: {
            errorMessage: 'Invalid userId',
          },
        },
        'phones.*.model': {
          in: ['body'],
          exists: {
            errorMessage: 'Model field is required',
          },
          isEmpty: {
            errorMessage: 'Model field cannot be empty',
            negated: true,
          },
          trim: true,
        },
        'phones.*.phoneId': {
          in: ['body'],
          exists: {
            errorMessage: 'Phone id field is required'
          },
          isEmpty: {
            errorMessage: 'Phone id field cannot be empty',
            negated: true,
          },
          trim: true,
        },
      });
    }
  }
};

PhoneController.setUserPhones = (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).send({ errors: errors.array() });
  }

  const { userId } = req.params;
  const { phones } = req.body;

  User.findById(userId)
    .then(user => {
      if(!user) {
        return res.status(404).send({
          errors: {
            location: 'params',
            param: 'userId',
            value: userId,
            msg: 'User not found',
          },
        });
      }

      user.phones = phones;
      user.save();

      return res.status(200).send({ data: user });
    })
    .catch(err => res.status(500).send({
      errors: err,
      messafe: 'There was a problem finding the users.',
    }));
};

module.exports = PhoneController;