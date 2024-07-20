const express = require('express');
const router = express.Router();
const authWithUser = require('../middlewares/authWithGetUser');
const resultModel = require('../model/resultsModel')



router.post('/add' , authWithUser , async (req, res) => {
    const {user , cpm ,  wpm , accuracy } = req.body;


    console.log(user , cpm , wpm , accuracy);
    const userAgent = req.headers['user-agent'];

      const allowedBrowsers = [
        'Mozilla', 
        'AppleWebKit', 
        'Gecko',     
    ];

    const blockedAgents = [
        'PostmanRuntime',
        'Go-http-client',
        'curl',
        'Wget',
        'python-requests',
    ];

    const isBrowser = allowedBrowsers.some(browser => userAgent.includes(browser));
    const isBlockedAgent = blockedAgents.some(agent => userAgent.includes(agent));

    console.log(userAgent)

    try{

        if (!userAgent || !isBrowser || isBlockedAgent) {
           return res.status(403).json({error : 'Access forbidden' });
        }

        let result = await  resultModel.findOne({user : user._id});

        if(result){
            result.cpm = cpm;
            result.wpm = wpm;
            result.accuracy = accuracy;
            result.save()
        }else{
            result = new resultModel({
                user : user._id , cpm , wpm , accuracy
            })

            result.save()
        }

        res.status(200).json({ message: 'Result added/updated successfully', result });

    }catch(err){
        console.error(err);
        res.status(500).json({ message: 'Failed to add/update result' });
    }
})


router.get('/rankings', async (req, res) => {
    console.log( req.headers)
    try {
        const rankings = await resultModel.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'userDetails'
                }
            },
            {
                $unwind: '$userDetails'
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
        ]);

        res.status(200).json({data : rankings });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
