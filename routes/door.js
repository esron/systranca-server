const express = require('express');
const doorController = require('../controllers/DoorController');

const router = express.Router();

router.post(
  '/',
  doorController.openDoor
);

module.exports = router;
