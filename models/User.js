const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db/index');

//Create User Chema

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    username: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    role: {
        type: DataTypes.STRING,
        defaultValue: 'user'
    },
});


module.exports = User;