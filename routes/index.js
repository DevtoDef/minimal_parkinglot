const authRouter = require('./auth');
const siteRouter = require('./site');
const parkingLotRouter = require('./parkingLot');
const userRouter = require('./user');


const verifyJWT = require('../middleware/verifyJWT');
const verifyRole = require('../middleware/verifyRole');

function route(app) {
    app.use('/auth', authRouter),

    app.use(verifyJWT),

    app.use('/home', siteRouter),

    app.use('/parkingLot', parkingLotRouter),

    app.use('/user', verifyRole("admin"), userRouter)
    
};

module.exports = route;