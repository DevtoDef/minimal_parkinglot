const express = require('express');
const router = express.Router();
const parkingLotController = require('../controllers/parkingLotController');
const verifyRole = require('../middleware/verifyRole');

router.post('/create', parkingLotController.create);
router.get('/all', parkingLotController.getAll);
router.get('/:id', parkingLotController.getVehicle);
router.get('/:id/edit', verifyRole("admin"), parkingLotController.editParkingLot);
router.put('/:id/edit', verifyRole("admin"), parkingLotController.updateParkingLot);
router.post('/:id/newVehicle', parkingLotController.addNewVehicle);
router.get('/nfc/:nfc_id', parkingLotController.getVehicleByNFC);
router.put('/checkout/:vehicleId', parkingLotController.checkoutVehicle);


module.exports = router;