const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyRole = require('../middleware/verifyRole');

router.get('/', userController.getAllUser);
router.get('/:userId', userController.getUser);
router.put('/:userId', userController.editUser);
router.get('/:userId/allParkingLot', userController.manageParkingLot);
router.post('/:userId/addParkingLot', userController.addParkingLot);
router.post('/:userId/removeParkingLot', userController.removeParkingLot);



module.exports = router;