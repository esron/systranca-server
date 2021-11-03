const { checkSchema, validationResult } = require('express-validator/check')
const mqtt = require('mqtt')
const User = require('../models/User')

module.exports = {
  validate () {
    return checkSchema({
      pinCode: {
        in: ['body'],
        exists: {
          errorMessage: 'Pin code is required.'
        }
      }
    })
  },

  openDoor (req, res) {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      return res.status(422).send({ errors: errors.array() })
    }

    const { userId, pinCode } = req.body
    const mqttClient = mqtt.connect('mqtt://localhost')

    User.findById(userId, 'pinCode name')
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

        if (pinCode !== user.pinCode) {
          return res.status(403).send('Incorrect pin code')
        }

        mqttClient.publish('hello', 'Open the door', function () {
          mqttClient.end()
          return res.status(200).send({ data: `Door opened by ${user.name}` })
        })
      })
  }
}
