const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db/index');

//Create Vehicle Chema

const Vehicle = sequelize.define('Vehicle', {
    id: { // Thêm ID tường minh để dễ quản lý
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nfc_card_id: { // ID duy nhất để ghi vào thẻ NFC
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        unique: true
    },
    license_plate: { // Biển số xe (quan trọng để nhận dạng)
        type: DataTypes.STRING(20),
        allowNull: true // Có thể cho phép null nếu không bắt buộc
    },
    status: { // Trạng thái của xe: 'PARKED' hoặc 'COMPLETED'
        type: DataTypes.STRING(20),
        defaultValue: 'PARKED',
        allowNull: false
    },
    checkInImages: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    checkInTime: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.NOW
    },
    checkOutTime: {
        type: DataTypes.DATE,
    },
}, { timestamps: false });


module.exports = Vehicle;