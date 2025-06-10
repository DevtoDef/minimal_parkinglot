const express = require('express');
const app = express();
const PORT = 5000 || process.env.PORT;
const route = require('./routes/index');
const cookieParser = require('cookie-parser');

//connect to DB
const sequelize = require('./config/db/index');

//Create Relation
const CreateRelation = require('./models/Ralation');
// Middleware để parse JSON
app.use(express.json());
// Middleware để parse cookie
app.use(cookieParser());


//Middleware to parse form data
app.use(express.urlencoded({ extended: true }));

//Init Route
route(app);

app.get('/', (req, res) => res.status(200).json({'message': 'Hello Buddy'}));

app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));