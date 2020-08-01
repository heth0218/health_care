const express = require('express');
const router = express.Router();
const Diary = require('../models/Diary');
const User = require('../models/User');
const Doctor = require('../models/Doctor')

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
router.post('/sendData', async (req, res) => {
    try {
        const { startDate, endDate, userId } = req.body

        const doctor = await Doctor.findOne({ name: "Rushank Shah" });
        await Doctor.findByIdAndUpdate(
            doctor._id,
            { $set: { clientData: req.body } },
            { new: true })

        const updatedDoctor = await Doctor.findOne({ name: "Rushank Shah" })
        console.log(updatedDoctor)
        res.status(200).send(updatedDoctor)

    } catch (error) {
        res.status(500).send(error)
    }
})

//RENDER CLIENT DETAIL LIST ON DOCTORS PAGE

router.get('/clientDetail', async (req, res) => {

    try {
        const doctor = await Doctor.findOne({ name: 'Rushank Shah' });

        const { startDate, endDate, userId } = doctor.clientData;
        const diaries = await Diary.find({
            user: userId,
            date: {
                $gte: new Date(startDate),//"2020-07-05"
                $lte: new Date(endDate)//"2020-07-31"
            }
        })
        console.log(diaries);
        res.status(200).send(diaries)
    } catch (error) {
        res.status(500).send(error)
    }
})



module.exports = router
