const jwt = require('jsonwebtoken');
const userModel =  require('../model/userModel')


const authWithUser = async (req , res , next)=>{
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token,  process.env.secret);
    try{

        const user =  await userModel.findOne({username : decoded.username})
        if(user){
          req.body.user = user._id;
          next()
        }else{
          return res.status(404).send({message : "User not found" , status : 404});
        }

    }catch(err){
         console.log(err);
         return res.status(500).send({message : err.message , status : 500});
    }
}

module.exports = authWithUser;