// Import the modules we need
var express = require('express')
var ejs = require('ejs')
var bodyParser = require('body-parser')
const mysql = require('mysql');
const cookieParser = require('cookie-parser');

// Create the express application object
const app = express()
const port = 8000
app.use(express.urlencoded({ extended: true }));
app.use(express .json());
app.use(cookieParser());

// Set up css
app.use(express.static(__dirname + '/public'));

// Define the database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'myforumappuser',
    password: 'app2027',
    database: 'moddingforum'
});

// Connect to the database
db.connect((err) => {
        if (err) {
            throw err;
        }
        console.log('Connected to database');
    });
    global.db = db


// Set the directory where Express will pick up HTML files
// _dirname will get the current directory
app.set('views', __dirname + '/views');

// Tell Express that we want to use EJS as the templating engine
app.set('view engine', 'ejs');

// Tells Express how we should process html files
// We want to use EJS's rendering engine
app.engine('html', ejs.renderFile);

// Requires the main.js file inside the routes folder passing in the Express app
require('./routes/main')(app);

// Start the web app listening
app.listen(port, () => console.log(`Example app listening on port ${port}`))