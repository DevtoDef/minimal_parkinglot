const express = require('express');
const router = express.Router();
const parkingLotController = require('../controllers/parkingLotController');
const verifyRole = require('../middleware/verifyRole');
const multer = require('multer');

const upload = multer({ dest: 'upload/' });

router.post('/create', parkingLotController.create);
router.get('/all', parkingLotController.getAll);
router.get('/:id', parkingLotController.getVehicle);
router.get('/:id/edit', verifyRole("admin"), parkingLotController.editParkingLot);
router.put('/:id/edit', verifyRole("admin"), parkingLotController.updateParkingLot);
router.post('/:id/newVehicle', upload.single('checkInImages'), parkingLotController.addNewVehicle);
router.delete('/deleteVehicle/:vehicleId', parkingLotController.deleteVehicle);
router.get('/nfc/:nfc_id', parkingLotController.getVehicleByNFC);
router.put('/checkout/:nfc_card_id', parkingLotController.checkoutVehicle);


module.exports = router;