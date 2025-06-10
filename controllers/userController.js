const ParkingLot = require('../models/Parkinglot');
const User = require('../models/User');


class userController {
    //[Get] user/
    getAllUser = async (req, res) => {
        try {
            const allUser = await User.findAll({
                include: {
                    model: ParkingLot,
                    attribute: ['name']
                }
            });
            const userParkingData = {};
            allUser.forEach(user => {
                userParkingData[user.username] = user.ParkingLots.map(lot => lot.name);
            });
            return res.status(200).json({
                success: true,
                message: 'Get all users successfully',
                data: userParkingData
            });
        } catch (error) {
            console.error('Error fetch data users', error.message);
            return res.status(500).json({ success: false, message: error.message });
        }
    };

    //[GET] user/:userId
    getUser = async (req, res) => {
        try {
            const currentUser = await User.findOne({
                where: { id: req.params.userId },
                include: {
                    model: ParkingLot,
                    attribute: ['name']
                },
            })
            if (!currentUser) return res.status(403).json({ success: false, message: "No user in database"});
            res.status(200).json({
                success: true,
                message: "Get user successfully",
                data: currentUser
            });
        } catch (err) {
            return res.status(500).json({ success: false, "Error when fetching user data": err.message });
        }
    };

    //[PUT] user/:userId
    editUser = async (req, res) => {
        try {
            User.update(req.body, { 
                where: { id: req.params.userId }
            })
        } catch (error) {
            res.status(500).json({ success: false, "Error when updating user": error.message });
        }
    };

    //[GET] user/:userId/allParkingLot
    manageParkingLot = async (req, res) => {
        try {
            const currentUser = await User.findByPk(req.params.userId, {
                include: ParkingLot
            });
            if (!currentUser) return res.status(404).json({ success:false, message: "User not found" });
            const allParkingLots = await ParkingLot.findAll();
            const managedParkingLots = currentUser.ParkingLots;
            const unmanagedParkingLots = allParkingLots.filter(lot => 
                !managedParkingLots.some(managedLot => managedLot.id === lot.id)
            );
            return res.json({ 
                success: true,
                message: "Get all parking lots successfully",
                data: {
                    unmanagedParkingLots: unmanagedParkingLots,
                    managedParkingLots: managedParkingLots 
                }
            });

            
        } catch (error) {
            res.status(500).json({ success:false, "Error when fetching data": error.message })
        }

    };


    //[POST] user/:userId/addParkingLot
    addParkingLot = async (req, res) => {
        try {
            const currentUser = await User.findByPk(req.params.userId);
            if (!currentUser) return res.status(404).json({ success:false, message: "User not found" });

            const currentParkingLot = await ParkingLot.findOne({
                where: { name: req.body.parkingLotName }
            });
            await currentUser.addParkingLot(currentParkingLot);
            res.status(200).json({
                success:true,
                message: "add ParkingLot thành công" 
            });
        } catch (error) {
            res.status(500).json({
                success:false,
                "Error when remove ParkingLot": error.message
            });
        }
    };

    //[POST] user/:userId/removeParkingLot
    removeParkingLot = async (req, res) => {
        try {
            const currentUser = await User.findByPk(req.params.userId);
            if (!currentUser) return res.status(404).json({ 
                success: false, 
                message: "User not found"
            });

            const currentParkingLot = await await ParkingLot.findOne({
                where: { name: req.body.parkingLotName }
            });
            await currentUser.removeParkingLot(currentParkingLot);
            res.status(200).json({ 
                success:true, 
                message: "remove ParkingLot thành công"
            });

        } catch (error) {
            res.status(500).json({ 
                success: false, 
                "Error when remove ParkingLot": error.message
            });
        }
    };







    

}

module.exports = new userController;