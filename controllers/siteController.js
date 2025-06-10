const User = require('../models/User');
const ParkingLot = require('../models/Parkinglot');
const Vehicle = require('../models/Vehicle');
const bcrypt = require('bcrypt');
const cookie = require('cookie');
const jwt = require('jsonwebtoken');

require('dotenv').config();

class siteController {
    //[GET] /home
    homePage = async (req, res) => {
        return res.status(200).json({ success: true, message: `Welcome ${req.user} - ${req.role}`});
    };
};

module.exports = new siteController;