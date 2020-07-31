const express = require('express');
const router = express.Router();
const Diary = require('../models/Diary');
const User = require('../models/User');

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

module.exports = router