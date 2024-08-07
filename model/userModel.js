const mongoose = require('mongoose');


const userScheema = new mongoose.Schema({
    username : {
        required : true,
        type : String,
        unique : true
    },
    password : {
        required : true,
        type : String
    },
    room_id : {
        type : mongoose.Schema.ObjectId
    }
})

const userModel = mongoose.model('users' , userScheema);


module.exports = userModel;