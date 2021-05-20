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

// Idle question for later -- can I specify multiple origins, possibly in an array?
// Scooted this bad boy WAY UP HERE so I can reference it via NPCs and mobs. Attempting CLEVERNESS.
const io = socketIo(server, {
    cors: {
        origin: 'http://localhost:4001',
        methods: ['GET', 'POST']
    }
});

function rando(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function generateRandomID() {
    let dateSeed = new Date();
    let randomSeed = Math.random().toString(36).replace('0.', '');
    console.log(`Random Seed result: ${randomSeed}`);
    return dateSeed.getMonth() + '' + dateSeed.getDate() + '' + dateSeed.getHours() + '' + dateSeed.getMinutes() + '' + dateSeed.getSeconds() + '' + randomSeed;
}

// Define all possible perks here
// Arrays of objects, with requirements inside its own list that can be filter-parsed when trying to learn
// Object also consists of stat-ups (1 stat per 2 points of cost), plus any bonuses, techs, etc. gained from learning
// ... these bonuses are gonna have to live somewhere in our Character, hold on a sec...
// Oh, can also list the 'perk type' inside the perk for backwards calculating if necessary later
// KISS for now; can get fancy further down the line with advanced/wacky perks
// ...however, it'd be fine to have literally ANY stat/metric boostable by flat and/or %, so try to store them in a way that's conducive to that
const perks = {
    fighting: [],
    gathering: [],
    sneaking: [],
    traversal: [],
    crafting: [],
    spellcasting: [],
    scholarship: [],
    sensing: [], 
    building: [],
    medicine: []
};


/*
    For this 'hardcoded' final alpha world:
    RIVERCROSSING:
        - Town Center
        - Weapon & Armor Shop, Apothecary, Magic Shop
        - Forge, Alchemy Area, Church?, Bank, Healing House
        - Trainers?
        - Some roads
        - A couple of guilds
    WEST FIELDS:
        - Orchard (goblins!)
        - Farmland
        
*/

let zaWarudo = {
    0: {
        '500,500,0': {
            zone: 'Town of Rivercrossing',
            room: 'Town Square',
            indoors: 0,
            description: `Well-worn cobblestone roads criss-cross through this area, encircling an open central plaza before winding off in every direction.`,
            size: 12,
            structures: [
                {
                    name: 'Rivercrossing Metalworks',
                    type: 'shop',
                    roomImage: undefined,
                    interiorImage: undefined,
                    description: ``,
                    inventory: [],
                    onInteract: undefined, // Can choose to define here what happens when interacted with, in this case, opens shopping menu. OR the client can figure it out!
                    keyboardInteract: undefined
                    // Extra thought: if shops/portals/etc. have hours or special conditions, can define those in here, as well... statusManager?
                }
            ],
            players: [],
            npcs: [],
            mobs: [],
            loot: [],
            effects: [],
            background: {sky: undefined, ground: undefined, foreground: undefined},
            fishing: undefined,
            foraging: {},
            exits: {
                'e': {to: '525,500,0', traversal: 'walk/0', hidden: 0},
                'w': {to: '475,500,0', traversal: 'walk/0', hidden: 0},
                's': {to: '500,475,0', traversal: 'walk/0', hidden: 0}
            }
        },
        '500,475,0': {
            zone: 'Town of Rivercrossing',
            room: 'South Central Street',
            indoors: 0,
            description: `Coming off the Town Square to the north, the roads here are a little less ragged and give way to several narrower streets that turn in haphazard angles around collections of buildings that appear to have been dropped loosely and at random in the area.`,
            size: 12,
            structures: [],
            players: [],
            npcs: [],
            mobs: [],
            loot: [],
            effects: [],
            background: {sky: undefined, ground: undefined, foreground: undefined},
            fishing: undefined,
            foraging: {},
            exits: {
                'n': {to: '500,500,0', traversal: 'walk/0', hidden: 0}
            }
        },        
        '475,500,0': {
            zone: 'Town of Rivercrossing',
            room: 'West Central Street',
            indoors: 0,
            description: `What a lovely area to be in!`,
            size: 12,
            structures: [],
            players: [],
            npcs: [],
            mobs: [],
            loot: [],
            effects: [],
            background: {sky: undefined, ground: undefined, foreground: undefined},
            fishing: undefined,
            foraging: {},
            exits: {
                'e': {to: '500,500,0', traversal: 'walk/0', hidden: 0},
                'w': {to: '450,500,0', traversal: 'walk/0', hidden: 0}
            }
        },
        '450,500,0': {
            zone: 'Town of Rivercrossing',
            room: 'Inside the West Gate',
            indoors: 0,
            description: `What a lovely area to be in!`,
            size: 12,
            structures: [
                {
                    name: 'the western gatehouse',
                    type: 'portal',
                    status: 'open',
                    roomImage: undefined, // What it looks like in the bar (imgsrc)
                    description: ``,
                    goes: {to: '425,500,0'},
                    onInteract: undefined,
                    keyboardInteract: undefined
                }
            ],
            players: [],
            npcs: [],
            mobs: [],
            loot: [],
            effects: [],
            background: {sky: undefined, ground: undefined, foreground: undefined},
            fishing: undefined,
            foraging: {},
            exits: {
                'e': {to: '475,500,0', traversal: 'walk/0', hidden: 0},
                's': {to: '450,475,0', traversal: 'walk/0', hidden: 0}
            }
        },
        '450,475,0': {
            zone: 'Town of Rivercrossing',
            room: 'Southern Westgate Road',
            indoors: 0,
            description: `What a lovely area to be in!`,
            size: 12,
            structures: [],
            players: [],
            npcs: [],
            mobs: [],
            loot: [],
            effects: [],
            background: {sky: undefined, ground: undefined, foreground: undefined},
            fishing: undefined,
            foraging: {},
            exits: {
                'n': {to: '450,500,0', traversal: 'walk/0', hidden: 0}
            }
        },        
        '425,500,0': {
            zone: 'West of Rivercrossing',
            room: 'Outside the West Gate',
            indoors: 0,
            description: `You are on a dirt road leading to the western wall of Rivercrossing, which sprawls out of sight north into forest and south towards the Tradewind River. The road itself winds westward toward farmland, while a small footpath leads south along the wall.`,
            size: 12,
            structures: [
                {
                    name: 'outer western town gates',
                    type: 'portal',
                    status: 'open',
                    roomImage: undefined,
                    description: ``,
                    goes: {to: '450,500,0'}, // Can give this a try once ROOM STRUCTURES are operational!
                    onInteract: undefined,
                    keyboardInteract: undefined
                }
            ],
            players: [],
            npcs: [],
            mobs: [],
            loot: [],
            effects: [],
            background: {sky: undefined, ground: undefined, foreground: undefined},
            fishing: undefined,
            foraging: {},
            exits: {
                'w': {to: '400,500,0', traversal: 'walk/0', hidden: 0},
                's': {to: '425,475,0', traversal: 'walk/0', hidden: 0}
            }
        },
        '425,475,0': {
            zone: 'West of Rivercrossing',
            room: 'Along the Outer West Wall',
            indoors: 0,
            description: `Lovely.`,
            size: 12,
            structures: [],
            players: [],
            npcs: [],
            mobs: [],
            loot: [],
            effects: [],
            background: {sky: undefined, ground: undefined, foreground: undefined},
            fishing: undefined,
            foraging: {},
            exits: {
                'n': {to: '425,500,0', traversal: 'walk/0', hidden: 0}
            }
        },        
        '400,500,0': {
            zone: 'West of Rivercrossing',
            room: 'Well-Worn Farmland Road',
            indoors: 0,
            description: `What a lovely area to be in!`,
            size: 12,
            structures: [],
            players: [],
            npcs: [],
            mobs: [],
            loot: [],
            effects: [],
            background: {sky: undefined, ground: undefined, foreground: undefined},
            fishing: undefined,
            foraging: {},
            exits: {
                'e': {to: '425,500,0', traversal: 'walk/0', hidden: 0},
                'nw': {to: '375,525,0', traversal: 'walk/0', hidden: 0},
                'n': {to: '400,525,0', traversal: 'walk/0', hidden: 0}
            }            
        },
        '400,525,0': {
            zone: 'West of Rivercrossing',
            room: 'South of Orchards',
            indoors: 0,
            description: `What a lovely area to be in! You see many trees.`,
            size: 12,
            structures: [],
            players: [],
            npcs: [],
            mobs: [],
            loot: [],
            effects: [],
            background: {sky: undefined, ground: undefined, foreground: undefined},
            fishing: undefined,
            foraging: {},
            exits: {
                's': {to: '400,500,0', traversal: 'walk/0', hidden: 0},
                'n': {to: '400,550,0', traversal: 'walk/0', hidden: 0}
            }            
        },
        '400,550,0': {
            zone: 'West of Rivercrossing',
            room: `At Orchard's Edge`,
            indoors: 0,
            description: `What a lovely area to be in! You see many trees.`,
            size: 12,
            structures: [],
            players: [],
            npcs: [],
            mobs: [],
            loot: [],
            effects: [],
            background: {sky: undefined, ground: undefined, foreground: undefined},
            fishing: undefined,
            foraging: {},
            exits: {
                's': {to: '400,525,0', traversal: 'walk/0', hidden: 0},
                'w': {to: '375,550,0', traversal: 'walk/0', hidden: 0},
                'nw': {to: '375,575,0', traversal: 'walk/0', hidden: 0},
                'n': {to: '400,575,0', traversal: 'walk/0', hidden: 0},
                'ne': {to: '425,575,0', traversal: 'walk/0', hidden: 0},
                'e': {to: '425,550,0', traversal: 'walk/0', hidden: 0}
            }            
        },
        '375,550,0': {
            zone: 'West of Rivercrossing',
            room: `Southwestern Orchards`,
            indoors: 0,
            description: `What a lovely area to be in! You see many trees.`,
            size: 12,
            structures: [],
            players: [],
            npcs: [],
            mobs: [],
            loot: [],
            effects: [],
            background: {sky: undefined, ground: undefined, foreground: undefined},
            fishing: undefined,
            foraging: {},
            exits: {
                'e': {to: '400,550,0', traversal: 'walk/0', hidden: 0},
                'n': {to: '375,575,0', traversal: 'walk/0', hidden: 0},
                'ne': {to: '400,575,0', traversal: 'walk/0', hidden: 0}
            }            
        },
        '425,550,0': {
            zone: 'West of Rivercrossing',
            room: `Southeastern Orchards`,
            indoors: 0,
            description: `What a lovely area to be in! You see many trees.`,
            size: 12,
            structures: [],
            players: [],
            npcs: [],
            mobs: [],
            loot: [],
            effects: [],
            background: {sky: undefined, ground: undefined, foreground: undefined},
            fishing: undefined,
            foraging: {},
            exits: {
                'w': {to: '400,550,0', traversal: 'walk/0', hidden: 0},
                'nw': {to: '400,575,0', traversal: 'walk/0', hidden: 0},
                'n': {to: '425,575,0', traversal: 'walk/0', hidden: 0}
            }            
        },
        '375,575,0': {
            zone: 'West of Rivercrossing',
            room: `Western Orchards`,
            indoors: 0,
            description: `What a lovely area to be in! You see many trees.`,
            size: 12,
            structures: [],
            players: [],
            npcs: [],
            mobs: [],
            loot: [],
            effects: [],
            background: {sky: undefined, ground: undefined, foreground: undefined},
            fishing: undefined,
            foraging: {},
            exits: {
                's': {to: '375,550,0', traversal: 'walk/0', hidden: 0},
                'se': {to: '400,550,0', traversal: 'walk/0', hidden: 0},
                'e': {to: '400,575,0', traversal: 'walk/0', hidden: 0},
                'ne': {to: '400,600,0', traversal: 'walk/0', hidden: 0},
                'n': {to: '375,600,0', traversal: 'walk/0', hidden: 0}
            }            
        },
        '400,575,0': {
            zone: 'West of Rivercrossing',
            room: `At Orchard's Center`,
            indoors: 0,
            description: `What a lovely area to be in! You see SOOOO many trees.`,
            size: 12,
            structures: [],
            players: [],
            npcs: [],
            mobs: [],
            loot: [],
            effects: [],
            background: {sky: undefined, ground: undefined, foreground: undefined},
            fishing: undefined,
            foraging: {},
            exits: {
                's': {to: '400,550,0', traversal: 'walk/0', hidden: 0},
                'se': {to: '425,550,0', traversal: 'walk/0', hidden: 0},
                'e': {to: '425,575,0', traversal: 'walk/0', hidden: 0},
                'ne': {to: '425,600,0', traversal: 'walk/0', hidden: 0},
                'n': {to: '400,600,0', traversal: 'walk/0', hidden: 0},
                'nw': {to: '375,600,0', traversal: 'walk/0', hidden: 0},
                'w': {to: '375,575,0', traversal: 'walk/0', hidden: 0},
                'sw': {to: '375,550,0', traversal: 'walk/0', hidden: 0}                
            }            
        },
        '425,575,0': {
            zone: 'West of Rivercrossing',
            room: `Eastern Orchards`,
            indoors: 0,
            description: `What a lovely area to be in! You see many trees.`,
            size: 12,
            structures: [],
            players: [],
            npcs: [],
            mobs: [],
            loot: [],
            effects: [],
            background: {sky: undefined, ground: undefined, foreground: undefined},
            fishing: undefined,
            foraging: {},
            exits: {
                'n': {to: '425,600,0', traversal: 'walk/0', hidden: 0},
                'nw': {to: '400,600,0', traversal: 'walk/0', hidden: 0},
                'w': {to: '400,575,0', traversal: 'walk/0', hidden: 0},
                'sw': {to: '400,550,0', traversal: 'walk/0', hidden: 0},
                's': {to: '425,550,0', traversal: 'walk/0', hidden: 0}
            }            
        },
        '425,600,0': {
            zone: 'West of Rivercrossing',
            room: `Northeastern Orchards`,
            indoors: 0,
            description: `What a lovely area to be in! You see many trees.`,
            size: 12,
            structures: [],
            players: [],
            npcs: [],
            mobs: [],
            loot: [],
            effects: [],
            background: {sky: undefined, ground: undefined, foreground: undefined},
            fishing: undefined,
            foraging: {},
            exits: {
                'w': {to: '400,600,0', traversal: 'walk/0', hidden: 0},
                'sw': {to: '400,575,0', traversal: 'walk/0', hidden: 0},
                's': {to: '425,575,0', traversal: 'walk/0', hidden: 0}
            }            
        },
        '400,600,0': {
            zone: 'West of Rivercrossing',
            room: `Northern Orchards`,
            indoors: 0,
            description: `What a lovely area to be in! You see many trees.`,
            size: 12,
            structures: [],
            players: [],
            npcs: [],
            mobs: [],
            loot: [],
            effects: [],
            background: {sky: undefined, ground: undefined, foreground: undefined},
            fishing: undefined,
            foraging: {},
            exits: {
                'e': {to: '425,600,0', traversal: 'walk/0', hidden: 0},
                'se': {to: '425,575,0', traversal: 'walk/0', hidden: 0},
                's': {to: '400,575,0', traversal: 'walk/0', hidden: 0},
                'sw': {to: '375,575,0', traversal: 'walk/0', hidden: 0},
                'w': {to: '375,600,0', traversal: 'walk/0', hidden: 0}
            }            
        },
        '375,600,0': {
            zone: 'West of Rivercrossing',
            room: `Northwestern Orchards`,
            indoors: 0,
            description: `What a lovely area to be in! You see many trees.`,
            size: 12,
            structures: [],
            players: [],
            npcs: [],
            mobs: [],
            loot: [],
            effects: [],
            background: {sky: undefined, ground: undefined, foreground: undefined},
            fishing: undefined,
            foraging: {},
            exits: {
                's': {to: '375,575,0', traversal: 'walk/0', hidden: 0},
                'se': {to: '400,575,0', traversal: 'walk/0', hidden: 0},
                'e': {to: '400,600,0', traversal: 'walk/0', hidden: 0}
            }            
        },
        '375,525,0': {
            zone: 'West of Rivercrossing',
            room: 'Farmland Road Through Wheat Fields',
            indoors: 0,
            description: `What a lovely area to be in!`,
            size: 12,
            structures: [],
            players: [],
            npcs: [],
            mobs: [],
            loot: [],
            effects: [],
            background: {sky: undefined, ground: undefined, foreground: undefined},
            fishing: undefined,
            foraging: {},
            exits: {
                'se': {to: '400,500,0', traversal: 'walk/0', hidden: 0}
            }            
        }, 
        '525,500,0': {
            zone: 'Town of Rivercrossing',
            room: 'East Central Street',
            indoors: 0,
            description: `What a lovely area to be in!`,
            size: 12,
            structures: [],
            players: [],
            npcs: [],
            mobs: [],
            loot: [],
            effects: [],
            background: {sky: undefined, ground: undefined, foreground: undefined},
            fishing: undefined,
            foraging: {},
            exits: {
                'w': {to: '500,500,0', traversal: 'walk/0', hidden: 0}
            }            
        }
    }
};

// ZONE ROUNDUP: 'Town of Rivercrossing' , 'West of Rivercrossing'

class Zone {
    constructor(name) {
        this.name = name;
    }

    // Methods go here
}

/*
let orchardGoblinSpawn = new SpawnMap(
    [{mobClass: orchardGoblin, mobLevelRange: '1-1', frequency: 1}], 
    10, 
    ['400,575,0','400,550,0', '400,600,0', '375,550,0', '375,575,0', '375,600,0', '425,550,0', '425,575,0', '425,600,0'], 
    {spawnPerRoom: 1, groupSize: 1, playerSpawnPreference: 1, baseSpawn: 1, extraPlayerSpawn: 1, maxSpawn: 6}  
);
*/

class SpawnMap {
    constructor(mobArray, tickRate, spawnRooms, spawnRules) {
        this.mobArray = mobArray; // array of objects: class of mob to use, level range, frequency (for weighting)
        this.tickRate = tickRate * 1000; // how often to check itself to see if it needs to spawn ... we'll have it in seconds, and just x1000 this bad boy
        this.spawnRooms = spawnRooms; // array of rooms to potentially spawn in
        this.spawnRules = spawnRules;
        /*
            SPAWNRULES: object
            max mobs per room per spawn
            groups spawned/group preference
            spawn on player: never, random, preferably
            base spawnrate (no players), additional spawn per player, max spawn
            ... so e.g.
            {spawnPerRoom: 1, groupSize: 1, playerSpawnPreference: 1, baseSpawn: 1, extraPlayerSpawn: 1, maxSpawn: 6}
        */

        this.mobs = []; // keep track of mobs spawned, see how they're doing, make more if necessary
        this.active = false; // variable that controls whether this SpawnMap is currently active ... may not be necessary upon further reflection
    }

    init() {
        // set first variables that you don't want to re-set each time, like maybe distilling a frequency grid for mob spawn?
        // HERE: initial spawn, if applicable -- we're doing a "single mob array spawn" here, can extrapolate later for more robustness and flexibility
        // ADD: spawn up to the baseSpawn rate
        this.spawn(this.mobArray[0].mobClass);
        // HERE: set first timeout
        setTimeout(() => this.run(), this.tickRate);
    }

    run() {
        // ADD: checking on mobs; once they're killable, add a fxn that removes them from global mobs, converts them into their corpse-form (dark!)
        //  RUN should check on the status of all stored IDs, count up the remaining live ones, and respond accordingly

        // Check spawn rules, make sure we're not at the limit before running spawn
        if (this.mobs.length < this.spawnRules.maxSpawn) {
            // ADD: check all rooms for players to see if it's time to pop more mobs into existence
            //  ... currently, just kinda keeps going until maxSpawn willy-nilly
            this.spawn(this.mobArray[0].mobClass);
        }
        setTimeout(() => this.run(), this.tickRate);
    }

    spawn(classMob) {
        // obey all spawn rules while dropping this new classMob(spawnLocation)... might do a 'quick' loop instead?
        let spawnLocation;
        let obeyingSpawnRules = false;
        do {
            spawnLocation = this.spawnRooms[rando(0,this.spawnRooms.length - 1)];
            // let theseMobsInRoom = 0; // whoops, I have no way to have 'core identity' checked with orchard goblin vs orchard goblin... add that in
            if (zaWarudo['0'][spawnLocation].mobs.length < 1) { // CHANGE: set up to check against spawnPerRoom, requires change(s) above
                obeyingSpawnRules = true;
            }
        } while (obeyingSpawnRules === false);

        console.log(`The room at ${spawnLocation} looks good. Let's plop down a mob!`);
        const newMob = new classMob(spawnLocation);
        newMob.init();
        
        mobs[newMob.entityID] = newMob; // do I have to do a deep copy, or will this be sufficient?
        // HERE: whoops, gotta populate their room, too...
        populateRoom(newMob);
        io.to(`${newMob.location.RPS}/${newMob.location.GPS}`).emit('room_event', {echo: newMob.spawnMessage});
        

        // hmmmm ok maybe locally define, make a deep brand-new copy in global mobs list, then throw the entityID into the local mobs list
        

        this.mobs.push(newMob.entityID); // just entityID, can be used for lookup against the global mobs? speaking of which:
        
    }

    /*
        HRMM -- what goes into a SpawnMap?
        -- an array of rooms
        -- how often it 'ticks'
        -- mob(s) spawned including their level range if applicable
        -- spawn rule(s), including "X mobs per room," "spawn preference (group size)," "spawn on player: never, random, preferably", "spawnrate without players present"
        -- target(s): particularly aggressive SpawnMaps (or riled up ones... think hornet's nest/goblin camp) can get peeved at particular player(s),
            spawning more frequently, more aggressively, angrier mobs, stronger mobs from its 'deck' if applicable, etc.
        

        NOTE -- class is defined here, but we gotta wait to actually create the SpawnMaps further down in the file, since at this point there are no mobs defined yet
        
    */
}

let Rivercrossing = new Zone('Town of Rivercrossing');
let WestOfRivercrossing = new Zone('West of Rivercrossing');

// Hm... add an 'iconImgSrc' attribute?
class Item {
    constructor(type, glance, description, stat, build, effects, techs, value) {
        this.type = type; // objectified - item type and subtypes, if applicable
        this.glance = glance;
        this.description = description;
        this.stat = stat; // objectified - derivedStats in the format of atk: 'agi/50'
        this.build = build; // objectified - size, weight, durability, materials, maybe level/quality/etc.
        this.effects = effects; // object with stuff like physicalDamageBonus, injuryBonus, etc.
        this.techs = techs;
        this.value = value; // ideally derived from materials as well as skill/difficulty in its creation modified by overall concept of rarity, buuuut whatever for now
        this.itemID = generateRandomID();
    }
}

// Hm, going to have to figure out how we want to actually use these values...
// The strength of classes is being able to make new items on the fly, while this is just setting it all randomly here?
// Well, we can also do a new Item whenever we spawn a new mob or create an item or 'create' from a store buying, etc.
// So this is mostly just to sketch out the concept for now, I suppose
let goblinKnife = new Item(
    {mainType: 'tool', buildType: 'dagger', subType: 'carver', range: 'melee', skill: 'gathering'},
    `a jagged stone knife`,
    `A crude but effective tool crafted of stone chipped carefully into a jagged-edged long knife bound tightly to a well-worn wooden handle. 
    Flecks of dried fruit pulp are caked along one side of the blade.`,
    {atk: 10, mag: 5, def: 0, res: 0},
    {size: 1, weight: 5, durability: 50, maxDurability: 50, materials: 'stone/1,wood/1'},
    {physicalDamageBonus: 3},
    [strike],
    15
);

let goblinRags = new Item(
    {mainType: 'armor', buildType: 'clothes', subType: 'leather', skill: 'gathering'},
    `some stitch-ragged leather clothes`,
    `While it looks capable of providing some basic protection, this patchwork collection of rough-worn leather is enthusiastically albeit poorly held together with sheer optimism almost as much as it is copious amounts of crude twine.`,
    {atk: 0, mag: 0, def: 10, res: 5},
    {size: 8, weight: 25, durability: 150, maxDurability: 150, materials: `leather/8`},
    [],
    15 
)

class Weapon extends Item {
    constructor(name, description, atk, mag, def, res, size, weight, special, construction, materials, value) {
        super('weapon', name, description, atk, mag, def, res, size, weight, special, construction, materials, value);
    }
}

class Armor extends Item {
    constructor(name, description, atk, mag, def, res, size, weight, special, construction, materials, value) {
        super('armor', name, description, atk, mag, def, res, size, weight, special, construction, materials, value);
    }
}

// Hm. Not sure I like this setup. Maybe more objects, fewer loose floating numbers, can possibly de-specialize these classes
//  and add typing to a "type" object at the beginning instead

let woodcuttersAxe = new Weapon(
    `a woodcutter's axe`,
    `Good for getting some lumber!`,
    18,
    5,
    0,
    0,
    3,
    20,
    [],
    100,
    ['iron/2', 'oak/2'],
    250    
);

let reinforcedLeatherArmor = new Armor(
    'reinforced leather armor',
    `Hardened armor made of stud-reinforced leather carefully stiffened and layered to provide a good blend of mobility and protection.`,
    0,
    0,
    15,
    5,
    6,
    100,
    [],
    ['leather/6', 'iron/1'],
    300
);


// Doing an NPC Class way up here, because Class is NOT hoisted, unlike constructor functions. Will eventually just grab it from its own module. Anyhoo:
class NPC {

    /*
        All ideas herewrit shall apply to NPCs and mobs alike. Hurrah!

        Anyway:
        -- Weighted action spread? Like one mode might be (travel: 2, search: 1) would roll the dice and have twice the odds of traveling vs searching.
        -- can throw stuff in like doNothing for chance of just waiting until the next 'tick' to do anything
        -- can be modified by entity's Nature and State (so an aggressive entity would get a multiplier to combat-oriented actions)
        -- State would be based on their current condition primarily, so being wounded rapidly might cause a Panic state
        -- State can be reactive in genesis, but could also be directed: add Goal(s) that predict moving to another State
        -- Pretty robust AI foundation? We'll see!
        -- Maybe some Needs that can be literally or 'play' met, which would modify State as well
        -- Nature could also make different states more or less likely in addition to modifying likelihoods within States

        STATE PONDERING:
        -- Wanderlust: entity just wants to move around. 

        TIMEOUT WITHIN INTERVAL
            ... once it's started, in this case, I don't really have a good way currently to stop and reset the interval with a new value
            ... can do an "NPC/mob reset" functionality down the line for this
            ... miiiight be able to launch individual setTimeouts to do 'extra' actions within the interval, which could be handy
            ... though the "NPC/Mob Reset" functionality could be also an 'Adjuster' that ramps down activity if nobody's "looking" at them
            ... in this model, could build up 'action points' that get spent en masse when they need to 'catch up' when someone starts watching again?

        Eventually I'd like relationship-building with NPCs, as well as a robust system for personality and 'growing with' interested players...
            ... buuuuut that's WELL outside the scope of Alpha, so just bear it in mind while scaffolding capabilities
    */

    constructor(name, glance, location, description) {
        this.entityID = 'npc' + generateRandomID(); // Highly unlikely to be duplicated, but can add populate checks later to ensure it more reliably
        this.entityType = 'npc';
        this.name = name;
        this.level = 1; // Placeholder for now
        this.stat = {strength: 15, agility: 15, constitution: 15, willpower: 15, intelligence: 15, wisdom: 15, spirit: 15};
        this.glance = glance; // Room/sidebar text
        this.location = location;
        this.description = description || `This being is very nondescript.`;
        this.race = 'human';
        this.zoneLocked = true;
        this.entityType = 'npc';
        this.mode = 'nonsense';
        this.wanderlust = 0;
        this.actInterval = 30000;
        this.number = rando(1,10);
        this.interactions = {
            'Talk': 
            {
                'prompt': {echo: `${this.name} regards you with curiosity as you approach.`},
                0: {echo: `Sure is lovely weather, isn't it? I don't even remember the last time it was dark out.`},
                1: {echo: `They call me Taran Wanderer, which is funny, because I've never once moved from this spot.`},
                2: {echo: `I feel very well-read.`},
                3: {echo: `Did you know there are orchard muglins out the west gate? They seem like some good low-level hunting!`}
            },
            'Ask': {
                'prompt': {echo: `I'm afraid I'm new around here, so I can't really answer any of your questions... I'm sorry.`},
                'Your name?': {echo: `Ah! Well, I can tell you that. My name is Taran.`},
            },
            'Buy': {
                // THIS: let's figure out how to classify items so they pass innocuously to the front-end but can make new items on the backend
                'prompt': {echo: `I suppose I can sell you some basic supplies. Here's what I have:`},
                'Warblade': {echo: `Whoowee!`, name: 'Ancient Warblade', cost: {money: 0, }, itemRef: '', },
                'Gold Crown': {echo: `Expensive!`, name: 'Golden Crown', cost: {money: 0, }, itemRef: '', },
            },
            'Train': {
                // THIS: differentiate between Techs, Spells, other?
                'prompt': {echo: `I know a thing or two. What would you like to learn?`},
                'Dance Fighting': {echo: `Oh, my favorite. It doesn't even make sense! But it works!`, name: 'Slamdance', techRef: '', cost: {money: 0, tdps: 0}}
            }
            // can add other interactions here as inspiration strikes
        }
        // Since 'talk' is so much different than the other interaction types, miiiight go ahead and use this instead?
        this.talkTopics = [
            `Sure is lovely weather, isn't it? I don't even remember the last time it was even dark out.`,
            `They call me Taran Wanderer, which is funny, because I've never once moved from this spot.`,
            `I feel very well-read.`,
            `Did you know there are orchard muglins out the west gate? They seem like some good low-level hunting!`
        ];
        this.quests = {};
    }

    action() {
        // For any given action state, we can "birth" this entity with weighting, like 3 movement, 7 ponder life, 1 cast spell...
        // Then we can define ranges from that (1 - 3, 4 - 10, 11), roll the dice, and resolve the action.
        // Naturally this will require a pretty extensive library of actions/etc. if we want granular entities at some point.

        let emittedAction = '';

        let moveChance = rando(0, 100);
        if (moveChance < this.wanderlust) {
            // Here's where the movement happens! ... how do I parse moveEntity for this fella...
            // RETURN here after setting wanderlust back to 0
            emittedAction = `${this.name} wishes to live up to his name and wander about, but can't seem to figure out how yet.`;
            io.to(this.location.RPS + '/' + this.location.GPS).emit('room_event', {echo: emittedAction});
            this.wanderlust = 0;
            return this.actOut();
        }
        

        // Currently everything down there is random just for flavor. Eventually, everything should be 'purposeful,' fufilling a 'need' of some sort
        // These needs can be defined pretty broadly to begin with
        let thingIDoChance = rando(1,5);
        
        switch (thingIDoChance) {
            case 1:
                emittedAction = `${this.name} absentmindedly grasps the hilt of the sword at his hip as he squints into the distance.`;
                this.wanderlust += 5;
                break;
            case 2:
                emittedAction = `${this.name} idly adjusts his Wayfarer's Garb.`;
                this.wanderlust += 5;
                break;
            case 3:
                emittedAction = `${this.name} is enjoying the weather.`;
                this.wanderlust += 2;
                break;
            case 4: 
                emittedAction = `${this.name} squints at the signs and markings of several nearby buildings.`;
                this.wanderlust += 5;
                break;
            case 5:
                emittedAction = `${this.name} quietly recounts stories of past glories.`;
                this.wanderlust += 2;
                break;
            default:
                emittedAction = `${this.name} stares around blankly.`;
                break;
        }
        io.to(this.location.RPS + '/' + this.location.GPS).emit('room_event', {echo: emittedAction});
        // Cool! It works! That's fantastic. Ok, so now NPC/mob interaction with players is possible. Further, we should be able to send down meaningful player data.
        // Now, *ideally*, we switch it over to an _id system instead (lest we randomly generate unique names for every mob evermore). For now name is ok to test.
        // let leerTarget;
        // if (zaWarudo[this.location.RPS][this.location.GPS].players.length > 0) leerTarget = zaWarudo[this.location.RPS][this.location.GPS].players[0]
        // else leerTarget `the sky`;
        // io.to(this.location.RPS + '/' + this.location.GPS).emit('room_event', `${this.name} stares intently at ${leerTarget}.`);
        // this.number = rando(1,10);

        this.actOut();
    }

    actOut() {
        // setInterval(this.action.bind(this), this.actInterval);
        // NOTE: we *may* be able to dodge having to use 'bind' here if I do setTimeout(() => this.action, this.actInterval)?
        // Test result: YUP! Nice. Doing the anonymous function this way preserves the proper scope of the thing. The this thing. Good to know.
        setTimeout(() => this.action(), this.actInterval);
        // setTimeout(this.action.bind(this), this.actInterval);
        this.actInterval = rando(25,45) * 1000;
    }

    // HERE: maybe add a "wake()" function (or live or whatever) that "boots up" the entity to live its best life
    

}

// 'Generic' Mob class will probably get divided up into stuff like new Goblin()... will look into class logistics and refine
class Mob {
    constructor(glance, stats, location, description, race) {
        this.name = '';
        this.glance = glance;
        this.stat = JSON.parse(JSON.stringify(stats)); // Deep copy. Just in case. :P Though may not end up doing it this way, can receive an obj and parse into separate fields in a fashion similar to Characer.
        this.location = location;
        this.description = description || `This being is very nondescript.`;
        this.race = race;
        this.entityID = generateRandomID();
    }

    init() {
        // HERE: calc derivedStats, roll for random parts of their construction which may include level and gear, start their setTimeout loop
    }

    actOut() {

    }

    // If NAMED, can have a separate functionality in here that's called post-creation

    /*
        MOBLORE
        - Hm, thinking for these (and maybe NPCs), have a selfCheck fxn that assesses itself and decides what to be "up to"
        - Add who/what being targeted
        - For bosses, HP break points
        - Add special 'onReceiveDamage' listeners?
    */
}

// Maybe later we can implement 'ranges' in some fashion, or some variance in abilities or something within a spawn mob
// Also, very likely ditching the 'master class' mob concept for now and just making individual classes per mob. Let's give this a whirl.
class orchardGoblin {
    constructor(location) {
        this.location = {RPS: 0, GPS: location}; // The only outside variable needed to successfully spawn this fella currently...
        // Might add 'monsterLevel' and such 
        this.glance = `an orchard muglin`;
        this.description = `Basically a field golbin, but acutally a muglin, which is quite a bit more likely to want to mug you for fruit, in this case.`;
        this.entityID = undefined;
        this.entityType = 'mob';
        this.mobType = {meta: 'humanoid', race: 'muglin'};
        this.spawnMessage = `Leaves rustle and twigs snap as ${this.glance} scrambles into view, its eyes darting from tree to tree hungrily.`;
        this.stat = {
            seed: {HPmax: 60, MPmax: 15, strength: 10, agility: 10, constitution: 10, willpower: 10, intelligence: 10, wisdom: 10, spirit: 10},
            strength: undefined, agility: undefined, constitution: undefined, willpower: undefined, intelligence: undefined, wisdom: undefined, charisma: undefined,
            HP: undefined, HPmax: undefined, MP: undefined, MPmax: undefined,
            ATK: undefined, MAG: undefined, DEF: undefined, RES: undefined, ACC: undefined, EVA: undefined, FOC: undefined, LUK: undefined
        };
        this.skill = {
            fighting: 5,
            gathering: 5,
            sneaking: 0,
            traversal: 0,
            crafting: 0,
            spellcasting: 0,
            scholarship: 0,
            sensing: 5,
            building: 0,
            medicine: 0
        };
        this.backpack = {contents: []};
        this.wallet = {gems: [], coins: [0, 0, 0, 0]}; // thinking this will be 'stealable' money/gems
        this.mode = 'idle'; // gotta define modes and such, too, like wandering, self-care (later), etc.... may want to set 'default' names for ease and later mobs
        this.injuries = {}; // haven't decided how to define these quite yet
        this.modifiers = {};
        this.equilibrium = 100;
        this.stance = 0;
        this.equipped = {rightHand: undefined, leftHand: undefined, head: undefined, torso: undefined, accessory1: undefined, accessory2: undefined};
        this.target = undefined;
        this.flags = {}; // for later-- mark when they've been stolen from, or other sundry attributes we need to slap on
        this.tagged = {}; // thinking using this for 'spotted' entities, base key is their entityID, contains also the time of tagging and tag quality/duration metric
        this.actInterval = undefined;
        this.level = 1; // hrmmm, might set this up to be a constructor variable, and then pop stats and values up from there
        this.fighting = {main: undefined, others: []};
        this.loot = undefined; // hm, how to define loot... table-style, or individually?
    }

    init() {
        // THIS: give an entityID, roll for gear, etc. and probably start up the actOut setTimeout loop and actInterval
        // Roll up gear, 'equip' gear (not through equip function, just slap 'em into here real quick), calc all derivedStats (fxn!)
        // Still not equipped with anything yet
        this.entityID = 'mob' + generateRandomID();
        let appearanceRoll = rando(1,10);
        switch (appearanceRoll) {
            case 1:
            case 2:
            case 3:
                this.glance = `a rough-skinned orange orchard muglin`;
                break;
            case 4:
            case 5:
            case 6:
                this.glance = `a stout ruddy orchard muglin`;
                break;
            case 7:
            case 8:
            case 9:
                this.glance = `a fuzzy green orchard muglin`;
                break;
            case 10:
            default: 
                this.glance = `an oblong yellow orchard muglin`;
                break;
        }

        // NOTE: SpawnMapping handles pushing to global mobs list, so we don't do that here.

        // HERE: generate equipment
        this.equipped.rightHand = new Item(
            {
                mainType: 'weapon', buildType: 'dagger', subType: 'curved', range: 'melee', skill: 'gathering/1', stat: 'agility/1', slot: 'hands', hands: 1,
                enhancements: 0, quality: 20
            },
            `Muglin Fruitknife`,
            `A simplistic curved knife made of meticulously shaped stone. Its handle is wrapped in leather crusted with dried sugar.`,
            {ATK: 8, ACC: 12, MAG: 3, FOC: 1},
            {size: 2, weight: 5, durability: 500, maxDurability: 500, materials: 'stone/2,leather/1', attributes: undefined},
            {primitive: 5},
            [],
            50
        );
        this.equipped.body = new Item(
            {
                mainType: 'armor', buildType: 'clothes', subType: 'leather', skill: 'gathering/1', stat: 'agility/1', slot: 'body', enhancements: 0, quality: 20
            },
            `Muglin Rags`,
            `It's not entirely clear what sort of leather these are made from, or how it was treated. Based on the smell, it's probably better not to know.`,
            {DEF: 6, EVA: 6, RES: 6, LUK: 6},
            {size: 6, weight: 8, durability: 500, maxDurability: 500, materials: 'leather/6', attributes: undefined},
            {primitive: 5},
            [],
            50
        )

        calcStats(this);

        // HERE: calc derivedStats, set starting HP/MP up to max
        // ... I actually think calcStats already handles this?
        // this.stat.HP = this.stat.HPmax;
        // this.stat.MP = this.stat.MPmax;

        this.actInterval = 8000;
        setTimeout(() => this.actOut(), this.actInterval);
    }

    actOut() {
        // basic orchard muglin behavior: they do colorful nothing, search the area, or ATTACK! ... they're aggressive, so will always attack if they see player(s)
        // HERE: define 'seenPlayers' as array of attackables... once hiding is a thing

        // HERE: the actInterval has expired, so we can increment EQL by that amount / 100
        this.equilibrium += this.actInterval / 100;
        if (this.equilibrium > 100) this.equilibrium = 100;

        switch (this.mode) {
            case 'idle': {
                // Currently 'idle' just means 'not attacking anybody'... change to more nuanced behavior later
                if (zaWarudo[this.location.RPS][this.location.GPS].players.length > 0) {

                    // Change for above, eventually: do a scanRoom() function or such to create an array of detected players, then ultimately act based on that
        
                    // Currently just arbitrarily smacking whichever player is the first name in the room. Can add some nuance later. :P
                    this.fighting.main = characters[`${zaWarudo[this.location.RPS][this.location.GPS].players[0].id}`].entityID; // later: fix to include seenPlayers array length, and change to seenPlayers array instead
                    // console.log(`Rawr! Now targeting: ${JSON.stringify(this.target.name)}`);
                    // This if-else below, while kind of odd to read, essentially slots this muglin into the target's fighting object in the proper spot
                    if (characters[this.fighting.main].fighting.main === undefined) characters[this.fighting.main].fighting.main = this.entityID
                    else characters[this.fighting.main].fighting.others.push(this.entityID); 
                    this.mode = 'combat';
        
                    console.log(`Ok! The object for the muglin is ${JSON.stringify(this.fighting)}, and the character being targeted now has a fighting obj of 
                    ${JSON.stringify(characters[this.fighting.main].fighting)}`);

            
                    // The below is being set up as the foundation for initializing combat for the 'receiving party'
                    // For situations where an AoE is used, can use a loop to send relevant data to all affected parties
                    // BRAINSTORM: what data should be sent to the specific character being targeted here?
                    //  -- their own new fighting object
                    // let charaFightingObj = characters[this.fighting.main.entityID].fighting;
                    io.to(characters[this.fighting.main].name).emit('character_data', {
                        echo: `You feel the menace of MUGLIN COMBAT!`,
                        type: 'combatinit',
                        fightingObj: characters[this.fighting.main].fighting,
                    });

                    // This 'room-wide' object will be the basis for updating the roomData; the above is for updating the affected character/s own fighting obj
                    io.to(this.location.RPS + '/' + this.location.GPS).emit('room_event', {
                        echo: `An orchard muglin lunges menacingly at ${characters[this.fighting.main].name}!`,
                        type: 'combatinfo',
                        roomData: {RPS: this.location.RPS, GPS: this.location.GPS, room: zaWarudo[this.location.RPS][this.location.GPS]},
                    });
                    // Quick note on roomData above: the client stores location as separate RPS, GPS, and 'room' object data, with that last bit being the whole location obj
                    console.log(`Probably successfully emitted room-wide data.`);
                } else io.to(this.location.RPS + '/' + this.location.GPS).emit('room_event', {echo: `An orchard muglin mumbles to itself as it skulks from tree to 
                tree, scanning back and forth between branches and roots.`});
                this.actInterval = rando(3,8) * 1000;
                break;          
            }
            case 'combat': {
                // We can do very basic logic here for which of the all of two moves the muglin knows, but for other future mobs, maybe have a more modular combat logic
                //  (i.e. an object and basic AI typing that can be inserted into the constructor)
                if (this.location.GPS === characters[this.fighting.main].location.GPS) {
                    // later: amend to see if target is visible, assess muglin's current state to see what actions are possible, and update accordingly
                    // for now: attack!
                    // basic logic: normal attacks, with the occasional goblin punch; goblin punch becomes more likely at lower HP?

                    let attackResult = strike(this, characters[this.fighting.main]);
                    io.to(characters[this.fighting.main].name).emit('combat_event', {echo: attackResult, type: 'combat_msg'});
                    // io.to(characters[this.fighting.main].name).emit('combat_event', {echo: `The muglin wants to use its ${this.stat.ATK} attack power on you!`, type: 'combat_msg'});
                    io.to(this.location.RPS + '/' + this.location.GPS).emit('room_event', {echo: `The muglin is fighting! Scrappy!`});

                } else {
                    console.log(`Muglin cannot combat. Muglin am sleepy now. Zzz.`);
                    this.mode = 'idle';
                    this.target = undefined;
                    this.fighting = {main: undefined, others: []};
                    io.to(this.location.RPS + '/' + this.location.GPS).emit('room_event', {echo: `An orchard muglin lost track of its target, glancing around warily.`});
                }
                this.actInterval = rando(2,4) * 1000;
                break;
            }
        }
        
        setTimeout(() => this.actOut(), this.actInterval);
        // HERE: assess self and situation, modify mode if necessary, and get going!
    }

    ouch(damageTaken, damageType) {
        // use this method to apply damage taken, apply injuries, and possibly amend behavior
    }

    ded() {
       // probably will rename :P
       // THIS: handle conversion into no-longer-alive status, including messaging the room, adding the body to the room, removing the mob from the room 
    }

}

function calcStats(entity) {
    // THIS: pass in an entity, calculate their derived and secondary stats based on their skills, stats, equipment, buffs, debuffs, injuries, etc.
    //  so, this SHOULD spit out a viable derivedStats object, meaning we can just go ahead and choose either to
    //  A) modify the entity directly, or B) RETURN the object and have any calling function do that for us
    // Hmm... for now, I think I'll go with (A). Pass in the entity and set its stats on the fly using the same criteria regardless of entity.

    /*
        Times to run this:
        -- creation
        -- equipment change
        -- status change
        -- ???


            ... I do like the idea of a main 'skill' and 'stat' for each weapon, along with 2~3 'speciality' perks (like +backstab, skinning, etc.) and a tech attached

            ... so, for now, maybe just rescale one "class" starter weapon, and just have 'Dekanax' be that class until further notice as we test

            Let's remodel how weapons/armor work.
            Simplify weapon... if it's a weapon, it raises ATK and/or MAG by some basic value, which itself is amplified by skill.
                -- reconfig the bonus from stats
            Example:
            Scrapping Sword - 15 base atk, fighting skill, strength stat, 'heft' (extra raw bonus damage from str)
            Thief Knife - 10 atk, 5 acc, sneaking, 'precision' (something-something crit rate/dmg)
                -- 'heft,' 'precision' are creation/crafting elements attached to the 'build' of the item, and calculate its base stats on creation
                -- listed in its build, not necessarily 'live' attributes

            @latest - items (weapons in particular)

            add:
                improvement potential (varname undecided, points spent/points available for customization)

            core stats for all weapons:
                damType (new: damage mod for moves & injury purposes)
                ATK, ACC, MAG, FOC - scale off main skill for that weapon
                (for scaling, we'll assume [skill + stat]% bonus... so 10 str and 10 fighting on a str-fighting weapon is 20% total boost to flat stats)
                


            body (armor)
            - primary source of defensive stats, protective qualities, protection techs
                DEF, EVA, RES, LUK - scale off main skill for that armor


            head
            - "fills in the gaps" depending on type of headgear (helmet enhances core defense, circlet, twist headband, etc.)
                can provide boosts to just about anything, which (as above) scale off the main skill for that piece of equipment


            accessories
            - generally, flat stats and flat effect gear (achieved through having no 'skill' attached to them)



            other qualities? -- 'killer' effects, injury parameters

            WEAPON EXAMPLE:
                newChar.equipped.rightHand = new Item(
                {
                    mainType: 'weapon', buildType: 'sword', subType: 'straight', range: 'melee', skill: 'fighting/1', stat: 'strength/1', slot: 'hands', hands: 1,
                    enhancements: 0, quality: 20
                },
                `Scapping Sword`,
                `Though not quite as hefty as a broadsword, this blade nevertheless features a thick cross-section suited to slashing, cleaving, or even crushing.`,
                {ATK: 15, ACC: 5, MAG: 5, FOC: 5},
                {size: 6, weight: 22, durability: 500, maxDurability: 500, materials: 'iron/3,wood/2', attributes: 'heft'},
                {physicalDamageBonus: 6},
                [],
                500
            );   

            FROM CLASS:
            class Item {
                constructor(type, glance, description, stat, build, effects, techs, value) {
                    this.type = type; // objectified - item type and subtypes, if applicable
                    this.glance = glance;
                    this.description = description;
                    this.stat = stat; // objectified - derivedStats in the format of atk: 'agi/50'
                    this.build = build; // objectified - size, weight, durability, materials, maybe level/quality/etc.
                    this.effects = effects; // object with stuff like physicalDamageBonus, injuryBonus, etc.
                    this.techs = techs;
                    this.value = value; // ideally derived from materials as well as skill/difficulty in its creation modified by overall concept of rarity, buuuut whatever for now
                    this.itemID = generateRandomID();
                }
            }

        Finally, STATS TO CALC:
        strength: 15, agility: 15, constitution: 15, willpower: 15, intelligence: 15, wisdom: 15, spirit: 15, 
        HP: undefined, HPmax: undefined, MP: undefined, MPmax: undefined, 
        ATK: undefined, MAG: undefined, DEF: undefined, RES: undefined, ACC: undefined, EVA: undefined, FOC: undefined, LUK: undefined

        Miiiiight have to improve the creation process and add at least basic perks to test this properly, buuuuut...
        ... we can definitely add skills, equipment, and base stats
        ... 

        Stuff to consider:
        -- perks: array of objects, iterate over to get totals (will define perks to have explicit and predictable stat boosts)
        -- skills: skills directly impact especially 'secondary' stats like ATK, etc.
        -- equipment: currently nothing is slated to provide 'flat' boosts, but rather have dependent boosts (that scale with relevant skill)
        -- effects

        Just made a "modifiers" object for character (will go and apply to other entities shortly if I like the name enough)
            -- modifiers to skills, rolls, etc. (stuff like swordDamage, skinningWhatever, so on -- choose keys carefully for quick access across any requesting purpose)

        Hm, effects is currently an object; pondering...
        ... does it make more sense to turn it into an array to iterate over? An array of objects?
        ... hm, what about stuff like poison? Bleeding? Want to be able to show that on the HUD.
        ... eh, can just collect effectTypes while iterating and slap 'em up there

        Here's our skill list: 
            fighting: 5
            gathering: 5
            sneaking: 0
            traversal: 0
            crafting: 0
            spellcasting: 0
            scholarship: 0
            sensing: 5
            building: 0
            medicine: 0
            Each skill raises a stat? Hm. By some modifier? 1-to-1 seems a lot to start with. Or not!
            ... or we can just have the skills be skills, and have bonuses come from perks and just let the skills dicate their own areas.


        ... ok. Now, let's think how (core) STATS influence (again point for point to begin with) stats...
        ... we can weight stats 'higher' and have each stat add 10 points. DONE :P (Just make sure the splits are balanced)
        ... this means that the total addition from stats should be +10 for each cumulatively

        strength: 10
        agility: 10
        constitution: 10
        willpower: 10
        intelligence: 10
        wisdom: 10
        spirit: 10
        ... eh, just have them calculated in different rolls. 
        

        ... gotta have a better concept for how MP is defined in this concept :P Right now it's just kind of "physical energy" which is skewing away from mental stats.

    */

    // STEP 1: calc 'base' stats -- str, agi, etc. (we now have access to stat.seed for the core stuff)
    // STEP 2: calc 'derived' stats -- HPmax, MPmax, ATK, MAG, etc.
    // note: for init() of characters and mobs and entities of the like, we'll set HP to max HP manually during the creation process/fxns
    // Deciding on stat rolls now. Here we go!

    // HERE: calc base stats boosted from perks (currently unavailable due to lack of perks :P)

    // Will likely add accelerating modifiers so that 1-to-1 skills can be upgraded later, but this is just a note for that in the future

    // Since we're going for a partially 'relative' situation (ATK vs DEF ratio, etc.), it makes sense to seed the stats -- starting with 10 across the board for now
    // Stats should always be at least 1, so they'll always be non-zero, but an extra boost should help round out "low number" issues a bit
    // Don't forget to factor in modifiers (from effects, etc.)
    // For MPmax, might 'decelerate' its growth by applying an MPmodifier variable attached to the entity later (to the non-seed portion)

    const eStat = entity.stat;
    const eSkill = entity.skill;
    // FIRST SECTION: 'base' substats
    entity.stat.HPmax = entity.stat.seed.HPmax;
    // Might have to set HP and MP, too, around here
    entity.stat.MPmax = entity.stat.seed.MPmax;
    if (!entity.stat.HP) entity.stat.HP = entity.stat.HPmax;
    if (!entity.stat.MP) entity.stat.MP = entity.stat.MPmax;

    // Will ultimately need to calc perks and such on top of these, and maybe modifiers as well
    eStat.strength = entity.stat.seed.strength;
    eStat.agility = entity.stat.seed.agility;
    eStat.constitution = entity.stat.seed.constitution;
    eStat.willpower = entity.stat.seed.willpower;
    eStat.intelligence = entity.stat.seed.intelligence;
    eStat.wisdom = entity.stat.seed.wisdom;
    eStat.spirit = entity.stat.seed.spirit;

    eStat.ATK = 5;
    eStat.MAG = 5;
    eStat.DEF = 5;
    eStat.RES = 5;
    eStat.ACC = 5;
    eStat.EVA = 5;
    eStat.FOC = 5;
    eStat.LUK = 5;

    // SECOND SECTION: equipment mods -- refer to comments section above for how those are modeled
    // Ok, I've decided the currently proposed model is not currently ideal. Let's simplify!
    /*
    newChar.equipped.rightHand = new Item(
        {
            mainType: 'weapon', buildType: 'sword', subType: 'straight', range: 'melee', skill: 'fighting/1', stat: 'strength/1', slot: 'hands', hands: 1,
            enhancements: 0, quality: 20
        },
        `Scapping Sword`,
        `Though not quite as hefty as a broadsword, this blade nevertheless features a thick cross-section suited to slashing, cleaving, or even crushing.`,
        {ATK: 15, ACC: 5, MAG: 5, FOC: 5},
        {size: 6, weight: 22, durability: 500, maxDurability: 500, materials: 'iron/3,wood/2', attributes: 'heft'},
        {physicalDamageBonus: 6},
        [],
        500
    );
    */
    if (entity.equipped.rightHand) {
        // do we need to check if mainType is weapon here? ... maybe?... let's say yes, always a weapon, tools checked automatically for tool-tasks
        // so, apply the .stat to the character, modified by the factor of skill.split('/')[0] by that [1]
        let skillModArray = entity.equipped.rightHand.type.skill.split('/');
        let skillMod = eSkill[skillModArray[0]] * skillModArray[1] / 100;
        let statModArray = entity.equipped.rightHand.type.stat.split('/');
        let statMod = eStat[statModArray[0]] * statModArray[1] / 100;
        let totalMod = 1 + skillMod + statMod;
        // CHANGE: let's turn all of the below into object-iterating for loops
        for (const statToBoost in entity.equipped.rightHand.stat) {
            eStat[statToBoost] += entity.equipped.rightHand.stat[statToBoost] * totalMod;
        }
        // eStat.ATK += entity.equipped.rightHand.stat.ATK * totalMod;
        // eStat.ACC += entity.equipped.rightHand.stat.ACC * totalMod;
        // eStat.MAG += entity.equipped.rightHand.stat.MAG * totalMod;
        // eStat.FOC += entity.equipped.rightHand.stat.FOC * totalMod;
    } else {
        // HERE: barehand calculations
    }

    if (entity.equipped.leftHand) {
        // console.log(`Something found in the left hand?`);
        // possibility of mainType here: weapon, shield

        // for (const statToBoost in entity.equipped.leftHand.stat) {
        //     eStat[statToBoost] += entity.equipped.leftHand.stat[statToBoost] * totalMod;
        // }
        if (entity.equipped.leftHand.type.mainType === 'weapon') {
            // Dualwield modifier comes into play here... which currently doesn't exist, so we're faking it for now :P
            let skillModArray = entity.equipped.leftHand.type.skill.split('/');
            let skillMod = eSkill[skillModArray[0]] * skillModArray[1] / 100;
            let statModArray = entity.equipped.leftHand.type.stat.split('/');
            let statMod = eStat[statModArray[0]] * statModArray[1] / 100;
            let totalMod = 1 + skillMod + statMod;
            for (const statToBoost in entity.equipped.leftHand.stat) {
                eStat[statToBoost] += entity.equipped.leftHand.stat[statToBoost] * totalMod  * (entity.modifiers.dualWieldMastery || 0.3);
            }
            // eStat.ATK += (entity.equipped.leftHand.stat.ATK * totalMod) * (entity.modifiers.dualWieldMastery || 0.3);
            // eStat.ACC += (entity.equipped.leftHand.stat.ACC * totalMod) * (entity.modifiers.dualWieldMastery || 0.3);
            // eStat.MAG += (entity.equipped.leftHand.stat.MAG * totalMod) * (entity.modifiers.dualWieldMastery || 0.3);
            // eStat.FOC += (entity.equipped.leftHand.stat.FOC * totalMod) * (entity.modifiers.dualWieldMastery || 0.3);
        }
        if (entity.equipped.leftHand.type.mainType === 'shield') {
            // Shield mastery is probably worth considering at some point, but for now, same logic as weapons, different stat spread
            let skillModArray = entity.equipped.leftHand.type.skill.split('/');
            let skillMod = eSkill[skillModArray[0]] * skillModArray[1] / 100;
            let statModArray = entity.equipped.leftHand.type.stat.split('/');
            let statMod = eStat[statModArray[0]] * statModArray[1] / 100;
            let totalMod = 1 + skillMod + statMod;
            for (const statToBoost in entity.equipped.leftHand.stat) {
                eStat[statToBoost] += entity.equipped.leftHand.stat[statToBoost] * totalMod;
            }
            // eStat.DEF += entity.equipped.leftHand.stat.DEF * totalMod;
            // eStat.EVA += entity.equipped.leftHand.stat.EVA * totalMod;
            // eStat.RES += entity.equipped.leftHand.stat.RES * totalMod;
            // eStat.LUK += entity.equipped.leftHand.stat.LUK * totalMod;
        }
    } else {
        // HERE: barehand calculations
    }
    if (entity.equipped.head) {
        let skillModArray = entity.equipped.head.type.skill.split('/');
        let skillMod = eSkill[skillModArray[0]] * skillModArray[1] / 100;
        let statModArray = entity.equipped.head.type.stat.split('/');
        let statMod = eStat[statModArray[0]] * statModArray[1] / 100;
        let totalMod = 1 + skillMod + statMod;
        for (const statToBoost in entity.equipped.head.stat) {
            eStat[statToBoost] += entity.equipped.head.stat[statToBoost] * totalMod;
        }
        // eStat.ATK += entity.equipped.head.stat.ATK * totalMod;
        // eStat.ACC += entity.equipped.head.stat.ACC * totalMod;
        // eStat.MAG += entity.equipped.head.stat.MAG * totalMod;
        // eStat.FOC += entity.equipped.head.stat.FOC * totalMod;
        // eStat.DEF += entity.equipped.head.stat.DEF * totalMod;
        // eStat.EVA += entity.equipped.head.stat.EVA * totalMod;
        // eStat.RES += entity.equipped.head.stat.RES * totalMod;
        // eStat.LUK += entity.equipped.head.stat.LUK * totalMod;
    } else {
        // HERE: barehead calculations :P
    }

    if (entity.equipped.body) {
        let skillModArray = entity.equipped.body.type.skill.split('/');
        let skillMod = eSkill[skillModArray[0]] * skillModArray[1] / 100;
        let statModArray = entity.equipped.body.type.stat.split('/');
        let statMod = eStat[statModArray[0]] * statModArray[1] / 100;
        let totalMod = 1 + skillMod + statMod;
        for (const statToBoost in entity.equipped.body.stat) {
            eStat[statToBoost] += entity.equipped.body.stat[statToBoost] * totalMod;
        }
        // eStat.DEF += entity.equipped.body.stat.DEF * totalMod;
        // eStat.EVA += entity.equipped.body.stat.EVA * totalMod;
        // eStat.RES += entity.equipped.body.stat.RES * totalMod;
        // eStat.LUK += entity.equipped.body.stat.LUK * totalMod;
    } else {
        // ohhhh myyyyyy
    }

    if (entity.equipped.accessory1) {
        // Idle thought: it prooooobably makes sense just to loop through the accessory and slap any found stats onto the entity :P
        for (const statToBoost in entity.equipped.accessory1.stat) {
            eStat[statToBoost] += entity.equipped.accessory1.stat[statToBoost];
        }
    }

    if (entity.equipped.accessory2) {
        for (const statToBoost in entity.equipped.accessory2.stat) {
            eStat[statToBoost] += entity.equipped.accessory2.stat[statToBoost];
        }
    }

    // HERE: final section, gotta Math.floor() everything (or parseInt()) because all this MATH in JS creates some interesting side effects :P
    // Probably just use a stat loop? Ignoring stat.seed, which won't be Math.floorable
    for (let nebulousStat in entity.stat) {
        if (nebulousStat !== 'seed') entity.stat[nebulousStat] = Math.floor(entity.stat[nebulousStat]);
    }

    // ... and I *think* that pretty much covers a proper stat setting session from scratch for now? Let's test it out!
    // ... right after I mod up the original character/create initial weapons to function properly with this new concept

}

const connectionParams = {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
};

mongoose.connect(process.env.DB_HOST, connectionParams)
    .then(() => console.log(`Successfully connected to With Friends database. That'll come in handy!`))
    .catch(err => console.log(`Error connecting to With Friends database: ${err}`));


let characters = {};
// Almost time to slide an ORCHARD goblin or two in here. ... should this be an array? Or we could do a key with like ~6 rando-ish digits plus mobname.
// Classes or constructor function is probably the way to go here! Ultimately we'll probably scoot them into separate files for readability.
let mobs = {};
// For now, my thinking is that NPC's are different from mobs. In future iterations, they can all kind of be loose entities with different definitions.
// Can set an 'activityLevel' that can be ramped up and down depending on how 'watched' they are, and a 'lastActionTime' to compare to
// ... so if the overall game loop gets back to our NPC here, and he's supposed to be idle, can do a time-check and just skip over if it's too recent
// ... can add a scaffold upon 'waking up' from idling to 'catch them up,' assuming there's somewhere or some self-driven state they should have been pursuing
// let npcs = {
//     'townguy': {
//         name: 'Taran Wanderer',
//         glance: 'a wandering townsperson',
//         mode: 'active/chilling',
//         location: {RPS: 0, GPS: '500,500,0'},
//         zoneLocked: true,
//         actions: {
//             'chilling': `Taran is looking idly heroic here.` // Probably eventually make this an array of possibilities
//         },
//         live: function() {
//             console.log(`What even is THIS? Maybe it's ${this.name}.`);
//             // let unpackedMode = this.mode.split('/');
//             // // let isActive = unpackedMode[0] === 'active' ? true : false;
//             // let actionMode = unpackedMode[1];
//             // switch (actionMode) {
//             //     case 'chilling': {
//             //         console.log(this.actions['chilling']);
//             //     }
//             // }
//         },
//         amAlive: setInterval(() => {
//             console.log(npcs['townguy'].actions['chilling']);
//         }, 15000)
//     }
// };

// A global npcs array, eh? Interesting, interesting. But what IF. We had an object whose keys were IDs. Eh? EHH?
// Maybe same for characters, though that's less fraught because names are kept 'pure' and non-colliding (hopefully).
// That said, having the same basic engine moving players, npcs, and mobs around would be pretty fantastic. Let's consider the objectification process.
let npcs = {};

// 'Birth of an NPC' process as it currently stands. We can functionalize this for the GameMaster!
let newGuy = new NPC('Taran Wanderer', 'a wandering townsperson', {RPS: 0, GPS: '500,500,0'}, `A young fellow with shoulder-length dark hair and wearing rough-worn traveler's attire.`);
populateRoom(newGuy);
newGuy.actOut();
npcs[newGuy.entityID] = newGuy;

function depopulateRoom(entity) {
    let roomArrayTarget = `${entity.entityType + 's'}`;
    // console.log(`Removing entity ${entity.name} from GPS ${entity.location.GPS}`);
    // console.log(`Ok! Current room PLAYERS include: ${JSON.stringify(zaWarudo[entity.location.RPS][entity.location.GPS][roomArrayTarget])}`);
    zaWarudo[entity.location.RPS][entity.location.GPS][roomArrayTarget] = zaWarudo[entity.location.RPS][entity.location.GPS][roomArrayTarget].filter((roomEntity) => roomEntity.id !== entity.entityID);
    // console.log(`Now post-filter fix: ${JSON.stringify(zaWarudo[entity.location.RPS][entity.location.GPS][roomArrayTarget])}`);
}

function populateRoom(entity) {
    // console.log(`Attempting to populate room with ${entity.entityID} who is ${entity.name} at new GPS ${entity.location.GPS}`);

    // We'll still stick with this 'entity stub' for now, but may have to move to just slotting the entire entity into the array depending on how interactions shape up
    let roomArrayObject = {
        id: entity.entityID,
        type: entity.entityType,
        name: entity.name || '',
        glance: entity.glance || '',
        description: entity.description || `This being is rather indescribable.`,
        level: entity.level || 1,
        fighting: entity.fighting || {main: {}, others: []},
        HP: entity.stat.HP || 100,
        condition: [] // asleep, stunned, not-so-alive, etc.
    }
    let entityRPS = entity.location.RPS || '0';
    zaWarudo[entityRPS][entity.location.GPS][`${entity.entityType + 's'}`].push(roomArrayObject);
}

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


function moveEntity(entity, direction, whiskTarget) {
    // 'Final' alpha concept of room-only. Keeping in RPS for now, might still be handy for instancing.

    // ADD: skill checking, if applicable, to see if the entity can proceed (currently there's no actual barrier :P)

    // Also, if the entity is a mob or NPC, gotta check zoneLocked. Seems inefficient, though; probably a better way to wrap stuff in their proper zone.

    if (whiskTarget) {
        // Funny variable name, I know, but basically a catch-all for PORTAL usage, being forcibly moved, teleporting, or other non-standard travel modes.

        // Anyway, whisking. We now have populateRoom(entity) and depopulateRoom(entity) to help us out here.
        // HERE, eventually: we can add the whiskType to see if anything would prevent it. For now, OFF WE GO! :D

        // whiskTarget is just GPS coords.
        
        depopulateRoom(entity);
        // console.log(`WHISK! I am trying to move ${entity.name} to ${whiskTarget}.`)
        entity.location.GPS = whiskTarget;
        entity.location.room = zaWarudo[entity.location.RPS][whiskTarget];
        // console.log(`${entity.name} is NOW LOCATED AT ${entity.location.GPS}!`);

        populateRoom(entity);
        return `Off you go!`;
    }

    if (entity.location.room.exits[direction]) {
        // HERE, at some point: checking to see if anything 'else' would restrict movement, like status or external factors not yet counted
        let roomArrayTarget;
        switch (entity.entityType) {
            case 'player': {
                roomArrayTarget = 'players';
                break;
            }
            case 'npc': {
                roomArrayTarget = 'npcs';
                break;
            }
            case 'mob': {
                roomArrayTarget = 'mobs';
                break;
            }
        }

        // Ok great! I now have a populateRoom(entity) function. Can use that here, it'll work fine. 
        // console.log(`I am attempting to move someone from the array target ${roomArrayTarget}.`);

        
        // zaWarudo[entity.location.RPS][entity.location.GPS][roomArrayTarget] = zaWarudo[entity.location.RPS][entity.location.GPS][roomArrayTarget].filter((roomEntityID) => roomEntityID !== entity.entityID);
        depopulateRoom(entity); // is THIS not working? hmmmm...
        let newRoomGPS = entity.location.room.exits[direction].to;
        entity.location.GPS = newRoomGPS;
        // zaWarudo[entity.location.RPS][entity.location.GPS][roomArrayTarget].push(entity.entityID);
        populateRoom(entity);
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
            return {long: 'north', short: 'n'};
        }
        case 'e': {
            return {long: 'northeast', short: 'ne'};
        }
        case 'd': {
            return {short: 'e', long: 'east'};
        }
        case 'c': {
            return {short: 'se', long: 'southeast'};
        }
        case 'x': {
            return {short: 's', long: 'south'};
        }
        case 'z': {
            return {short: 'sw', long: 'southwest'};
        }
        case 'a': {
            return {short: 'w', long: 'west'};
        }
        case 'q': {
            return {short: 'nw', long: 'northwest'};
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
                    charToLoad.whatDo = 'travel';
                    const alreadyInGame = addCharacterToGame(charToLoad);

                    if (alreadyInGame) res.status(200).json({type: `success`, message: `Reconnecting to ${charToLoad.name}.`, payload: {character: characters[charToLoad.entityID], token: token}})
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
                        charToLoad.whatDo = 'travel';

                        // This will probably only work a small subset of times, actually; socket disconnection removes the char from the game
                        const alreadyInGame = addCharacterToGame(charToLoad);

                        if (alreadyInGame) res.status(200).json({type: `success`, message: `Reconnected to live character.`, payload: {character: characters[charToLoad.entityID], token: token}})
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
    let { newChar } = req.body;
    newChar.backpack = {open: false, contents: [], size: 10, stackModifiers: {}};
    newChar.equipped = {
        rightHand: {},
        leftHand: {},
        head: {},
        body: {},
        accessory1: {},
        accessory2: {}
    };
    newChar.backpack = {contents1: [{glance: 'Thingamajig', description: `It appears to like to sing?`}, {glance: 'MacGuffin', description: `It's the very thing you were looking for!`}, {}, {}, {}, {}, {}, {}, {}, {}], contents2: [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}], contents3: null, contents4: null, size: 2, stackModifiers: {}};

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

    // parseBackground(newChar.background.first, newChar);
    // parseBackground(newChar.background.second, newChar);
    // parseBackground(newChar.background.third, newChar);
    newChar.stat = {};
    newChar.stat.seed = {HPmax: 100, MPmax: 15, strength: 10, agility: 10, constitution: 10, willpower: 10, intelligence: 10, wisdom: 10, spirit: 10};
    newChar.skill = {
        fighting: 0,
        gathering: 0,
        sneaking: 0,
        traversal: 0,
        crafting: 0,
        spellcasting: 0,
        scholarship: 0,
        sensing: 0,
        building: 0,
        medicine: 0
    };
    newChar.equipped = {rightHand: undefined, leftHand: undefined, head: undefined, body: undefined, accessory1: undefined, accessory2: undefined};

    switch (newChar.background.first) {
        case 'Gatherer': {
            // newChar.equipped.leftHand = new Item(
            //     {mainType: 'tool', buildType: 'dagger', subType: 'carving', range: 'melee', skill: 'gathering', slot: 'hands', hands: 1},
            //     `Outdoors Knife`,
            //     `A short, single-edged iron knife with a sharp edge and tip and a comfortable grip. It seems well-suited to all manner of practical activities, from 
            //     skinning to woodcarving.`,
            //     {atk: 'agi/30'},
            //     {size: 2, weight: 3, durability: 500, maxDurability: 500, materials: 'iron/1,wood/1'},
            //     {physicalDamageBonus: 3},
            //     [],
            //     500            
            // );
            newChar.skill.gathering = 10;
            break;
        }
        case 'Laborer': {
            // newChar.equipped.leftHand = new Item(
            //     {mainType: 'tool', buildType: 'hammer', subType: 'hammer', range: 'melee', skill: 'building', slot: 'hands', hands: 1},
            //     `Claw Hammer`,
            //     `A simple but durable hammer.`,
            //     {atk: 'str/30'},
            //     {size: 3, weight: 3, durability: 500, maxDurability: 500, materials: 'iron/1,wood/2'},
            //     {physicalDamageBonus: 3},
            //     [],
            //     500            
            // );   
            newChar.skill.building = 10;         
            break;
        }
        case 'Healer': {
            // newChar.equipped.leftHand = new Item(
            //     {mainType: 'tool', buildType: 'rod', subType: 'channeling', range: 'melee', skill: 'medicine', slot: 'hands', hands: 1},
            //     `Healer's Rod`,
            //     `About as long as your arm, no thicker than two fingers, this wood-handled rod ends in a simple copper end fashioned into a symbol of 
            //     peace and healing.`,
            //     {res: 'spi/30'},
            //     {size: 3, weight: 3, durability: 500, maxDurability: 500, materials: 'copper/2,wood/2'},
            //     {magicalDamageBonus: 3},
            //     [],
            //     500            
            // );   
            newChar.skill.medicine = 10;         
            break;
        }
    }

    switch (newChar.background.second) {
        case 'Mercenary': {
            newChar.equipped.rightHand = new Item(
                {
                    mainType: 'weapon', buildType: 'sword', subType: 'straight', range: 'melee', skill: 'fighting/1', stat: 'strength/1', slot: 'hands', hands: 1,
                    enhancements: 0, quality: 20
                },
                `Scapping Sword`,
                `Though not quite as hefty as a broadsword, this blade nevertheless features a thick cross-section suited to slashing, cleaving, or even crushing.`,
                {ATK: 12, ACC: 8, MAG: 3, FOC: 1},
                {size: 6, weight: 22, durability: 500, maxDurability: 500, materials: 'iron/3,wood/2', attributes: undefined},
                {intimidating: 5},
                [],
                500
            );
            newChar.skill.fighting = 10;          
            // newChar.equipped.rightHand = new Item(
            //     {mainType: 'weapon', buildType: 'sword', subType: 'straightblade', range: 'melee', skill: 'fighting', slot: 'hands', hands: 1},
            //     `Scapping Sword`,
            //     `Though not quite as hefty as a broadsword, this blade nevertheless features a thick cross-section suited to slashing, cleaving, or even crushing.`,
            //     {strength: 'ATK/50,DEF/30,ACC/10'},
            //     {size: 6, weight: 22, durability: 500, maxDurability: 500, materials: 'iron/3,wood/2'},
            //     {physicalDamageBonus: 6},
            //     [],
            //     500            
            // );
            break;
        }
        case 'Hedgewizard': {
            newChar.equipped.rightHand = new Item(
                {mainType: 'weapon', buildType: 'staff', subType: 'wizard', range: 'melee', skill: 'casting/1', stat: 'willpower/1', slot: 'hands', hands: 3, enhancements: 0, quality: 20},
                `Hedging Staff`,
                `Longer than the average person is tall, this staff has been meticulously carved to be almost entirely smooth and uniform in its wood finish. It 
                is topped with a simple copper fitting that houses a small sphere of topaz, presumably for amplifying magical intent and spellcasting focus.`,
                {ATK: 3, ACC: 1, MAG: 12, FOC: 8},
                {size: 5, weight: 3, durability: 500, maxDurability: 500, materials: 'copper/1,wood/4,topaz/1', attributes: undefined},
                {wizardly: 5},
                [],
                500            
            );
            newChar.skill.spellcasting = 10;
            break;
        }
        case 'Thief': {
            newChar.equipped.rightHand = new Item(
                {mainType: 'weapon', buildType: 'dagger', subType: 'stabbing', range: 'melee', skill: 'sneaking/1', stat: 'agility/1', slot: 'hands', hands: 1, enhancements: 0, quality: 20},
                `Snatcher's Dagger`,
                `It has a simple, just-long-enough grip below an elegantly long blade with two slender but razor-sharp edges. Its overall profile is very 
                minimalistic, making it very easy to conceal.`,
                {ATK: 8, ACC: 12, MAG: 2, FOC: 2},
                {size: 2, weight: 4, durability: 500, maxDurability: 500, materials: 'iron/2,wood/1', attributes: undefined},
                {stealthy: 5},
                [],
                500            
            );
            newChar.skill.sneaking = 10;
            break;
        }
    }

    switch (newChar.background.third) {
        /*
            Remodel basis: 
            newChar.equipped.rightHand = new Item(
                {
                    mainType: 'weapon', buildType: 'sword', subType: 'straight', range: 'melee', skill: 'fighting/1', stat: 'strength/1', slot: 'hands', hands: 1,
                    enhancements: 0, quality: 20
                },
                `Scapping Sword`,
                `Though not quite as hefty as a broadsword, this blade nevertheless features a thick cross-section suited to slashing, cleaving, or even crushing.`,
                {ATK: 15, ACC: 5, MAG: 5, FOC: 5},
                {size: 6, weight: 22, durability: 500, maxDurability: 500, materials: 'iron/3,wood/2', attributes: 'heft'},
                {physicalDamageBonus: 6},
                [],
                500
            );   
        */
        case 'Trader': {
            newChar.equipped.body = new Item(
                {mainType: 'armor', buildType: 'clothes', subType: 'cloth', skill: 'sensing/1', stat: 'spirit/1', slot: 'body', enhancements: 0, quality: 20},
                `Merchant Garb`,
                `The fancy clothes of an apsiring trader.`,
                {DEF: 12, EVA: 3, RES: 8, LUK: 1},
                {size: 4, weight: 15, durability: 500, maxDurability: 500, materials: 'cloth/4', attributes: undefined},
                {fancy: 5},
                [],
                500            
            );
            newChar.skill.sensing = 10;
            break;
        }
        case 'Scribe': {
            newChar.equipped.body = new Item(
                {mainType: 'armor', buildType: 'robes', subType: 'cloth', skill: 'scholarship/1', stat: 'intelligence/1', slot: 'body', enhancements: 0, quality: 20},
                `Scholar Robes`,
                `Simple, clean, and comfortable robes with a simply adorned collar and hem with patterns indicating the wearer is a scholastic professional.`,
                {DEF: 8, EVA: 1, RES: 12, LUK: 3},
                {size: 4, weight: 15, durability: 500, maxDurability: 500, materials: 'cloth/6', attributes: undefined},
                {scholastic: 5},
                [],
                500            
            );  
            newChar.skill.scholarship = 10;
            break;
        }
        case 'Runner': {
            newChar.equipped.body = new Item(
                {mainType: 'armor', buildType: 'gear', subType: 'leather', skill: 'traversal/1', stat: 'agility/1', slot: 'body', enhancements: 0, quality: 20},
                `Swift Gear`,
                `Minimalistic garb stitched together from snug but breathable cloth padded tactically here and there with pads of supple leather 
                to ensure ease of movement while still providing some critical protection where it counts.`,
                {DEF: 8, EVA: 12, RES: 2, LUK: 2},
                {size: 4, weight: 15, durability: 500, maxDurability: 500, materials: 'cloth/3,leather/3', attributes: undefined},
                {sleek: 5},
                [],
                500            
            );  
            newChar.skill.traversal = 10;
            break;
        }
        case 'Apprentice': {
            newChar.equipped.body = new Item(
                {mainType: 'armor', buildType: 'gear', subType: 'leather', skill: 'crafting/1', stat: 'constitution/1', slot: 'body', enhancements: 0, quality: 20},
                `Work Gear`,
                `Simple but sturdy clothing of thick cloth reinforced with layers of leather at the joints and extremities.`,
                {DEF: 12, EVA: 3, RES: 8, LUK: 1},
                {size: 4, weight: 15, durability: 500, maxDurability: 500, materials: 'cloth/4,leather/4', attributes: undefined},
                {dirty: 5, fireResist: 5},
                [],
                500            
            );  
            newChar.skill.crafting = 10;
            break;
        }
    }

    // HERE: calcStats, set HP/MP, prepare the character for 'real life' IG
    calcStats(newChar);
    
    if (error) res.status(406).json({message: error});

    // HERE: Make sure newChar.name isn't yet taken (scan DB in characters collection)
    Character.findOne({ name: newChar.name })
        .then(searchResult => {
            if (searchResult === null) {
                console.log(`Name for new character is available!`);
                // HERE: Craft the object that will be the foundation, including salt, hash from password and salt, and stats
                const salt = createSalt();
                const hash = createHash(newChar.password, salt);
                let newCharacter = new Character({
                    ...newChar,
                    entityID: generateRandomID(),
                    salt: salt,
                    hash: hash
                });
                // maybe do a newCharacter = new Character({...newChar, entityID: etc.}) ... see how that flies

                // ABOVE: throw up max HP and MP values, maybe equip them and get all their stats calc'd and initialized before saving and passing down

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


// Yup, this works! Awesome. Opens up possibility for zone messaging, independent room messaging, etc. But for now, lazy clouds in the origin room.
// Some rooms can have their own special messaging quirks/events, but mostly I'd leave it for zones and sub-zones (should I have subzones?)
// setInterval(() => {
//     io.to('0/500,500,0').emit('room_event', `Some clouds float by in the sky.`);
// }, 10000);


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
    let myCharacter = {name: 'The Great Serverman'}; // NOTE: this reference isn't fully dependable; the 'best' use of this right now is just a reference that's fixed, such as name
    let zoneString; // Areas should be set up to be automatically unique, so no worries here about setting this one
    let roomString; // If I end up setting this to the room's GPS coords, or key + GPS, that should ensure uniqueness

    socket.on('login', character => {
        console.log(`${character.name} has joined the game!`);
        if (!characters[character.entityID]) {
            console.log(`Oh! Not logged in yet on the server. Beep boop, fixing.`);
            addCharacterToGame(character);
        }
        roomString = character.location.RPS.toString() + '/' + character.location.GPS;
        socket.join(roomString);
        socket.join(character.name);
        socket.to(roomString).emit('room_event', {echo: `${character.name} just appeared as if from nowhere! Wowee!`});
        socket.join(zaWarudo[character.location.RPS][character.location.GPS].zone);
        populateRoom(character);
        myCharacter = characters[character.entityID]; // Quick 'fix' here to change the myCharacter reference... should hopefully repair all the busted nonsense?
    });

    /*
        PORTAL SHIELD
    {
        name: 'western town gates',
        type: 'portal',
        status: 'open',
        roomImage: undefined,
        description: ``,
        goes: {to: '450,500,0'}, // Can give this a try once ROOM STRUCTURES are operational!
        onInteract: undefined,
        keyboardInteract: undefined
    }    
    */

    socket.on('action', actionData => {
        // Woof. Ok, is it time to update the client/server to parse room_event, own_action_result with more meaningful data?
        // Ok, so this is a good opportunity to let the CLIENT do some lifting now! Cool!
        // Think of different scenarios... someone talking to an NPC, trying to do an action that may be hidden, fighting...
        // Note that mobs and rooms can ONLY interact with 'room_event' ... so can't rely on own_action_result for pronoun/nth-person accuracy
        switch (actionData.action) {
            // Ok, so we're setting this up to be a passed object of the format {action: ACTION_TO_RESPOND_TO}...
            // And then we can just add whatever other actions and data we want/need.
            case 'talk': {
                // HERE, eventually: see if char CAN talk before just babbling away :P
                let amendedText = actionData.message[0].toUpperCase() + actionData.message.slice(1); // can add 'language cleanup' fxn on this later as well
                let finalCharacter = amendedText[amendedText.length - 1];
                if (finalCharacter !== '.' && finalCharacter !== '?' && finalCharacter !== '!') amendedText += '.';
                socket.to(roomString).emit('room_event', {echo: `${myCharacter.name} says, "${amendedText}"`});
                socket.emit('own_action_result', {echo: `You say, "${amendedText}"`});
                break;
            }
            case 'npcinteract': {
                // receiving actionData.target of entity's ID, pass back useful information here for the npcinteract client to work with

                // NOTE: this is pretty good so far, but we can add an 'initial greeting' concept somewhere, as well (and/or pull it from the NPC themselves)
                let responseObj = {
                    type: 'npcdata',
                    echo: `You approach ${npcs[actionData.target].glance} and begin a conversation.`,
                    data: {...npcs[actionData.target]} // just sending the whole-arse NPC down, good job :P
                }
                socket.emit('own_action_result', responseObj);
                socket.to(roomString).emit('room_event', {echo: `${myCharacter.name} approaches ${npcs[actionData.target].glance} and begins a quiet conversation.`});
                break;
            }
            case 'npcinteraction': {
                // not confusing at all that this is named so similarly to the above :P
                // socket.emit('own_action_result', {type: 'npcresponse', data: {}});
                
                // Ok, so! We can now pass the actionData.menu, the button that was booped. We should respond accordingly.
                // Some types we can account for: Talk, Ask, Buy, Sell, Train?, Quest?
                // Honestly, the webclient is handling 'Talk' for us pretty well at the moment, so let's not worry about that right now.
                // It's not too hard to reconfigure two things:
                // 1) what we're receiving from the client to look up on the NPC
                // 2) what we're sending back as an own_action_result package, which can be type: npcresponse?
                // However, have to make sure that we're able to appropriately update the client's current NPC interaction menu accordingly.

                // Summary: rejigger the client to respond properly to incoming data, including resetting viewIndex for sub-menus (first option BACK)

                /*
                MODEL:
                this.interactions = {
                    'Talk': 
                    {
                        'prompt': `${this.name} regards you with curiosity as you approach.`,
                        0: `Sure is lovely weather, isn't it? I don't even remember the last time it was dark out.`,
                        1: `They call me Taran Wanderer, which is funny, because I've never once moved from this spot.`,
                        2: `I feel very well-read.`,
                        3: `Did you know there are orchard muglins out the west gate? They seem like some good low-level hunting!`
                    },
                    'Ask': {
                        'prompt': `I'm afraid I'm new around here, so I can't really answer any of your questions... I'm sorry.`,
                        'Your name?': `Ah! Well, I can tell you that. My name is Taran.`
                    },
                    // can add other interactions here as inspiration strikes
                 }
                */

                 // Ok, let's aim to receive an ACTION ('Buy'), TARGET (id), and GOAL (item to buy, tech to try to learn, etc.)

                // This is the most basic version: drill down one layer. We run into trouble if there are no further layers, though. :P
                // Should probably divide between what's being currently requested and the result we give; ASK vs BUY should open up quite different concepts
                let responseObj = {
                    type: 'npcresponse',
                    data: {...npcs[actionData.target].interactions[actionData.menu]},
                    echo: `You try to do a thing with an NPC based on the menu item ${actionData.menu}.`
                }
                // CHANGE: delete prompt from the key-value, include it elsewhere
                socket.emit('own_action_result', responseObj);
                break;
            }
            case 'forage': {
                socket.to(roomString).emit('room_event', {echo: `${myCharacter.name} roots around the area for a moment, but doesn't appear to find anything interesting.`});
                socket.emit('own_action_result', {echo: `You forage around the area for a moment, but realize you have no idea what you're doing.`});
                break;
            }
            case 'hide': {
                socket.emit('own_action_result', {echo: `You attempt to hide, but can't quite seem to figure out how yet. How embarrassing.`});
                socket.to(roomString).emit('room_event', {echo: `${myCharacter.name} attempts to hide, but can't seem to figure out how.`});
                break;
            }
            case 'search': {
                socket.emit('own_action_result', {echo: `You search the area, but nobody can hide yet, sooooo.`});
                socket.to(roomString).emit('room_event', {echo: `${myCharacter.name} scans the area with a dull expression.`});
                break;
            }
            case 'interact_with_structure': {
                // We need the INDEX, then we figure out what kind of structure it is, and act accordingly
                let myRoomStructures = zaWarudo[myCharacter.location.RPS][myCharacter.location.GPS].structures;
                console.log(`${myCharacter.name} wants to do a structure interaction, index ${actionData.index}. They are standing in ${myCharacter.location.room.room}. Hopefully.`);
                // Yup. The above is... frequently borked. Keeps thinking I'm in places I'm not.
                if (myRoomStructures.length === 0) break;
                let myStructureType = myRoomStructures[actionData.index].type;
                // if (myStructureType === 'portal') {
                //     socket.emit('own_action_result', `You want to access a portal called ${myRoomStructures[actionData.index].name} from ${myCharacter.location.room.room}, but can't figure out how.`);
                //     break;
                // }
                switch (myStructureType) {
                    case 'portal': {
                        // console.log(`A character wants to go through a portal using the number key. Let's try it!`);
                        // console.log(`Specifically, we're at ${myCharacter.location.GPS} and heading through to ${myCharacter.location.room.structures[actionData.index].goes.to}`)
                        let portalName = myCharacter.location.room.structures[actionData.index].name;
                        let roomString = `${myCharacter.location.RPS}/${myCharacter.location.GPS}`;
                        socket.to(roomString).emit('room_event', {echo: `${myCharacter.name} went through ${portalName}`});
                        socket.leave(roomString);                        
                        moveEntity(myCharacter, null, myCharacter.location.room.structures[actionData.index].goes.to);
                        roomString = `${myCharacter.location.RPS}/${myCharacter.location.GPS}`;
                        socket.join(roomString);
                        socket.to(roomString).emit('room_event', {echo: `${myCharacter.name} just arrived through ${portalName}.`}); // Might have to change. Or not!
                        socket.emit('own_action_result', {echo: `You move through the ${portalName} to ${myCharacter.location.room.room}.`});
                        socket.emit('moved_dir', {newLocation: myCharacter.location});
                        break;
                    }
                    case 'shop': {
                        socket.emit('own_action_result', {echo: `You wish to go shopping! But can't figure out how. Awkward.`});
                        break;
                    }
                    default: {
                        console.log(`Hm. No currently interactable structure found. It's all for show. Oh well!`);
                        break;
                    }
                    // HERE: add the other, non-portal structure types
                }
                break;
            }
            // Ok, this worked great before, doesn't really work so well anymore, so re-assess this after fixing number-nav.
            // Actually, the below ALWAYS worked until I added the above. Something about the above is... unhappy.
            case 'enter_portal': {
                // Alright! We're being passed the NAME of the structure. Good start. actionData.target is the string for the name.
                // Above is the FORMAT for the room structures. Lives in an array, so we need to grab that, or find whether it exists at all.
                let existingPortal = undefined;
                if (myCharacter.location.room.structures.length > 0) {
                    existingPortal = myCharacter.location.room.structures.filter(struct => struct.name === actionData.target);
                    existingPortal = existingPortal[0];
                    // HERE, eventually: do any skill/status checks that would apply ... or let the moveEntity handle it down the road, but will have to feed it more data
                    console.log(`I am going to new coords! They are ${existingPortal.goes.to}`)
                    moveEntity(myCharacter, null, existingPortal.goes.to);
                    socket.emit('own_action_result', {echo: `You move through the ${existingPortal.name} to ${myCharacter.location.room.room}.`});
                    socket.emit('moved_dir', {newLocation: myCharacter.location});
                } else socket.emit('own_action_result', {echo: `BONK! You can't figure out that portal at all!`});
                break;
            }
            default: 
                socket.emit('own_action_result', {echo: `You try to do a thing, but for some reason can't figure out what you're doing or how to do it.`});
                break;
        }
    });


    socket.on('movedir', mover => {
        // HERE: use the request from the client to plug into the character and le GO
        const moveChar = characters[mover.who];
        if (moveChar === undefined || moveChar.location === undefined) return;

        // SOMEWHERE AROUND HERE: see if the character has left the Zone to update zone socket :P

        let oldGPS = moveChar.location.GPS;

        const direction = keyToDirection(mover.where);
        let walkResult = {
            feedback: moveEntity(moveChar, direction.short),
            newLocation: moveChar.location
        };

        let newGPS = moveChar.location.GPS;

        if (oldGPS !== newGPS) {
            // Movement actually occurred! Change room subscriptions while emitting properly.
            socket.to(roomString).emit('room_event', {echo: `${moveChar.name} just went wherever the ${mover.where} key takes them.`});
            socket.leave(roomString);
            roomString = moveChar.location.RPS.toString() + '/' + moveChar.location.GPS;
            socket.join(roomString);
            socket.to(roomString).emit('room_event', {echo: `${moveChar.name} just arrived. Hi!`});
            socket.emit('own_action_result', {echo: `You move ${direction.long} to ${moveChar.location.room.room}.`});
        }


        socket.emit('moved_dir', walkResult);
    });

    // Fascinating. Yeah, myCharacter is holding some STALE-ASS data most of the time. WTF. If I can fix that, we'll be GOLDEN (hearts get broken).
    // setInterval(() => {
    //     socket.emit(`own_action_result`, `You are standing at ${myCharacter.location.room.room}.`)
    // }, 1000);

    socket.on('disconnect', () => {
        socket.to(roomString).emit('room_event', {echo: `${myCharacter.name} just disappeared in a puff of smoke! Wow!`});
        console.log(`Client has disconnected from our IO shenanigans. Goodbye, ${myCharacter.name}!`);
        if (myCharacter.name !== 'The Great Serverman') removeCharacterFromGame(myCharacter);
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
    if (characters[character.entityID] === undefined) {
        character.location.room = zaWarudo[character.location.RPS][character.location.GPS];
        characters[character.entityID] = character;
        return true;
    }
    return false;
    // Just added the true/false there -- this is to allow down-the-road handling of trying to log in an already-playing user
}

// Can probably generalize it to mobs and npcs as well. We'll see!
function removeCharacterFromGame(character) {
    // HERE: add save to DB before removing from server-space
    // const targetLocation = characters[character.entityID].location;
    // zaWarudo[targetLocation.RPS][targetLocation.GPS]['players'].filter(playerID => playerID !== character.entityID);
    depopulateRoom(character);
    if (character.name !== undefined) {
        const filter = { name: character.name };
        const update = { $set: characters[character.entityID] };
        const options = { new: true, useFindAndModify: false };
        Character.findOneAndUpdate(filter, update, options)
        .then(updatedResult => {
            console.log(`${updatedResult.name} has been updated. I have saved them as being at ${updatedResult.location.room.room}. Disconnecting from game.`);
            delete characters[character.entityID];
        })
        .catch(err => {
            console.log(`We encountered an error saving the character whilst disconnecting: ${err}.`);
            delete characters[character.entityID];
        })
    }
}

// Actually, probably get everything online BEFORE the server starts listening. :P
// Tap the DB, load up everything in their current state(s), load up all spells and abilities, fire up NPC's and such, prepare the field for everything to load properly
//      and sequentially (don't load NPC's before their abilities exist, for example)

// THIS: the GameMaster object sees all and dictates things happening in the game; a rudimentary "meta AI" dictating everything
// Define it, then have a method of GameMaster.wake() or something to get it going
// Right now we have a loose room that just emits clouds floating by, which is lovely, but we can extrapolate through the GM
/*
    This will be built to handle:
    -- weather
    -- area creation/destruction
    -- mob spawning
    -- NPC spawning, maybe
    -- "events" (raids, etc.)

    How will it accomplish all this? Greaaaat question. :P Internal Interval-driven methods is what I'm thinking at this point.
*/
const GameMaster = {};

let orchardGoblinSpawn = new SpawnMap(
    [{mobClass: orchardGoblin, mobLevelRange: '1-1', frequency: 1}], 
    10, 
    ['400,575,0','400,550,0', '400,600,0', '375,550,0', '375,575,0', '375,600,0', '425,550,0', '425,575,0', '425,600,0'], 
    {spawnPerRoom: 1, groupSize: 1, playerSpawnPreference: 1, baseSpawn: 1, extraPlayerSpawn: 1, maxSpawn: 6}  
);
orchardGoblinSpawn.init();

// THIS SECTION: basic abilities/actions
function strike(attackingEntity, defendingEntity) {
    // THIS: the most basic attack, just whack 'em with your weapon
    // Considerations: relevant stats, equilibrium, stance, changes to both on both sides
    // Call any relevant decrement methods on entities for damage/expended energy here as well, such as .ouch(amount, type)

    // Can set 'move parameters' and/or 'move modifiers' at the top of this function to 'simplify' making other techniques

    // Model changes to EQL and stance here, as well as effects to both
    // EQL is 100-point scale, and stance defaults @300 and goes from -599 to 599 (if I recall correctly)
    // Just modified stance to be 0 by default, rather than 'bonus high' by default :P

    // Let's say at MAX EQL, the strike always gives some STANCE
    // At minimum EQL, it always costs some
    // What's the EQL cost? Let's say... 30! Immediate cost.
    // AGI boosts/mitigates the effect somewhat
    // ... side note, gotta implement EQL REGEN (we'll say 10 points/sec, so fully depleted is a 10 sec recharge for now)

    // Ok! Muglin has 14 ATK, 10 STR. How does damage play out?
    // This is a super basic move, so pretty low mods is fine. 
    // First, for this, it's ATK vs DEF, and ACC vs EVA. 
    // We'll start by checking ACC vs EVA to determine whether the attacker hits, is partially avoided, or entirely avoided.
    // 

    // HERE: Check if at least 30 EQL is present on attacker
    if (attackingEntity.equilibrium < 30) return `${attackingEntity.name || attackingEntity.glance} can't attack due to being off-balance!`;

    // Quick brainstorm... so, stance is -599 (stumbling, totally off-balance) to 599 (nimble, perfectly poised)
    // Let's say at 0 stance, we're looking at 50-100% of your stats as variance
    // At 500+ stance, 100-125
    // At -500 stance, 0-75
    // HERE: Modify and roll variance on all ATK/DEF/ACC/EVA for both parties, set effectiveStats for each
    const attackerStanceNum = Math.floor(attackingEntity.stance / 10);
    const defenderStanceNum = Math.floor(defendingEntity.stance / 10);
    const attackerStanceModifier = rando(50 + attackerStanceNum,100 + (attackerStanceNum / 2));
    const defenderStanceModifier = rando(50 + defenderStanceNum,100 + (defenderStanceNum / 2));

    const modAttackerATK = Math.floor(attackingEntity.stat.ATK * (attackerStanceModifier / 100));
    const modAttackerACC = Math.floor(attackingEntity.stat.ACC * (attackerStanceModifier / 100));
    const modDefenderDEF = Math.floor(defendingEntity.stat.DEF * (defenderStanceModifier / 100));
    const modDefenderEVA = Math.floor(defendingEntity.stat.EVA * (defenderStanceModifier / 100));

    // Hm, it's definitely worth making a function for the above for future techniques, rather than having to copy-paste that


    // Ok, so how are we going to do ACC vs EVA? Let's see....
    // We also have the ATK vs DEF below. Well, since we have accuracy of attacks as a mod, having the ATK/DEF start at 50% doesn't make as much sense.
    // So, we already have the modified values, and we can decide how 'accurate' the attack was, and use that result to modify the final damage figure
    // How much 'relative' vs absolute? Probably should stick with absolute figures. ACC / EVA
    // So 1-to-1 accuracy and evasion is 50% modifier to damage
    // 2-to-1 accuracy 70%? 3-to-1 90%? Caps at 3.5-to-1 (100% accuracy), then adds a ton of bonus crit after that?
    // 1-to-2 accuracy 30%? 1-to-3 10%? Basically always missing at 1-to-3.5?
    // So, every 0.5 adds or subtracts 10% core accuracy under this model

    
    let baseAccuracy = 50;
    let accuracyMod = modAttackerACC / modDefenderEVA;

    // HERE: let's roll for a random dodge before we go further!

    if (accuracyMod >= 1) accuracyMod = Math.floor(10 * ((accuracyMod - 1) / 0.5))
    else accuracyMod = Math.floor(10 * ((modDefenderEVA / modAttackerACC - 1) / 0.5)) * -1;
    baseAccuracy = (baseAccuracy + accuracyMod) / 100;
    // ADD: amp crit as well for baseAccuracy > 1
    if (baseAccuracy > 1) baseAccuracy = 1;
    if (baseAccuracy < 0) return `${attackingEntity.name || attackingEntity.glance[0].toUpperCase() + attackingEntity.glance.slice(1)} strikes, but completely misses the target!`;
    
    

    // HERE: ATK vs DEF
    // Running with ATK/3 + strength/5 for base damage, reduced directly by DEF/5 + con/10
    // Gobbo was doing all of 0-1 damage to us, so let's tweak this to be HIGH OCTANE INSANITY, damage WAY UP! :P
    // Ok! Now we're getting hit for 10 per strike. Like, exactly, each time, so variance could be... more variable.
    // Actually, just taking the muglin's default stance from 300 to 0 fixed this up nicely...
    // So, having a little more variance in the higher stances might be good? We'll see.
    let rawDamage = modAttackerATK * attackingEntity.stat.strength / 5;
    let rawMitigation = modDefenderDEF / 3 + defendingEntity.stat.constitution / 10;
    const totalDamage = Math.floor((rawDamage - rawMitigation) * baseAccuracy);

    // HERE: Apply damage, change stance
    // ... after testing all of the above, first :P ... we'll just do output testing for now

    // HERE: Deduct cost of the maneuver
    attackingEntity.equilibrium -= 30;

    // HERE: if attackingEntity.entityType === 'player' calcExp();

    return `${attackingEntity.name || attackingEntity.glance[0].toUpperCase() + attackingEntity.glance.slice(1)} strikes at ${defendingEntity.name || defendingEntity.glance} for ${totalDamage} points of damage!`;
}

function smite(attackingEntity, defendingEntity) {
    // THIS: the most basic MAGIC attack, just slap 'em with raw magic energy
    // model its basics off of strike, a little stronger and slower, with a slight MP cost potentially (strike is 'free')
}

function logSplitter(attackingEntity, defendingEntity) {
    // DEF break finisher axe attack
}

function goblinPunch(attackingEntity, defendingEntity) {
    // THIS: the almighty GOBLIN PUNCH, possibly the only special maneuver the orchard muglin knows!
}

server.listen(PORT, () => console.log(`With Friends server active on Port ${PORT}.`));



/*
    AROUND HERE, PROBABLY: some handlers, one for popping new mobs/NPC's (back) into existence and 'starting them up', and one for loading from DB when server (re)starts

*/

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