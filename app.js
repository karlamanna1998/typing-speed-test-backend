const express = require('express');
const app = express();
const mongoose = require('mongoose');
require('dotenv').config('.env');
const bodyParser = require('body-parser')
const authRoutes = require('./routes/auth');
const resultRoutes = require('./routes/result');
const cors = require('cors');

app.use(cors())

// Function to serve all static files
// inside public directory.
app.use(express.static('public'));
app.use('/images', express.static('images'));




app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


app.use('/auth' , authRoutes);
app.use('/result' , resultRoutes);


mongoose.connect(process.env.MONGO_URL).then(() => {
    console.log("mongo DB connected");

    app.listen(5000, () => {
        console.log('Listening to port 5000');
    })
}).catch((err) => {
    console.log("mongo DB error", err)
})






