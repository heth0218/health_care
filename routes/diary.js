const express = require('express');
const router = express.Router();
const Diary = require('../models/Diary');
const User = require('../models/User');
const Doctor = require('../models/Doctor')


//ONCLICK OF OPEN DIARY IN PHONE SEND THE CONTACT
router.get('/:contact', async (req, res) => {
    try {
        const user = await User.findOne({ contact: req.params.contact })

        console.log(user)
        await User.findOneAndUpdate(
            { contact: req.params.contact },
            { $set: { diary: true } },
            { new: true });

        const updatedUser = await User.findOne({ contact: req.params.contact });

        res.status(200).send(updatedUser)

    } catch (error) {
        res.status(500).send(error)
    }
})

//ON THE WEB TO GET THE USER DETAILS
router.get('/hello/diaryUser', async (req, res) => {
    try {
        const user = await User.findOne({ diary: true });
        console.log(user)
        if (!user) {
            return res.status(404).send({ msg: "No user found" })
        }
        res.status(200).send(user);

    } catch (error) {
        res.status(500).send(error)
    }
})

//AFTER THE USER CLOSES THE DIARY
router.post('/close', async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.body.id,
            { $set: { diary: false } },
            { new: true });

        const updatedUser = await User.findById(req.body.id);

        res.status(200).send(updatedUser);

    } catch (error) {
        res.status(500).send(error)
    }

})

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

        const doctor = await Doctor.findOne({ name: "Soham Dave" });
        await Doctor.findByIdAndUpdate(
            doctor._id,
            { $set: { clientData: req.body } },
            { new: true })

        const updatedDoctor = await Doctor.findOne({ name: "Soham Dave" })
        console.log(updatedDoctor)
        res.status(200).send(updatedDoctor)

    } catch (error) {
        res.status(500).send(error)
    }
})

//RENDER CLIENT DETAIL LIST ON DOCTORS PAGE

router.get('/doc/clientDetail', async (req, res) => {

    try {
        const doctor = await Doctor.findOne({ name: "Soham Dave" });

        const { startDate, endDate, userId } = doctor.clientData;
        console.log(doctor.clientData)
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



module.exports = router;
