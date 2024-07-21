const express = require('express');
const router = express.Router();
const authWithUser = require('../middlewares/authWithGetUser');
const roomsModel = require('../model/roomModel');
const userModel = require('../model/userModel');
const resultModel = require('../model/resultsModel')

router.post('/create-room', authWithUser, async (req, res) => {
    try {

        const { room_name, user } = req.body

        let codeExists;
        let code = '';

        do {
            code = Math.random().toString(36).substr(2, 9);
            codeExists = await roomsModel.findOne({ room_code: code })
        } while (codeExists)

        const newRoom = await roomsModel.create({
            room_name,
            room_code: code,
        })


        let getUser = await userModel.findById(user._id)

        getUser.room_id = newRoom._id;

        getUser.save()

        res.status(200).json({ data: newRoom , message : 'Room created successfully' });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Room creation failed", status: 500 })
    }
})

router.post('/join-room', authWithUser, async (req, res) => {
    try {

        const { room_code, user } = req.body

        const roomExist = await roomsModel.findOne({ room_code })

        if (!roomExist) {
            return res.status(500).json({ message: 'Room not found' });
        }

        let getUser = await userModel.findById(user._id)

        getUser.room_id = roomExist._id;

        getUser.save()

        res.status(200).json({ message: 'Successfully joined room' , data : roomExist });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Room creation failed", status: 500 })
    }
})


router.post('/leave-room', authWithUser, async (req, res) => {
    try {

        const { user } = req.body

        let getUser = await userModel.findById(user._id)

        getUser.room_id = null;

        getUser.save()

        res.status(200).json({ message: 'Successfully left room' });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Room creation failed", status: 500 })
    }
})


router.get('/roomWise-rank', authWithUser, async (req, res) => {
    try {
        const { user } = req.body
        const room = await roomsModel.findById(user.room_id)

        if(!room) {
            return res.status(500).json({ message: "Room not found", status: 500 }) 
        }

        const result   = await resultModel.aggregate([
            {
                $lookup : {
                    from : 'users',
                    localField : 'user',
                    foreignField : '_id',
                    as : 'userDetails'
                }
            },
            {
                $unwind : '$userDetails'
            },
            {
                $match :{ 'userDetails.room_id' : user.room_id}
            },
            {
                $project: {
                    _id: 0, 
                    username: '$userDetails.username', 
                    cpm: 1,
                    wpm: 1,
                    accuracy: 1,
                    averageScore: { $avg: ["$cpm", "$wpm", "$accuracy"] }
                }
            },
            {
                $sort: { averageScore: -1 } 
            }
        ])


        res.status(200).json({ message: 'Room Result Fetched' , data : 
            {
                result : result,
                roomName : room.room_name,
                roomCode : room.room_code
            } 
         });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Room result failed", status: 500 })
    }
})

router.get('/userDetails' , authWithUser ,  async (req , res) => {
    const { user } = req.body;
    res.status(200).json({data : user.room_id , message: "user details"})
})



module.exports = router;