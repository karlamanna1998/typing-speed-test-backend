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

        res.status(200).json({ data: newRoom });
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

        res.status(200).json({ message: 'Successfully joined room' });
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

        console.log(user)

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
                    _id: 0, // Exclude the _id field
                    username: '$userDetails.username', // Assuming the user schema has a 'username' field
                    cpm: 1,
                    wpm: 1,
                    accuracy: 1,
                    averageScore: { $avg: ["$cpm", "$wpm", "$accuracy"] }
                }
            },
            {
                $sort: { averageScore: -1 } // Sort by average score in descending order
            }
        ])


        res.status(200).json({ message: 'Successfully left room' , data : result });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Room creation failed", status: 500 })
    }
})



module.exports = router;