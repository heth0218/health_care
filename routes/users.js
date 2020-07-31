const express = require('express')
const router = express.Router()
const User = require('../models/User')
const { check, validationResult } = require('express-validator');
const config = require('config');
const jwt = require('jsonwebtoken')
const auth = require('../middleware/auth');
const Report = require('../models/Report');
const Doctor = require('../models/Doctor');
const Prescription = require('../models/Prescription')

//Register a User

router.post('/register', [
    check('name', 'Please enter a name').not().isEmpty(),
    check('email', 'Enter a valid email address').isEmail()
], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).send({
            errors: errors.array()
        })
    }

    const { name, age, email, contact, emergencyContact } = req.body;

    try {
        let user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({
                msg: 'User already exists'
            })
        }

        user = new User({ name, age, email, contact, emergencyContact });

        await user.save();

        const payload = {
            user: {
                id: user.id
            }
        }

        jwt.sign(payload, config.get('jwtSecret'), {
            expiresIn: 360000
        }, (err, token) => {
            if (err) throw err;
            res.json({ token, user })
        })
    }
    catch (error) {
        console.log(error.message);
        res.status(500).send('Server Error')
    }
})

//User adding its own details(eg.reports)

router.post('/userReports', auth, async (req, res) => {
    const { title, file } = req.body;
    const report = {
        title, file
    }
    try {
        report.patient = res.locals.user._id;
        const reports = await Report(report).save();
        console.log(reports)
        res.status(200).send(reports)
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Server Error')
    }
})


//Authenticating the user after the QR SCAN
router.post('/qrauth', async (req, res) => {

    try {
        const { doctor, user } = req.body;
        const users = await User.findById(user);
        if (!users) {
            res.status(404).send({
                msg: 'User not found in the db...'
            })
        }
        await User.findByIdAndUpdate(
            user,
            { $set: { currentDoctor: doctor } },
            { new: true })
        const updatedUser = await User.findById(user)
        const doctors = await Doctor.findById(doctor);
        if (!doctors) {
            res.status(404).send({
                msg: 'Doctor not found in the db... '
            })
        }
        console.log(updatedUser);
        res.status(200).send({ updatedUser })

    } catch (error) {

        console.log(error.message);
        res.status(500).send('Server Error')
    }
})

//Login the user
router.post('/login', [
    check('email', 'Please enter a valid email id').isEmail()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send({
            errors: errors.array()
        })
    }
    const { email } = req.body;

    try {
        let user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                msg: 'User npot found'
            })
        }
        const payload = {
            user: {
                id: user.id
            }
        }

        jwt.sign(payload, config.get('jwtSecret'), {
            expiresIn: 360000
        }, (err, token) => {
            if (err) throw err;
            res.json({ token, user })
        })

    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            msg: 'Server Error'
        })

    }
})


//For User to view his/her own detail

router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).send({
                msg: 'User not found in the db ....'
            })
        }
        const userReports = await Report.find({ patient: req.params.id });

        const userPrescriptions = await Prescription.find({ patient: req.params.id }).populate('doctor');

        if (!userReports && !userPrescriptions) {
            return res.status(400).send({
                msg: 'No previous reports and prescriptions available'
            })
        }

        res.status(201).send({ userPrescriptions, userReports });

    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            msg: 'Server Error'
        })
    }
})


module.exports = router;