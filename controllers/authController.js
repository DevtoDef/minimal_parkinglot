const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

require('dotenv').config();

class authController {
    //[POST] /auth/register
    registerUser = async (req, res) => {
        const username = req.body.username;
        const pwd = req.body.password;
        if (!username || !pwd) return res.status(400).json({ success: false, message: 'Username và password là bắt buộc' });
        const duplicate = await User.findOne({ where: { username: username }});
        if (duplicate) return res.status(409).json({ success: false, message: 'Người dùng đã tồn tại' });
        // Lưu vào database
        try {
            //encrypted password
            const hashPwd = await bcrypt.hash(pwd, 10);
            //store user
            const newUser = User.create({
                "username": username,
                "password": hashPwd
            });
            console.log(newUser)
            res.status(201).json({ 
                success: true,
                message: `User ${username} created successfully!`
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
                    accessToken: accessToken
                },
            })    
        } else {
            return res.status(401).json({ success: false, message: 'Sai mật khẩu' })
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