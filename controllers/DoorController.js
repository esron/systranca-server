const mqtt = require('mqtt');
const User = require('../models/User');

const mqttClient = mqtt.connect('mqtt://localhost');

const DoorController = {};

DoorController.openDoor = (req, res) => {
  const { userId } = req.body;

  User.findById(userId)
  .then(user => {
    if (!user) {
      return res.status(404).send({
        errors: {
          location: 'params',
          param: 'userId',
          value: userId,
          msg: 'User not found',
        },
      });
    }

      mqttClient.publish('hello', 'Open the door', function() {
        return res.status(200).send({ data: `Door opened by ${user.name}` });
      })
  })
}

module.exports = DoorController;
