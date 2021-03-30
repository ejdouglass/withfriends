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
const { resolveSoa } = require('dns');
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
                    's': {to: 'tutorialGeneric/tutorialWestfield', hidden: 0}}                    
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

// Spitballing on 'final' areas prototype for beta
/*
    Ok! We've gone off the rails. Getting back ON the rails. Yay! This is the FIRST game. Lots of cool ideas, but let's KISS it kindly for now.

    -- Everything is now on a universal GRID. There are no 'travel maps.' Everything is MUD-y.
    -- Graphics will be very limited. Static icons for quick visible reference, and anything beyond that is a later project or much later version.
        -> So, backpack is now just a list of items by name with a simple (easily made pixel) icon. AC-like.
        -> Baddies can just have a Zelda II esque "monster level" icon, maybe with a different color/size at most.
    -- Things that are 'in the room' like players can just be a little 'standing guy' icon with a number badge on it. Click/key to examine more closely,
        and maybe they pop up at the top of the screen upon entering the room. Same with mobbies.
    -- Since everything is aggresively ROOM-BASED, we can now just have The World just be a collection of roomKeys. Great!
        -> roomKey: 'X,Y,Z' coords. Easy peasy.
        -> oh hm. Ok, sub-rooms, such as a BLACKSMITH in the TOWN SQUARE. How do we handle?
        -> Not a problem! Still a room. Just exists outside (well, inside of) the 'multiples of 10' or whatever 'base grid.' 
        -> That way they can be 'appended' into a pre-existing room on the fly without too much yikes
        
    OK! Room size 25 means we extend 12 away from center inclusively. Neat. So 12 is max size under this model.

    So! These new rooms! How do they look? What's in them?

    Let's also think about how to handle 'spawns.' I like the idea of having spawns increase/decrease based on who is where, up to a soft and then hard cap.
        -- spawn logistics! ... requires some 'Zone awareness' from the app, so build to allow for good zone awareness.
        -- can also consider having a 'Zone reference' array (can be built programmatically, it'd be a PITA to manually do it)
        -- server start/restart could create this zoneRef array after loading up all the rooms

*/
let zaWarudo = {
    0: {
        '500,500,0': {
            zone: 'Town of Rivercrossing',
            room: 'Center of Town',
            indoors: 0,
            size: 12,
            structures: [
                {
                    name: 'Rivercrossing Metalworks',
                    type: 'shop/blacksmith',
                    roomImage: undefined,
                    interiorImage: undefined,
                    description: ``,
                    inventory: []
                }
            ],
            players: [],
            npcs: [],
            mobs: [],
            loot: [],
            background: {sky: undefined, ground: undefined, foreground: undefined},
            fishing: undefined,
            foraging: {},
            exits: {
                'e': {to: '525,500,0', traversal: 'walk/0', hidden: 0}
            }
        },
        '525,500,0': {
            zone: 'Town of Rivercrossing',
            room: 'East Riverside Road',
            indoors: 0,
            size: 12,
            structures: [],
            players: [],
            npcs: [],
            mobs: [],
            loot: [],
            background: {sky: undefined, ground: undefined, foreground: undefined},
            fishing: undefined,
            foraging: {},
            exits: {
                'w': {to: '500,500,0', traversal: 'walk/0', hidden: 0}
            }            
        }
    }
}

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

