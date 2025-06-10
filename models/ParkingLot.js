const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db/index');


//Create User Chema

const Parkinglot = sequelize.define('ParkingLot', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    // capacity: {
    //     type: DataTypes.INTEGER,
    //     allowNull: false
    // },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
}, { timestamps: false }
);


module.exports = Parkinglot;