const express = require('express');
const app = express();
const server = require('http').createServer(app);
const socketIo = require('socket.io');
const mongoose = require('mongoose');
// const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

function moveAnEntity(entity, direction) {
    // For now very griddy; might have more omnidirectionality later
    // Probably will need to reference entity's current map/location at some point, as well

    // Received "DIRECTION" has X, Y, and compasssDirection to work with, neato
    if (direction.X === 0 && direction.Y === 0) return `You remain where you are at`;

    let moveAttemptFeedback = `You walk ${direction.compassDirection} `;

    if (entity.atX + direction.X < 0 || entity.atX + direction.X >= lilMap[0].length || entity.atY + direction.Y < 0 || entity.atY + direction.Y >= lilMap[0].length) {
        moveAttemptFeedback += `but can't seem to proceed further, so you're still at`;
    }
    else {
        entity.atX += direction.X;
        entity.atY += direction.Y;  
        moveAttemptFeedback += `and arrive at`;
    }
    return moveAttemptFeedback;

    // FIX: Don't return before checking Y, silly :P
    // ADD: "Bonk!" You can't go there (handling).
    // THEN: This will do the moving and return a string describing that movement.
}

function parseKeyInput(key) {
    switch (key) {
        case 'w': {
            return {compassDirection: 'north', X: 0, Y: -1};
        }
        case 'd': {
            return {compassDirection: 'east', X: 1, Y: 0};
        }
        case 'x': {
            return {compassDirection: 'south', X: 0, Y: 1};
        }
        case 'a': {
            return {compassDirection: 'west', X: -1, Y: 0};
        }
    }
}

const lilMap = [
    ['the northwest fields', 'the fluffy north field', 'the frigid northeastern field'],
    ['the rolling western field', 'the rather central middlefield', 'the dingy eastern field'],
    ['the flooded southwestern field', 'the marginal southern field', 'the crimson southeastern field']
];

const dummyPlayer = {
    atX: 1,
    atY: 1,
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
        const directionObj = parseKeyInput(dirMove) || {compassDirection: 'nowhere', X: 0, Y: 0};
        let walkResult = `${moveAnEntity(dummyPlayer, directionObj)} ${lilMap[dummyPlayer.atY][dummyPlayer.atX]}.`;
        if (dummyPlayer.atX === fieldGoblin.atX && dummyPlayer.atY === fieldGoblin.atY) walkResult += ` You see a field goblin here!`;

        socket.emit('moved_dir', walkResult);
    })

    socket.on('disconnect', () => {
        console.log(`Client has disconnected from our IO shenanigans.`);
    })
});

server.listen(PORT, () => console.log(`With Friends server active on Port ${PORT}.`));


/*

And a-here we go. Let's try out some SOCKET ROCKET POWER!

Ok, neat. Well, currently there's only ONE back-end 'player,' but I'm starting to get to the point where I can see adding MOAR. MWAHA.

And then after that, interacting with stuff back here! That'd be rad.


*/