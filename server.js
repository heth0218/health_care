const express = require('express');
const connectDB = require('./config/db');

const app = express();

connectDB();

app.use(express.json({ extended: false }));

const PORT = process.env.PORT || 5000;

app.use('/api/users', require('./routes/users'));
app.use('/api/doctor', require('./routes/doctor'));
app.use('/api/report', require('./routes/report'));
app.use('/api/diary', require('./routes/diary'));


app.listen(PORT, () => {
    console.log(`Listening to post ${PORT}`)
})