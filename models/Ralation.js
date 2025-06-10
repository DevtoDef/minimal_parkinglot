const User = require('./User');
const ParkingLot = require('./Parkinglot');
const Vehicle = require('./Vehicle');
const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db/index');

CreateRelation = async () => {
    try {
        const UserParkingLot = sequelize.define('UserParkingLot', {}, { timestamps: false });
        
        //Create Relation Many to Many User-Parkinglot
        User.belongsToMany(ParkingLot, { through: UserParkingLot });
        ParkingLot.belongsToMany(User, { through: UserParkingLot });
        
        //Create One to Many Parkinglot - Vehicle
        ParkingLot.hasMany(Vehicle, { foreignKey: 'parkingLotId', onDelete: 'CASCADE' });
        Vehicle.belongsTo(ParkingLot, { foreignKey: 'parkingLotId' });

        //Create One to Many User - Vehicle
        User.hasMany(Vehicle, { foreignKey: 'userId', onDelete: 'CASCADE' });
        Vehicle.belongsTo(User, { foreignKey: 'userId' });
        
        //Async với database
        await sequelize.sync(); 
    } catch (err) {
        console.log('Error when creating relationships', err)
    }
}

CreateRelation();

module.exports = CreateRelation;