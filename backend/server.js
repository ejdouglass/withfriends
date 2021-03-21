const express = require('express');
const app = express();
const server = require('http').createServer(app);
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const Character = require('./models/Character');
// const bodyParser = require('body-parser');
// const cors = require('cors');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
require('dotenv').config();


const connectionParams = {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
};

mongoose.connect(process.env.DB_HOST, connectionParams)
    .then(() => console.log(`Successfully connected to With Friends database. That'll come in handy!`))
    .catch(err => console.log(`Error connecting to With Friends database: ${err}`));

// Hardcoded nonsense for now, pending an actual login process. :P
// This will eventually hold ALL the stuff associated with the character.
// The player.'Dekar' will be player[username], so won't automatically be the same as player[username].charName. 
let player = {
    'Dekar': {
        charName: 'Dekar',
        atMap: 'lilMap',
        atX: 1,
        atY: 1
    }
};

// All the characters! The 'source of truth' for each character. The client mimics these 1-to-1, ideally.
let characters = {};
let mobs = {};

// Probably refactor this later, but can slip 'maps' such as lilmap below into this object for the short-term until I figure out a good way to scale it
let areas = {
    'lilMap': [
        [
            {
                title: 'at the edge of a forest',
                description: `A totally nondescript forest. There are quite a few trees and plants all around.`,
                entities: [],
                stuff: [],
                exits: {}
            }, 
            {
                title: 'within a fluffy northern wheatfield',
                description: `It's fluffy and full of wheat! Rolling and idyllic.`,
                entities: [],
                stuff: [],
                exits: {}
            },
            {
                title: `amidst rocky rubble`,
                description: `Lots of stone here, including several areas that may have once been buildings, walls, and towers.`,
                entities: [],
                stuff: [],
                exits: {}
            }
        ],
        [
            {
                title: 'some rolling grassy fields',
                description: `A totally nondescript forest.`,
                entities: [],
                stuff: [],
                exits: {}
            }, 
            {
                title: 'within a sprawling central middlefield',
                description: `A totally nondescript forest.`,
                entities: [],
                stuff: [],
                exits: {}
            }, 
            {
                title: 'outside the walls of an imposing town gate',
                description: `A totally nondescript forest.`,
                entities: [],
                stuff: [],
                exits: {}
            }, 
        ],
        [
            {
                title: 'above a deep ravine',
                description: `A totally nondescript forest.`,
                entities: [],
                stuff: [],
                exits: {}
            }, 
            {
                title: 'at the edge of a lake',
                description: `A totally nondescript forest.`,
                entities: [],
                stuff: [],
                exits: {}
            }, 
            {
                title: 'where lakefront meets town wall',
                description: `A totally nondescript forest.`,
                entities: [],
                stuff: [],
                exits: {}
            }, 
        ]
    ]
};

