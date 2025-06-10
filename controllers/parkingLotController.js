const ParkingLot = require('../models/Parkinglot');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Sequelize = require('sequelize');


class parkingLotController {

    //[GET] parkingLot/all - Thống kê tất cả bãi xe mà user đó có quyền truy cập
    getAll = async (req, res) => {
        try {
            const userParkingData = await User.findOne({ 
                where: { username: req.user },
                include: {
                    model: ParkingLot,
                    through: {
                        attributes: ['id', 'name'], // Chỉ lấy các trường cần thiết từ bảng UserParkingLot
                    },
                },
            });
            if (!userParkingData || !userParkingData.ParkingLots) {
            // Vẫn trả về thành công nhưng với một mảng rỗng
            return res.status(200).json({
                success: true,
                message: 'Không tìm thấy bãi xe nào.',
                data: [] 
            });
            }
            // Trích xuất danh sách các bãi xe từ kết quả
            const parkingLots = userParkingData.ParkingLots;

            return res.status(200).json({
                success: true,
                message: 'Lấy danh sách bãi xe thành công.',
                data: parkingLots // Chỉ trả về mảng các bãi xe
            });
        } catch (err) {
            return res.status(403).json({ success: false, message: err.message});
        }
    };

    //[GET] parkingLot/:id

    getVehicle = async (req, res) => {
        try {
            const parkingLot = await ParkingLot.findOne({
                where: { id: req.params.id },
                include: Vehicle,
            });
            const allVehicles = parkingLot.Vehicles;
            console.log(allVehicles);
            return res.status(200).json({
                success: true,
                message: 'Lấy danh sách xe trong bãi thành công.',
                data: allVehicles // Chỉ trả về mảng các xe trong bãi
            });
        } catch (err) {
            return res.status(403).json({ success: false, message: err.message});
        }
    };



    //[POST] parkinglot/create - Tạo parkingLot mới
    create = async (req, res) => {
        //Tìm thông tin user khởi tạo Parking-lot
        const currentUser = await User.findOne({ where: { username: req.user }});
        const admin = await User.findOne({ where: { role: "user, admin" }});
        const name = req.body.parkingLotName;
        if(!name) return res.status(401).json({ message: 'ParkingLot Name is required!'});
        const duplicate = await ParkingLot.findOne({ where: { name: name }})
        if (duplicate) return res.status(403).json({ message: 'ParkingLot Name already exists'})
        try {
            const newParkingLot = await ParkingLot.create({
                "name": name
            });
            if (currentUser === admin) {
                await currentUser.addParkingLot(newParkingLot);
                return res.status(200).json({ message: 'ParkingLot created successfully', redirect: '/home' });; 
            }
            //Gắn admin, user đó với newParkinglot
            await currentUser.addParkingLot(newParkingLot);
            await admin.addParkingLot(newParkingLot);
            console.log(currentUser);
            return res.status(200).json({ message: 'ParkingLot created successfully', redirect: '/home' });
        } catch(err) {
            return res.status(403).json({ message: err.message});
        }
    };

    //[POST] parkingLot/:id/newVehicle
    addNewVehicle = async (req, res) => {
        try {
            const currentUser = await User.findOne({ where: { username: req.user }});
            const newVehicle = await Vehicle.create({
                checkInImages: req.body.checkInImages,
                license_plate: req.body.license_plate,
                parkingLotId: req.params.id,
                userId: currentUser.id
            });
            console.log(newVehicle);
            return res.status(201).json({
                success: true,
                message: "Thêm xe mới thành công",
                data: {
                    nfc_card_id: newVehicle.nfc_card_id,
                },
            });
        } catch(err) {
            return res.status(403).json({ message: err.message })
        }
    };

    //[GET] parkingLot/nfc/:nfc_id - Lấy dữ liệu xe trong database
    getVehicleByNFC = async (req, res) => {
        try {
            const vehicle = await Vehicle.findOne({ where: 
                { 
                nfc_card_id: req.params.nfc_id,
                status: "PARKED"
                }
            });
            if (!vehicle) return res.status(404).json({ success: false, message: "Không tìm thấy xe hoặc xe đã check-out." });
            console.log(vehicle);
            return res.status(200).json({ success: true, data: vehicle });
        } catch (err) {
            return res.status(500).json({ success: false, message: "Lỗi khi lấy thông tin xe.", err })
        }
    };

    //[PUT] parkingLot/checkout/:vehicleId - Cập nhật giờ checkout trong database
    checkoutVehicle = async (req, res) => {
        try {
            await Vehicle.update(
                { checkOutTime: Sequelize.literal('CURRENT_TIMESTAMP'),
                    status: 'COMPLETED'  // Cập nhật trạng thái xe thành 'COMPLETED'
                 },
                { where: { id: req.params.vehicleId }}
            );

            return res.status(200).json({ success: true, message: "Checkout Successfull"})
        } catch (err) {
            return res.status(500).json({ success: false, message: "Error checking out vehicle", err });
        }
    };

    //[GET] parkingLot/:id/edit - Hiện trang để edit parkingLot
    editParkingLot = async (req, res) => {
        try {
            const currentParkingLot = await ParkingLot.findByPk(req.params.id);
            if (!currentParkingLot) return res.status(404).json({ success: false, message: "ParkingLot not found" });
            return res.status(200).json({
                success: true, currentParkingLot});
        } catch (err) {
            return res.status(500).json({ success: false, "Error when fetching ParkingLot Data": err.message });
        }
    }

    //[PUT] parkingLot/:id/edit - Cập nhật dữ liệu parkingLot trong database
    updateParkingLot = async (req, res) => {
        try {
            const duplicate = await ParkingLot.findOne({ where: { name: req.body.name }});
            if (duplicate) return res.status(403).json({ message: 'ParkingLot Name already exists. Try another name'})
            await ParkingLot.update(req.body, {
                where: {
                    id: req.params.id
                }
            });
            return res.status(200).json({ success: true, message: "Updating ParkingLot successful" });
        } catch (err) {
            return res.status(500).json({ success: false, "Error when update ParkingLot": err.message })
        }
    }
}

module.exports = new parkingLotController;