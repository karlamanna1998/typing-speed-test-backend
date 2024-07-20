const mongoose = require('mongoose');

const roomsShema = new mongoose.Schema({
    room_name : {
        type : 'string',
        required : true,
    },
    room_code : {
        type : 'string',
        required : true,
        unique : true
    }
})

const roomsModel = mongoose.model('rooms' , roomsShema)

module.exports = roomsModel