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


let characters = {};
// Almost time to slide a field goblin or two in here.
let mobs = {};

// Probably refactor this later, but can slip 'maps' such as lilmap below into this object for the short-term until I figure out a good way to scale it
// NEXT: Add a new NON-lilMap area to chew on
/*
    What else do we need to consider to construct a good, scalable structure here?
    areas.AREANAME is currently [] of rooms...
    ... but maybe refactor to, say, areas.TUTORIAL = {
        room: [] or {}?,
        type: 'mud' or 'field' (or ???)
    }

    Exciting! Refactoring the entity-bound "location" object to: 
    myGuy.location = {
        atMap: 'mapname',
        GPS: 'absolute coords', // redundant; maybe make GPS/RPS room-dependent, and then have TITLE for open-areas and TYPE 
        RPS: 'reality position reference',
        room: {
            title: `at a lake's edge`,
            size: `??`, // room size, from fairly large (outdoor area) to quite small (indoor room)... I dunno, 1 to 5 with five being biggest? Sure, for now
            indoors: false,
            GPS: 'absolute coords X,Y,Z',
            RPS: 'reality id',
            background: {sky: __, ground: __, foreground: ___},
            weather: ___, //inherit from area?
            timeOfDay: ___,
            type: {city: 3, forest: 1, road: 5},
            typeDetail: ['slums', 'darkwood', 'evil', 'crowded'],
            structures: [],
            entities: [],
            stuff: [],
            exits: {'n': {to: }}
        }
    }

    Boy oh boy defining these manually is going to get silly really fast.
    -- Consider making these class-built and/or making a pop-up builder for Admin/Digger

*/
let areas = {
    'tutorialGeneric': {
        type: 'mud',
        region: 'unknown',
        weather: 'sunny',
        worldGPS: '0,0,0',
        worldRPS: 0,
        localTime: undefined,
        rooms: {
            'tutorialStart': {
                title: 'in an open grassy field',
                size: 5,
                indoors: false,
                GPS: '0,0,0',
                RPS: 0,
                background: {sky: undefined, ground: undefined, foreground: undefined}, // Let's get this working soon; can set up a control variable above
                type: {field: 5}, // I don't even know what this means yet :P... probably comes into play for foraging/hiding/etc.
                typeDetail: ['wheat', 'tallgrass'],
                structures: [], // Can pass this down and iterate to interact in client
                ofInterest: [],
                entities: [],
                loot: [],
                exits: {'w': {to: 'tutorialGeneric/tutorialWestfield', hidden: 0}}
            },
            'tutorialWestfield': {
                title: 'amongst sprawling grasslands',
                size: 5,
                indoors: false,
                GPS: '-10,0,0', // 10 'units' per room? Or maybe this size plus the size of the room(s) adjacent? Hm... anyway, we'll call this 'room center'
                RPS: 0,
                background: {sky: undefined, ground: undefined, foreground: undefined},
                type: {field: 5}, 
                typeDetail: ['wheat', 'tallgrass'],
                structures: [],
                ofInterest: [],
                entities: [],
                loot: [],
                exits: {
                    'e': {to: 'tutorialGeneric/tutorialStart', hidden: 0}, 
                    'n': {to: 'tutorialGeneric/tutorialForestEdge', hidden: 0}}                
            },
            'tutorialForestEdge': {
                title: 'at the edge of a boreal forest',
                size: 5,
                indoors: false,
                GPS: '-10,-10,0', // For now, hoping I don't confuse myself horrendously doing this 'backwards Y' in a matching fashion to CSS
                RPS: 0,
                background: {sky: undefined, ground: undefined, foreground: undefined},
                type: {field: 5}, 
                typeDetail: ['wheat', 'tallgrass'],
                structures: [],
                ofInterest: [],
                entities: [],
                loot: [],
                exits: {
                    'e': {to: 'tutorialGeneric/tutorialStart', hidden: 0}, 
                    'n': {to: 'tutorialGeneric/tutorialForestEdge', hidden: 0}}                    
            }
        }
    },
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

// CONSIDER: now that entities store their location better, can use this 'internal data' to interface with area/map data
function moveAnEntity(entity, direction) {
    // Ok, so now the new hotness if the "entity" we're receiving here is a reference to the full character object, so includes the area they're in.
    const area = areas[entity.location.atMap];

    // Received "DIRECTION" has X, Y, and compassDirection to work with.
    // However, for ROOM NAV, let's set it up so that we don't mess with X,Y ... just look up a Room Reference (tbc), its exits, and yea or nay from there
    // AREA NAV is still unexplored territory (ba dum tsss)

    if (direction.X === 0 && direction.Y === 0) return `You remain where you are`;

    let moveAttemptFeedback = `You move ${direction.compassDirection} `;

    // BELOW: will ultimately refactor to check room's exits, rather than current 'basic grid'

    // Also, it's currently not checking the actual 'axis' the character is in, so will break thoroughly once we're not living in the 3x3 lilMap playground.
    if (entity.location.atX + direction.X < 0 || entity.location.atX + direction.X >= area[0].length || entity.location.atY + direction.Y < 0 || entity.location.atY + direction.Y >= area[0].length) {
        moveAttemptFeedback += `but can't seem to proceed further, so you're still`;
    }
    else {
        entity.location.atX += direction.X;
        entity.location.atY += direction.Y;  
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

// This is now entirely defunct. Will remove in a near-future update, pending going through the notes above to make sure I integrated these ideas properly.
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
    location: {
        atMap: 'lilMap',
        atX: 0,
        atY: 1
    },
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
    // May just scrap this bit; decided to focus on characters over players for this design
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
    if (newChar.password.length < 4) error+= `The password should be at least four characters long. `;
    if (newChar.password !== newChar.password.split(' ').join('')) error += `No spaces allowed in the password. `;
    switch (newChar.identity) {
        case 'Rogue':
        case 'Warrior':
        case 'Tradesman':
        case 'Wizard':
            break;
        default:
            error += `Somehow, we've received an invalid identity of ${newChar.identity}.`;
            break;
    }
    // Setting default stats here... will change to actual stats/skills populating later
    switch (newChar.class) {
        case 'Wayfarer':
        case 'Outlaw':
        case 'Monk':
        case 'Mercenary':
        case 'Crafter':
        case 'Master':
        case 'Sympath':
        case 'Catalyst':
            newChar.stat = {strength: 25, agility: 15, constitution: 20, willpower: 20, intelligence: 20, wisdom: 20, charisma: 20};
            break;
        default:
            error += `API is receiving a non-existent class of ${newChar.class}. Weird!`;
            break;
    }
    
    if (error) res.status(406).json({message: error});

    // HERE: Make sure newChar.name isn't yet taken (scan DB in characters collection)
    Character.findOne({ name: newChar.name })
        .then(searchResult => {
            if (searchResult === null) {
                console.log(`Name available`)
                // HERE: Craft the object that will be the foundation, including salt, hash from password and salt, and stats
                const salt = createSalt();
                const hash = createHash(newChar.password, salt);
                let newCharacter = new Character({
                    name: newChar.name,
                    identity: newChar.identity,
                    class: newChar.class,
                    stat: {...newChar.stat},
                    salt: salt,
                    hash: hash
                });

                // HERE: new Character() save
                // + Craft token
                // + Load into server-space
                // + Res.json back down to client
                newCharacter.save()
                    .then(freshCharacter => {
                        const token = craftAccessToken(freshCharacter.name, freshCharacter._id);
                        const charToLoad = JSON.parse(JSON.stringify(freshCharacter));

                        addCharacterToGame(charToLoad);

                        // Can probably just do character: charToLoad, token: token rather than add an extra 'payload' layer in the future
                        // ... or, at least, remember that we added 'payload' as that extra layer when we parse via the client :P
                        res.status(200).json({type: `success`, message: `Good news everyone! ${charToLoad.name} is saved and ready to play.`, payload: {character: charToLoad, token: token}});
                    })
                    .catch(err => {
                        res.json({type: `failure`, message: `Something went wrong attempting to save the new character: ${err}`});
                    })
            } else {
                // Name is unavailable! Share the sad news. :P
                res.json({type: `failure`, message: `Some brave soul by that name already adventures here. Please choose another.`});
            }
        })
        .catch(err => {
            console.log(err);
            res.json({type: `failure`, message: err});
        });

});


// Idle question for later -- can I specify multiple origins, possibly in an array?
const io = socketIo(server, {
    cors: {
        origin: 'http://localhost:4001',
        methods: ['GET', 'POST']
    }
});


/*
    Brainstorming... so, can I set up 'subscriptions' to, say, the room, the area, etc.?
    A HAX to imitate this behavior could be setting up a STRINGIFIED version of the room/etc.
        ... then have an interval'd "ping" comparing the current state of the room to the current (or timestamps of last known update)
        ... if different, trigger an emit for the user
    
    Ok! Further research shows that socket.io has 'rooms' and 'namespaces,' as well as socket IDs we can emit to specifically.
    NEATO.

    Ah! So we're looking at something like
    io.of('namespaceX').on('connection', (socket) => {}) ... for namespaces.

    Each NAMESPACE is kind of like a sub-server, I guess? It has its own event handlers and 'rooms' and 'middlewares'.

    As you'd expect, you can also do stuff like const usersNamespace = io.of('/users');

    Ok, here we go! Rooms! "An arbitrary channel that sockets can JOIN and LEAVE." JOINING ROOMS:
    io.on('connection', (socket) => {
        socket.join('room1');
        io.to('room1').emit('Hullo there!'); // Would socket.to('room1') also work? Hm.
    })

    Ok! Rooms are SERVER-ONLY -- the client has no idea what room(s) it is a part of, which is... fine?

    Anyway, you do a socket.join('some room'), then io.to('some room').emit() OR io.in('some room').emit() (interchangeabble to/in)

    Also, io.to('room1').to('area3').emit() works, and if the recipient is in BOTH, they'll only get it once. Huzzah! Smart.

    Note you can also do socket.to('some room'), broadcasting from the given socket rather than a namespace. Either-or. Neat.

    Now the FINAL PIECES for INTERACTION!
    -- ensure each room has its own unique identifier (absolute plus relative coords?)
    -- same for area, though just having a unique KEY should be fine in this case, a la 'lilMap'

*/
io.on('connection', (socket) => {
    console.log(`A client has connected to our IO shenanigans.`);
    // HMM: maybe a lastSent object, compared against an interval-based thingy to determine if we need to send down an update to weather/time/etc.
    let myCharacter;
    let area; // Areas should be set up to be automatically unique, so no worries here about setting this one
    let room; // If I end up setting this to the room's GPS coords, or key + GPS, that should ensure uniqueness

    socket.on('login', character => {
        console.log(`${character.name} has joined the game! You are at ${character.location.atMap}: (${character.location.atX},${character.location.atY}).`);
        if (!characters[character.name]) {
            console.log(`Oh! Not logged in yet on the server. Beep boop, fixing.`);
            addCharacterToGame(character);
        }
        myCharacter = character;
    });


    socket.on('movedir', mover => {
        // HERE: use the request from the client to plug into the character and le GO
        const moveChar = characters[mover.who];
        const mapToUse = areas[characters[mover.who].location.atMap];

        // This works for now, but I'd really rather just get the pre-parsed info passed directly from the client and set it above
        const directionObj = parseKeyInput(mover.where) || {compassDirection: 'nowhere', X: 0, Y: 0};
        // console.log(`We're attempting to move ${mover.who}, loaded as the character ${characters[mover.who].name} whose X,Y is (${characters[mover.who].location.atX}, ${characters[mover.who].location.atY}).`);

        let walkResult = `${moveAnEntity(moveChar, directionObj)} ${mapToUse[moveChar.location.atY][moveChar.location.atX].title}.`;
        // let walkResult = `${moveAnEntity(characters[mover.who], directionObj)} ${lilMap[characters[mover.who].location.atY][characters[mover.who].location.atX].title}.`;
        if (characters[mover.who].location.atX === fieldGoblin.atX && characters[mover.who].location.atY === fieldGoblin.atY) walkResult += ` You see a field goblin here!`;

        // Right now passing just a feedback string...
        // But it'd be best to pass the entirety of the ROOM DATA, including what's here, its appearance, time/weather mods, etc.
        // And maybe change the EMIT name/type to 'what I am seeing' context, with a didIMove key for client to 'animate' movement
        // That way the emit can be 'recycled' to be used here AND on 'login' to update the user's 'sight'
        socket.emit('moved_dir', walkResult);
    });

    socket.on('disconnect', () => {
        console.log(`Client has disconnected from our IO shenanigans. Goodbye, ${myCharacter.name}!`);
        removeCharacterFromGame(myCharacter);
    });
});

function createSalt() {
    return crypto.randomBytes(20).toString('hex');
}

function createHash(password, salt) {
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

function addCharacterToGame(character) {
    characters[character.name] = character;
}

function removeCharacterFromGame(character) {
    delete characters[character.name];
}

server.listen(PORT, () => console.log(`With Friends server active on Port ${PORT}.`));


/*

Doot doot. Nothing to report at this time.

*/