const mongoose = require('mongoose');
const schema = mongoose.Schema;


const resultsScheema = new schema({
    user : {
        required : true,
        type : schema.ObjectId,
    },
    cpm : {
        required : true,
        type : Number
    },
    accuracy : {
        required : true,
        type : Number
    },
    wpm : {
        required : true,
        type : Number
    },
})

const resultsModel = mongoose.model('results' , resultsScheema);


module.exports = resultsModel;