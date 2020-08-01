const express = require('express');
const router = express.Router();
const Diary = require('../models/Diary');
const User = require('../models/User');


//POST diary daily text scores summary and entity list
router.post('/', async (req, res) => {
    try {
        const { text, user, scores, Summary, ent_list } = req.body
        const diary = new Diary({ text, user, scores, Summary, ent_list })
        await diary.save()
        console.log(diary);
        res.status(201).send(diary);
    } catch (error) {
        res.status(500).send(error)
    }
})

//DATE WISE BRING DATA
router.post('/:id', async (req, res) => {
    try {
        const { startDate, endDate } = req.body

        const diaries = await Diary.find({
            user: req.params.id,
            date: {
                $gte: new Date(`${startDate}`),//"2020-07-05"
                $lte: new Date(`${endDate}`)//"2020-07-31"
            }
        })
        console.log("diaries", diaries)

        res.status(200).send(diaries);

    } catch (error) {
        res.status(500).send(error)
    }
})



module.exports = router
