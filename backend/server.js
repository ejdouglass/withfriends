const express = require('express');
const app = express();
const http = require('http').createServer(app);
const mongoose = require('mongoose');
// const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const lilMap = [
    ['nw field', 'n field', 'ne field'],
    ['w field', 'middlefield', 'e field'],
    ['sw field', 's field', 'se field']
];

const dummyPlayer = {
    atX: 1,
    atY: 1
};


app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// app.use(bodyParser.json());
app.use(express.json());
// app.use(bodyParser.urlencoded({extended: false}));
app.use(express.urlencoded({extended: false}));

const PORT = process.env.PORT || 5000;


// Testing it the non-socket way:
app.post('/moveme', (req, res, next) => {
    let { moveDir } = req.body || 'through spacetime';

    // HERE: Change dummyPlayer data based on the string received as a movement direction
    let directionMoved = '';
    switch (moveDir) {
        case 'd': {
            directionMoved = 'east';
        }
    }

    res.json({ok: true, message: `You just moved ${directionMoved} and arrived at ${lilMap[dummyPlayer.atY][dummyPlayer.atX]}.`});
})


http.listen(PORT, () => console.log(`With Friends server active on Port ${PORT}.`));


/*

And a-here we go. Let's try out some SOCKET ROCKET POWER!


*/