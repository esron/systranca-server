const mqtt = require('mqtt')
const User = require('../models/User')

module.exports = {

  openDoor (req, res) {
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
