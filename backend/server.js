const express = require('express');
const app = express();
const server = require('http').createServer(app);
const socketIo = require('socket.io');
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

const fieldGoblin = {
    atX: 0,
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


// app.post('/moveme', (req, res, next) => {
//     let { moveDir } = req.body || 'through spacetime';

//     // HERE: Change dummyPlayer data based on the string received as a movement direction
//     let directionMoved = '';
//     switch (moveDir) {
//         case 'd': {
//             directionMoved = 'east';
//         }
//     }

//     let movementResult = `You just moved ${directionMoved} and arrived at ${lilMap[dummyPlayer.atY][dummyPlayer.atX]}. `;
//     if (dummyPlayer.atX === fieldGoblin.atX && dummyPlayer.atY === fieldGoblin.atY) movementResult += `A field goblin is here!`;

//     res.json({ok: true, message: movementResult});
// });


const io = socketIo(server, {
    cors: {
        origin: 'http://localhost:4001',
        methods: ['GET', 'POST']
    }
});

io.on('connection', (socket) => {
    console.log(`A client has connected to our IO shenanigans.`);

    socket.on('movedir', dirMove => {
        console.log(`Client wishes to move in a direction indicated by the ${dirMove} key.`);
        // HERE: Send response back down to webclient?
        socket.emit('moved_dir', `Woogly boogly`);
    })

    socket.on('disconnect', () => {
        console.log(`Client has disconnected from our IO shenanigans.`);
    })
});

server.listen(PORT, () => console.log(`With Friends server active on Port ${PORT}.`));


/*

And a-here we go. Let's try out some SOCKET ROCKET POWER!


*/