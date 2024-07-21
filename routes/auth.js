const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const userModel = require('../model/userModel');
const jwt = require('jsonwebtoken')



router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const saltRounds = 10;
    try {

        const userFound = await userModel.findOne({ username: username});

        if(userFound){
          return res.status(500).send({message : "User already registered" , status : 500})
        }

        // Generate a salt
        const salt = await bcrypt.genSalt(saltRounds);

        // Hash password
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await userModel.create({ username: username, password: hashedPassword});

        return res.status(200).send({message : "User registered" , status : 200})

    } catch (err) {
        console.log(err);
        return res.status(500).send({message : err.message , status : 500})
    }
})



router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {

        const userFound = await userModel.findOne({ username: username});

        console.log(userFound);

        if(!userFound){
            return res.status(400).json({ message: "User not registered", status: 400 });
        }

        const isMatch = await bcrypt.compare(password, userFound.password);

        if(!isMatch){
          return res.status(500).json({message : "Invalid password" , status : 500})
        }


        const token = jwt.sign({
            username : userFound.username,
            password : userFound.password
        } , process.env.secret)

        return res.status(200).json({message : "User logged in" , status : 200 , token : token})

    } catch (err) {
        console.log(err);
        return res.status(500).json({message : "Login Failed" , status : 500 })
    }
})




module.exports = router;