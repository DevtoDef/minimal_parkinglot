const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db/index');


//Create User Chema

const Parkinglot = sequelize.define('ParkingLot', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    maxspace: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    currentspace: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    address: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
}, { timestamps: false }
);


module.exports = Parkinglot;