function moveAnEntity(entity, direction) {
    // For now very griddy; might have more omnidirectionality later
    // Probably will need to reference entity's current map/location at some point, as well... attach to the entity in question?

    // Watch the movement happen in the console. Works fine for player. Will test later for mobs.
    // console.log(`Attempting to move ${entity}, who is at (${entity.atX},${entity.atY}) by (${direction.X},${direction.Y})`);

    // Received "DIRECTION" has X, Y, and compasssDirection to work with, neato
    if (direction.X === 0 && direction.Y === 0) return `You remain where you are`;

    let moveAttemptFeedback = `You walk ${direction.compassDirection} `;

    if (entity.atX + direction.X < 0 || entity.atX + direction.X >= lilMap[0].length || entity.atY + direction.Y < 0 || entity.atY + direction.Y >= lilMap[0].length) {
        moveAttemptFeedback += `but can't seem to proceed further, so you're still`;
    }
    else {
        entity.atX += direction.X;
        entity.atY += direction.Y;  
        moveAttemptFeedback += `and arrive`;
    }
    return moveAttemptFeedback;
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

// One of the next steps is to slip this bad boy into the 'areas' object, somewhere above.
// Adding an 'absolute' and/or 'relative' coords to each 'room' makes sense.
// Also, attributes such as those the front-end needs to display proper images would be fantastic. Lake, forest, plains, etc.
// ... can even have multiple 'layers' or fewer. We have some support for sky and ground, at minimum, right now.
// How to handle 'exits'? Hmmmm...
// Right now we're leaning into the 'multidimensional grid' of the nested arrays, which is 'easy' in a way.
// The 'harder' way long-term is to just have an array of objects with internally defined relationships with surrounding areas.
// Either way, exits need to know what is connected in each 'direction' that you can go, and possibly extra stuff:
//      skill(s) required to traverse, 'room' size, exit size/type, any considerations such as being blocked by mob(s), etc.
const lilMap = [
    [
        {
            title: 'at the edge of a forest',
            description: `A totally nondescript forest. There are quite a few trees and plants all around.`,
            entities: [],
            stuff: [],
            exits: {}
        }, 
        {
            title: 'within a fluffy northern wheatfield',
            description: `It's fluffy and full of wheat! Rolling and idyllic.`,
            entities: [],
            stuff: [],
            exits: {}
        },
        {
            title: `amidst rocky rubble`,
            description: `Lots of stone here, including several areas that may have once been buildings, walls, and towers.`,
            entities: [],
            stuff: [],
            exits: {}
        }
    ],
    [
        {
            title: 'some rolling grassy fields',
            description: `A totally nondescript forest.`,
            entities: [],
            stuff: [],
            exits: {}
        }, 
        {
            title: 'within a sprawling central middlefield',
            description: `A totally nondescript forest.`,
            entities: [],
            stuff: [],
            exits: {}
        }, 
        {
            title: 'outside the walls of an imposing town gate',
            description: `A totally nondescript forest.`,
            entities: [],
            stuff: [],
            exits: {}
        }, 
    ],
    [
        {
            title: 'above a deep ravine',
            description: `A totally nondescript forest.`,
            entities: [],
            stuff: [],
            exits: {}
        }, 
        {
            title: 'at the edge of a lake',
            description: `A totally nondescript forest.`,
            entities: [],
            stuff: [],
            exits: {}
        }, 
        {
            title: 'where lakefront meets town wall',
            description: `A totally nondescript forest.`,
            entities: [],
            stuff: [],
            exits: {}
        }, 
    ]
];

// The PROTOTYPE MOB. Let's try out a bunch of actions, behaviors, stats, etc. here and see what makes sense to scale up!
// Ok! Now there are a bunch of messages that can be 'displayed.' The question becomes... how to hook these into the 'room' so a user sees them?
// Later on, can add 'message,' 'obscurity,' 'result,' 'skillcheck,' etc. to different idle and active actions
const fieldGoblin = {
    atMap: 'lilMap',
    atX: 0,
    atY: 1,
    idle: [
        `A field goblin wanders around, mumbling and snickering to itself.`, 
        `A field goblin shudders and moans slightly.`, 
        `A field goblin searches the area, seemingly looking for nothing in particular.`,
        `A field goblin contemplates its existence.`,
        `A field goblin begins to advance towards you menacingly! ... just kidding, it can't do that yet. It snickers to itself instead.`
    ],
    state: 'idle'
};
// ... can also add stuff like 'exitMap: t/f,' 'flying: t/f,' 'activityLevel,' (which can be per state), 'statsPerActivityLevel' (or mods)
// So, they can be sleeping, hanging out, hunting, playing, foraging, vibing, seeking, what have you
// This more 'sophisticated' behavior could carry over well to more fleshed-out OOC NPC's! :P Always scripting!


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

app.post('/player/login', (req, res, next) => {
    // !    
});

app.post('/character/login', (req, res, next) => {
    // Receive a CHARTOKEN, check it, and if VALID, do two important things:
    // 1) 'Load' the character live into this server space
    // 2) Pass back that character to the client, which must use this package to open a socket with the server

    res.status(200).json({message: `API endpoint is here. Hi!`});
});

app.post('/character/create', (req, res, next) => {
    const { newChar } = req.body;

    // THIS: Take the request from the user to create a new character, validate it (inputs okay, character name not yet taken), create, and pass back
    // Don't forget to create a charToken to pass back as well! This will be saved with the character on the client to allow further logging in.
    // Like LOGIN for character above, we have to 'load' the character live into the server space, and make sure what we pass back can open a socket here

    // HERE: Validate inputs for character are okay (name okay, etc.) ... we'll mirror the front-end checks, for now, and add more later (like no symbols :P)
    let error = '';
    if (newChar.name.length < 5) error += `Character name is too short. `;
    if (newChar.name.length > 12) error += `Character name is too long. `;
    if (newChar.name !== newChar.name.split(' ').join('')) error += `No spaces in the character name, please. `;
    
    if (error) res.status(406).json({message: error});

    // HERE: Make sure newChar.name isn't yet taken (scan DB in characters collection)
    Character.findOne({ name: newChar.name })
        .then(searchResult => {
            if (searchResult === null) {
                console.log(`Name available`)
                // Congrats! Name is available.
                res.json({type: `success`, message: `That name can be used! Good show, old chap.`});
            } else {
                // Name is unavailable! Share the sad news. :P
                res.json({type: `failure`, message: `Some brave soul by that name already adventures here. Please choose another.`});
            }
        })
        .catch(err => {
            console.log(err);
            res.json({type: `failure`, message: err});
        });

    // HERE: Create a fully-operational new character object that both backend and frontend can make sense of mutually
    //  This includes: A) creating the object, B) saving it to DB, and C) assuming success move along below

    // HERE: Call a function to 'load' character into server space

    // HERE: Call a function to create an object for frontend to load character from, plus charToken, probably {char: {charObj}, charToken: '...'}

    // HERE: res.json 

    // res.status(200).json({message: `So you want to create a new character named ${newChar.name}? Interesting.`});

});


// Idle question for later -- can I specify multiple origins, possibly in an array?
const io = socketIo(server, {
    cors: {
        origin: 'http://localhost:4001',
        methods: ['GET', 'POST']
    }
});

io.on('connection', (socket) => {
    console.log(`A client has connected to our IO shenanigans.`);

    socket.on('login', character => {
        console.log(`${character.name} has joined the game!`);
    });

    socket.on('movedir', mover => {
        const directionObj = parseKeyInput(mover.where) || {compassDirection: 'nowhere', X: 0, Y: 0};
        let walkResult = `${moveAnEntity(player[mover.who], directionObj)} ${lilMap[player[mover.who].atY][player[mover.who].atX].title}.`;
        if (player[mover.who].atX === fieldGoblin.atX && player[mover.who].atY === fieldGoblin.atY) walkResult += ` You see a field goblin here!`;

        socket.emit('moved_dir', walkResult);
    });

    socket.on('disconnect', () => {
        console.log(`Client has disconnected from our IO shenanigans.`);
    });
});

function createSalt() {
    return crypto.randomBytes(20).toString('hex');
}

function hash(password, salt) {
    password = password.length && typeof password === 'string' ? password : undefined;

    if (password && salt) {
        let hash = crypto
            .createHmac('sha512', salt)
            .update(password)
            .digest('hex');

        return hash;
    } else {
        return null;
    }
}

function craftAccessToken(name, id) {
    return jwt.sign({ name: name, id: id }, process.env.SECRET, { expiresIn: '4h' });
}

server.listen(PORT, () => console.log(`With Friends server active on Port ${PORT}.`));


/*

And a-here we go. Let's try out some SOCKET ROCKET POWER!

Ok, neat. Well, currently there's only ONE back-end 'player,' but I'm starting to get to the point where I can see adding MOAR. MWAHA.

And then after that, interacting with stuff back here! That'd be rad.


*/