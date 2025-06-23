const User = require('../models/User');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const e = require('express');
const jwt = require('jsonwebtoken');

require('dotenv').config();

class authController {
    //[POST] /auth/signup
    registerUser = async (req, res) => {
        const email = req.body.email;
        const username = req.body.username;
        const pwd = req.body.password;
        if (!username || !pwd || !email) return res.status(400).json({ success: false, message: 'Username và password là bắt buộc' });
        const duplicate = await User.findOne({ where: {  [Op.or]: [{ username: username }, { email: email }] }});
        if (duplicate) return res.status(409).json({ success: false, message: 'Người dùng đã tồn tại' });
        // Lưu vào database
        try {
            //encrypted password
            const hashPwd = await bcrypt.hash(pwd, 10);
            //store user
            const newUser = await User.create({
                "email": email,
                "username": username,
                "password": hashPwd
            });
            res.status(201).json({ 
                success: true,
                message: `User ${username} created successfully!`,
                data: {
                    id: newUser.id,
                    username: newUser.username,
                    role: newUser.role,
                }
             })
        } catch (err) {
            res.status(500).json({ success: false, 'message': err.message })
        }
    };



    //[POST] /auth/login
    loginUser = async (req, res) => {
        const username = req.body.username;
        const pwd = req.body.password;
        if (!username || !pwd) return res.status(400).json({ success: false, message: 'Username và password là bắt buộc' });
        const foundUser = await User.findOne({ where: { username: username }});
        if (!foundUser) return res.status(401).json({ success: false, message: 'User not found' });
        const match = await bcrypt.compare(pwd, foundUser.password)
        if (match) {
            const accessToken = jwt.sign(
                { "UserInfo": {
                    "username": foundUser.username,
                    "role": foundUser.role
                    }
                },
                    process.env.ACCESS_TOKEN_SECRET,
                    {expiresIn: '1d'}
            );
            return res.status(200).json({
                sucess: true,
                message: 'Đăng nhập thành công',
                data : {
                    id: foundUser.id,
                    username: foundUser.username,
                    role: foundUser.role,
                    accessToken: accessToken
                },
            })    
        } else {
            return res.status(401).json({ success: false, message: 'Sai mật khẩu' })
        }
    };

    //[GET] /auth
    getUserData = async (req, res) => {
        try {
        // Lấy thông tin người dùng từ token
            const username = req.user;
            console.log(username);
            if (!username) return res.status(401).json({ success: false, message: 'Unauthorized' });
            const userInfo = await User.findOne({ where: { username: username }});
            if (!userInfo) return res.status(404).json({ success: false, message: 'User not found' });
            // Trả về thông tin người dùng
            return res.status(200).json({
                success: true,
                data: {
                    id: userInfo.id,
                    email: userInfo.email,
                    username: userInfo.username,
                    role: userInfo.role
                }
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        } 
    };

    logoutUser = async (req, res) => {
        logoutUser = (req, res) => {
        // Vì việc logout chủ yếu do client (Flutter) xóa token,
        // endpoint này chỉ cần trả về một thông báo thành công.
        // Nó cho client biết rằng "server đã ghi nhận yêu cầu logout".
        // Trong các hệ thống phức tạp hơn, đây có thể là nơi để đưa token vào "danh sách đen" (blacklist).
        // Tuy nhiên, với dự án của bạn, việc này là không cần thiết.
        
        return res.status(200).json({ success: true, message: 'Logged out successfully.' });
        }
    }
};

module.exports = new authController;