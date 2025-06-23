const ParkingLot = require('../models/ParkingLot');
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
                    attributes: ['id', 'name', 'address'], // Chỉ lấy các trường cần thiết từ bảng ParkingLot
                    through: {
                        attributes: [], // Chỉ lấy các trường cần thiết từ bảng UserParkingLot
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
        const admin = await User.findOne({ where: { role: "admin" }});
        const name = req.body.parkingLotName;
        const maxspace = req.body.maxSpace;
        const address = req.body.address;
        if(!name || !maxspace || !address) return res.status(401).json({ success: false, message: 'Vui lòng nhập đủ trường thông tin!'});
        const duplicate = await ParkingLot.findOne({ where: { name: name }})
        if (duplicate) return res.status(403).json({ success: false, message: 'ParkingLot Name already exists'})
        try {
            const newParkingLot = await ParkingLot.create({
                "name": name,
                "maxspace": maxspace,
                "address": address
            });
            if (currentUser.role === "admin") {
                await currentUser.addParkingLot(newParkingLot);
                return res.status(200).json({ success: true, message: 'ParkingLot created successfully by admin', data: newParkingLot });; 
            }
            //Gắn admin, user đó với newParkinglot
            await currentUser.addParkingLot(newParkingLot);
            await admin.addParkingLot(newParkingLot);
            return res.status(200).json({success: true, message: 'ParkingLot created successfully by user', data: newParkingLot });
        } catch(err) {
            console.log(err);
            return res.status(403).json({ success: false, message: err.message });
        }
    };

    //[POST] parkingLot/:id/newVehicle
    addNewVehicle = async (req, res) => {
        try {
        // Bắt đầu transaction và nhận về kết quả là newVehicle
        const result = await sequelize.transaction(async (t) => {
            const { checkInImages, license_plate } = req.body;
            const parkingLotId = req.params.id;

            // 1. Tìm bãi xe và khóa nó lại trong transaction
            const parkingLot = await ParkingLot.findByPk(parkingLotId, {
                lock: t.LOCK.UPDATE, // Khóa dòng này
                transaction: t       // Báo cho lệnh này biết nó thuộc transaction 't'
            });

            if (!parkingLot) {
                // Ném lỗi sẽ tự động khiến transaction bị ROLLBACK
                throw new Error('ParkingLot not found.');
            }

            // 2. Kiểm tra chỗ trống
            if (parkingLot.currentspace >= parkingLot.maxspace) {
                throw new Error('ParkingLot is full.');
            }

            // 3. Tìm người dùng
            const currentUser = await User.findOne({ 
                where: { username: req.user }, 
                transaction: t 
            });
            if (!currentUser) {
                throw new Error('User not found.');
            }

            // 4. Tạo xe mới
            const newVehicle = await Vehicle.create({
                checkInImages: checkInImages,
                license_plate: license_plate,
                parkingLotId: parkingLotId,
                userId: currentUser.id
            }, { transaction: t });

            // 5. Cập nhật số lượng một cách an toàn
            // Không cần save() nữa vì increment là một lệnh ghi trực tiếp
            await parkingLot.increment('currentspace', { by: 1, transaction: t });

            // Trả về newVehicle để 'result' có thể nhận được
            return newVehicle;
        });

        // Nếu transaction thành công, 'result' sẽ là 'newVehicle'
        return res.status(201).json({
            success: true,
            message: "Thêm xe mới thành công",
            data: {
                nfc_card_id: result.nfc_card_id,
            },
        });

    } catch (err) {
        // Bất kỳ lỗi nào (kể cả lỗi ta tự ném ra) đều sẽ được bắt ở đây
        // Transaction đã được tự động rollback
        console.error('ADD VEHICLE TRANSACTION FAILED:', err);
        return res.status(500).json({ success: false, message: err.message });
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
        const result = await sequelize.transaction(async (t) => {
            const { vehicleId } = req.params;

            // 1. TÌM XE VÀ LẤY LUÔN THÔNG TIN BÃI XE TƯƠNG ỨNG (DÙNG INCLUDE)
            // Thao tác này giúp giảm từ 2 xuống còn 1 lần gọi database
            const vehicle = await Vehicle.findOne({
                where: {
                    id: vehicleId,
                    status: 'PARKED'
                },
                include: {
                    model: ParkingLot, // Báo cho Sequelize biết cần lấy thêm model ParkingLot
                    required: true    // Đảm bảo chỉ trả về xe có bãi xe hợp lệ
                },
                lock: t.LOCK.UPDATE,
                transaction: t
            });

            // Nếu không tìm thấy xe hoặc xe không có bãi xe hợp lệ
            if (!vehicle) {
                throw new Error('Vehicle not found, has already been checked out, or its ParkingLot does not exist.');
            }
            
            // `vehicle.ParkingLot` sẽ chứa thông tin bãi xe do ta đã `include`
            const parkingLot = vehicle.ParkingLot;

            // 2. CẬP NHẬT TRẠNG THÁI VÀ THỜI GIAN CHECKOUT BẰNG HÀM UPDATE()
            // Hàm update() sẽ tự gọi save()
            await vehicle.update({
                status: 'COMPLETED',
                checkOutTime: new Date()
            }, { transaction: t });


            // 3. GIẢM SỐ LƯỢNG XE TRONG BÃI
            // Không cần tìm lại parkingLot nữa vì đã có ở trên
            await parkingLot.decrement('currentspace', { by: 1, transaction: t });

            // Trả về xe đã được cập nhật
            return vehicle;
        });

        // Nếu transaction thành công, 'result' sẽ là xe đã được cập nhật
        return res.status(200).json({
            success: true,
            message: "Checkout vehicle successful",
            data: {
                nfc_card_id: result.nfc_card_id,
                checkOutTime: result.checkOutTime,
                status: result.status
            },
        });

    } catch (err) {
        // Cải thiện cách trả về lỗi, chỉ trả về message
        return res.status(500).json({ success: false, message: err.message });
    }
    };

    //[GET] parkingLot/:id/edit - Hiện trang để edit parkingLot
    editParkingLot = async (req, res) => {
        try {
            const currentParkingLot = await ParkingLot.findByPk(req.params.id);
            if (!currentParkingLot) return res.status(404).json({ success: false, message: "ParkingLot not found" });
            return res.status(200).json({
                success: true, data: currentParkingLot});
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