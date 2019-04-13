const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');
const phoneController = require('../controllers/PhoneController');

/* Creates a new user. */
router.post(
  '/',
  userController.validate('createUser'),
  userController.createUser
);

/* GET users listing. */
router.get(
  '/',
  userController.listUsers
);

/* GET a user. */
router.get(
  '/:userId',
  userController.validate('getUser'),
  userController.getUser
);

/* Update a user. */
router.put(
  '/:userId',
  userController.validate('updateUser'),
  userController.updateUser
);

router.post(
  '/:userId/phones',
  phoneController.validate('setUserPhones'),
  phoneController.setUserPhones
);

module.exports = router;
