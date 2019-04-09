const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');

/* Creates a new user */
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

module.exports = router;
