const User = require('../models/User');

const PhoneController = {};

PhoneController.setUserPhones = (req, res) => {
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
};

module.exports = PhoneController;