function moveEntity(entity, direction) {
    // 'Final' alpha concept of room-only. Keeping in RPS for now, might still be handy for instancing.

    if (entity.location.room.exits[direction]) {
        let newRoomGPS = entity.location.room.exits[direction].to;
        entity.location.GPS = newRoomGPS;
        entity.location.room = zaWarudo[entity.location.RPS][newRoomGPS];

        return `Off you go!`;
    }
    return `BONK. Can't go that way! Ouch!`;

    // No wrong-warping allowed -- since we're only referring to the backend-attached entity.location.room.exits, we should be resistant to HAX
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

function keyToDirection(key) {
    switch (key) {
        case 'w': {
            return 'n';
        }
        case 'e': {
            return 'ne';
        }
        case 'd': {
            return 'e';
        }
        case 'c': {
            return 'se';
        }
        case 's': {
            return 's';
        }
        case 'z': {
            return 'sw';
        }
        case 'a': {
            return 'w';
        }
        case 'q': {
            return 'nw';
        }
    }
}

// OLD NOTES that lived by lilMap, scan and condense:
// One of the next steps is to slip this bad boy into the 'areas' object, somewhere above.
// Adding an 'absolute' and/or 'relative' coords to each 'room' makes sense.
// Also, attributes such as those the front-end needs to display proper images would be fantastic. Lake, forest, plains, etc.
// ... can even have multiple 'layers' or fewer. We have some support for sky and ground, at minimum, right now.
// How to handle 'exits'? Hmmmm...
// Right now we're leaning into the 'multidimensional grid' of the nested arrays, which is 'easy' in a way.
// The 'harder' way long-term is to just have an array of objects with internally defined relationships with surrounding areas.
// Either way, exits need to know what is connected in each 'direction' that you can go, and possibly extra stuff:
//      skill(s) required to traverse, 'room' size, exit size/type, any considerations such as being blocked by mob(s), etc.


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


app.post('/character/login', (req, res, next) => {
    // Receive a CHARTOKEN, check it, and if VALID, do two important things:
    // 1) 'Load' the character live into this server space
    // 2) Pass back that character to the client, which must use this package to open a socket with the server
    // +) Oh, this login may just receive a charname and password instead, so handle it either way

    if (req.body.charToken !== undefined) {
        const { charToken } = req.body;

        // HERE: handle token login
        const decodedToken = jwt.verify(charToken, process.env.SECRET);
        const { name, id } = decodedToken;

        Character.findOne({ name: name, _id: id })
            .then(searchResult => {
                if (searchResult === null) {
                    // HERE: handle no such character now
                    res.status(406).json({type: `failure`, message: `No such character exists yet. You can create them, if you'd like!`});
                } else {
                    // Token worked! Currently we make a brand-new one here to pass down, but we can play with variations on that later
                    const token = craftAccessToken(searchResult.name, searchResult._id);
                    const charToLoad = JSON.parse(JSON.stringify(searchResult));
                    delete charToLoad.salt;
                    delete charToLoad.hash;

                    const alreadyInGame = addCharacterToGame(charToLoad);

                    if (alreadyInGame) res.status(200).json({type: `success`, message: `Reconnecting to ${charToLoad.name}.`, payload: {character: characters[charToLoad.name], token: token}})
                    else res.status(200).json({type: `success`, message: `Good news everyone! ${charToLoad.name} is ready to play.`, payload: {character: charToLoad, token: token}});



                }


            })
            .catch(err => {
                console.log(`Someone had some difficulty logging in: ${err}`);
                res.status(406).json({type: `failure`, message: `Something went wrong logging in with these credentials.`});
            })        
    }
    if (req.body.userCredentials !== undefined) {
        const { userCredentials } = req.body;
        console.log(`Someone is attempting to log in with these credentials: ${JSON.stringify(userCredentials)}`);

        // HERE: handle credentials login: take userCredentials.charName and userCredentials.password and go boldly:

        Character.findOne({ name: userCredentials.charName })
            .then(searchResult => {
                if (searchResult === null) {
                    // HERE: handle no such character now
                    res.status(406).json({type: `failure`, message: `No such character exists yet. You can create them, if you'd like!`});
                } else {
                    let thisHash = createHash(userCredentials.password, searchResult.salt);
                    if (thisHash === searchResult.hash) {
                        // Password is good, off we go!
                        const token = craftAccessToken(searchResult.name, searchResult._id);
                        const charToLoad = JSON.parse(JSON.stringify(searchResult));
                        delete charToLoad.salt;
                        delete charToLoad.hash;

                        // This will probably only work a small subset of times, actually; socket disconnection removes the char from the game
                        const alreadyInGame = addCharacterToGame(charToLoad);

                        if (alreadyInGame) res.status(200).json({type: `success`, message: `Reconnected to live character.`, payload: {character: characters[charToLoad.name], token: token}})
                        else res.status(200).json({type: `success`, message: `Good news everyone! ${charToLoad.name} is ready to play.`, payload: {character: charToLoad, token: token}});                        


                    } else {
                        // Password is incorrect, try again... if THOU DAREST
                        res.status(401).json({type: `failure`, message: `The supplied password is incorrect.`});
                    }
                }


            })
            .catch(err => {
                console.log(`Someone had some difficulty logging in: ${err}`);
                res.status(406).json({type: `failure`, message: `Something went wrong logging in with these credentials.`});
            })
    }
});

// I was gonna put a logout here, but I think that can be handled in the socket plus in the client instead, doesn't need its own route per se
// Exception, maybe: if I set the JWT http-only, it might need the server to help toss it upon (intentional) logout?

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
    // Setting default stats here... will change to actual stats/skills populating later, as well as gear
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
                        delete charToLoad.salt;
                        delete charToLoad.hash;

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

    JOIN and LEAVE are opposites. As you'd expect.

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
    let myCharacter; // NOTE: this reference isn't fully dependable; the 'best' use of this right now is just a reference that's fixed, such as name
    let zoneString; // Areas should be set up to be automatically unique, so no worries here about setting this one
    let roomString; // If I end up setting this to the room's GPS coords, or key + GPS, that should ensure uniqueness

    socket.on('login', character => {
        console.log(`${character.name} has joined the game!`);
        if (!characters[character.name]) {
            console.log(`Oh! Not logged in yet on the server. Beep boop, fixing.`);
            addCharacterToGame(character);
        }
        roomString = character.location.RPS.toString() + '/' + character.location.GPS;
        socket.join(roomString);
        console.log(`Testing feedback: ${character.name} joined room known as ${roomString}.`);
        socket.join(zaWarudo[character.location.RPS][character.location.GPS].zone);
        myCharacter = character;
    });


    socket.on('movedir', mover => {
        // HERE: use the request from the client to plug into the character and le GO
        const moveChar = characters[mover.who];

        // SOMEWHERE AROUND HERE: see if the character has left the Zone to update zone socket :P

        let oldGPS = moveChar.location.GPS;

        const direction = keyToDirection(mover.where);
        let walkResult = {
            feedback: moveEntity(moveChar, direction),
            newLocation: moveChar.location
        };

        let newGPS = moveChar.location.GPS;

        if (oldGPS !== newGPS) {
            // Movement actually occurred! Change room subscriptions while emitting properly.
            socket.to(roomString).emit('room_event', `${moveChar.name} just went wherever the ${mover.where} key takes them.`);
            socket.leave(roomString);
            roomString = moveChar.location.RPS.toString() + '/' + moveChar.location.GPS;
            socket.join(roomString);
            socket.to(roomString).emit('room_event', `${moveChar.name} just arrived. Hi!`);
        }


        socket.emit('moved_dir', walkResult);
    });

    socket.on('disconnect', () => {
        socket.to(roomString).emit('room_event', `${myCharacter.name} just disappeared in a puff of smoke! Wow!`);
        console.log(`Client has disconnected from our IO shenanigans. Goodbye, ${myCharacter.name}!`);
        removeCharacterFromGame(characters[myCharacter.name]);
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
    if (characters[character.name] === undefined) {
        character.location.room = zaWarudo[character.location.RPS][character.location.GPS];
        characters[character.name] = character;
        return true;
    }
    return false;
    // Just added the true/false there -- this is to allow down-the-road handling of trying to log in an already-playing user
}

function removeCharacterFromGame(character) {
    // HERE: add save to DB before removing from server-space
    const filter = { name: character.name };
    const update = { $set: character };
    const options = { new: true, useFindAndModify: false };

    Character.findOneAndUpdate(filter, update, options)
        .then(updatedResult => {
            console.log(`${updatedResult.name} has been updated. I have saved them as being at ${updatedResult.location.room.title}. Disconnecting from game.`);
            delete characters[character.name];
        })
        .catch(err => {
            console.log(`We encountered an error saving the character whilst disconnecting: ${err}.`);
            delete characters[character.name];
        })
    
}

server.listen(PORT, () => console.log(`With Friends server active on Port ${PORT}.`));

// Handy lil' function so I can see everyone playing and their current location. Can add more robust checking later, as well as a 'pinging' function.
// setInterval(() => {
//     console.log(`Players currently in the game:`);
//     for (const property in characters) {
//         console.log(`${property}, at ${characters[property].location.room.title}.`);
//     }
// }, 10000);


/*

Doot doot. Nothing to report at this time.

*/