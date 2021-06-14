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
    // console.log(`Random Seed result: ${randomSeed}`);
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
        - Weapons, Armor, Spells, Herbs, ___?
        - Trainers? 
        - Some roads and shape to the place, and a river that is present in some sense
    WEST FIELDS:
        - Orchard (goblins!)
        - Farmlands
    
    -- Swampy Area (bog rats)
    -- Wooded Area (trolls)
        
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
                'sw': {to: '375,525,0', traversal: 'walk/0', hidden: 0},
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
                'ne': {to: '400,500,0', traversal: 'walk/0', hidden: 0}
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
        // RUN should check on the status of all stored IDs, count up the remaining live ones, and respond accordingly
        this.mobs = this.mobs.filter(mob => {
            return mobs[mob] !== undefined;
        });

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

        // console.log(`The room at ${spawnLocation} looks good. Let's plop down a mob!`);
        // Ohhhhhh ok so let's track it back here. Make sure the entityID is working properly...
        const newMob = new classMob(spawnLocation);
        newMob.init();
        // console.log(`A new mob has been created! Its ID is ${newMob.entityID}`);
        mobs[newMob.entityID] = newMob; // do I have to do a deep copy, or will this be sufficient?

        // console.log(`The global MOBS list for this entry is now ${JSON.stringify(mobs[newMob.entityID])}.`);

        populateRoom(newMob);
        io.to(`${newMob.location.RPS}/${newMob.location.GPS}`).emit('room_event', {echo: newMob.spawnMessage});
        

        // hmmmm ok maybe locally define, make a deep brand-new copy in global mobs list, then throw the entityID into the local mobs list
        

        this.mobs.push(newMob.entityID); // just entityID, for referencing their alive-or-dead status
        
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
            seed: {HPmax: 80, MPmax: 15, strength: 10, agility: 10, constitution: 10, willpower: 5, intelligence: 5, wisdom: 5, spirit: 10},
            strength: undefined, agility: undefined, constitution: undefined, willpower: undefined, intelligence: undefined, wisdom: undefined, spirit: undefined,
            HP: undefined, HPmax: undefined, MP: undefined, MPmax: undefined,
            ATK: undefined, MAG: undefined, DEF: undefined, RES: undefined, ACC: undefined, EVA: undefined, FOC: undefined, LUK: undefined
        };
        this.skill = {
            fighting: 10,
            gathering: 10,
            sneaking: 0,
            traversal: 0,
            crafting: 0,
            spellcasting: 0,
            scholarship: 0,
            sensing: 10,
            building: 0,
            medicine: 0
        };
        this.effectiveSkill = {};
        this.hidden = 0;
        this.backpack = {contents: []}; // stealable goodies? ... let's say yes! We can populate some fruit in here on future iterations
        this.wallet = {gems: [], coins: [0, 0, 0, 0]}; // thinking this will be 'stealable' money/gems
        this.mode = 'idle'; // gotta define modes and such, too, like wandering, self-care (later), etc.... may want to set 'default' names for ease and later mobs
        this.injuries = {}; // haven't decided how to define these quite yet
        this.modifiers = {};
        this.equilibrium = 100;
        this.stance = 0;
        this.equipped = {rightHand: undefined, leftHand: undefined, head: undefined, torso: undefined, accessory: undefined, trinket: undefined};
        this.target = undefined;
        this.flags = {dead: false}; // for later-- mark when they've been stolen from, or other sundry attributes we need to slap on
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
        // ADD: corresponding fruit(s) in various states of quality related to the muglin's appearance
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
            `A simplistic sickle-like knife made of meticulously shaped stone. Its handle is wrapped in leather crusted with dried sugar.`,
            {ATK: 8, ACC: 8, MAG: 5, FOC: 3},
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
        // console.log(`Let's look at this new muglin's stats now! They've got: ${JSON.stringify(this.stat)}`)

        this.actInterval = 8000;
        setTimeout(() => this.actOut(), this.actInterval);
    }

    actOut() {
        if (this.flags.dead) return;
        if (this.fighting.main !== undefined) this.mode = 'combat';
        if (this.fighting.main === undefined && this.fighting.others.length > 0) {
            this.fighting.main = this.fighting.others[1];
            this.fighting.others = this.fighting.others.slice(1);
        }
        // basic orchard muglin behavior: they do colorful nothing, search the area, or ATTACK! ... they're aggressive, so will always attack if they see player(s)
        // HERE: define 'seenPlayers' as array of attackables... once hiding is a thing

        // HERE: the actInterval has expired, so we can increment EQL by that amount / 100
        this.equilibrium += this.actInterval / 100;
        if (this.equilibrium > 100) this.equilibrium = 100;

        // Kind of a hack-y way to drift back towards 0; having a separately running internal timer would be more precise, but also more intensive, I imagine
        if (this.stance > 0) this.stance -= Math.floor(5 * (this.actInterval / 1000));
        if (this.stance < 0) this.stance += Math.floor(5 * (this.actInterval / 1000));
        if (Math.abs(this.stance) < 5) this.stance = 0;

        switch (this.mode) {
            case 'idle': {
                // Currently 'idle' just means 'not attacking anybody'... change to more nuanced behavior later
                if (zaWarudo[this.location.RPS][this.location.GPS].players.length > 0) {

                    // Change for above, eventually: do a scanRoom() function or such to create an array of detected players, then ultimately act based on that
        
                    // Currently just arbitrarily smacking whichever player is the first name in the room. Can add some nuance later. :P
                    this.fighting.main = characters[`${zaWarudo[this.location.RPS][this.location.GPS].players[0].id}`].entityID; // later: fix to include seenPlayers array length, and change to seenPlayers array instead
                    // console.log(`Rawr! Now targeting: ${JSON.stringify(this.target.name)}`);
                    // This if-else below, while kind of odd to read, essentially slots this muglin into the target's fighting object in the proper spot
                    // ... this should DEFINITELY be extrapolated out into a 'set up combat for player(s)' function
                    if (characters[this.fighting.main].fighting.main === undefined) characters[this.fighting.main].fighting.main = this.entityID
                    else characters[this.fighting.main].fighting.others.push(this.entityID); 
                    this.mode = 'combat';
        
                    // Hm, interesting, the 'second' muglin onwards tends to not end combat properly...
                    // I'm thinking it's due to, when player attacks first, the code for selecting target gets a little weird?
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
                    
                } else io.to(this.location.RPS + '/' + this.location.GPS).emit('room_event', {echo: `An orchard muglin mumbles to itself as it skulks from tree to 
                tree, scanning back and forth between branches and roots.`});
                this.actInterval = rando(3,8) * 1000;
                break;          
            }
            case 'combat': {
                // We can do very basic logic here for which of the all of two moves the muglin knows, but for other future mobs, maybe have a more modular combat logic
                //  (i.e. an object and basic AI typing that can be inserted into the constructor)
                if (characters[this.fighting.main] === undefined) {
                    // Helpful catch in case the player logs off or is logged off during combat
                    this.mode = 'idle';
                    this.target = undefined;
                    this.fighting = {main: undefined, others: []};
                    return io.to(this.location.RPS + '/' + this.location.GPS).emit('room_event', {echo: `An orchard muglin lost track of its target, glancing around warily.`});
                }

                if (this.stance < -200) {
                    io.to(characters[this.fighting.main].name).emit('combat_event', {echo: `The muglin stumbles and takes a quick step backwards, trying to shore up its awkward footing.`, type: 'combat_msg'});
                    io.to(this.location.RPS + '/' + this.location.GPS).emit('room_event', {echo: `The muglin stumbles awkwardly, mumbling to itself as it takes a step back to get its footing back.`});
                    this.actInterval = 4000;
                    break;
                }

                if (this.location.GPS === characters[this.fighting.main].location.GPS) {
                    // later: amend to see if target is visible, assess muglin's current state to see what actions are possible, and update accordingly
                    // for now: attack!
                    // basic logic: normal attacks, with the occasional goblin punch; goblin punch becomes more likely at lower HP?

                    
                    let attackResult = strike(this, characters[this.fighting.main]);
                    // HM. Instead of echo-ing to a character, we could echo to a party or combat instance?
                    io.to(characters[this.fighting.main].name).emit('combat_event', {echo: attackResult, type: 'combat_msg'});
                    // io.to(characters[this.fighting.main].name).emit('combat_event', {echo: `The muglin wants to use its ${this.stat.ATK} attack power on you!`, type: 'combat_msg'});
                    io.to(this.location.RPS + '/' + this.location.GPS).emit('room_event', {echo: `The muglin takes a swipe at ${characters[this.fighting.main].name}!`});

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
        this.stat.HP -= damageTaken;
        if (this.stat.HP <= 0) return this.ded(damageTaken);

        // Any other behavior changes can occur around here

        return `dealing ${damageTaken} damage!`;
    }

    ded(damageTaken) {
       // THIS: handle conversion into no-longer-alive status, including messaging the room, adding the body to the room, removing the mob from the room
       this.flags.dead = true;

       // NOTE: Commented out the below io.to due to the fact the 'slaying it' is handled elsewhere and AFTER this part, so they die before they die. :P
       // io.to(this.location.RPS + '/' + this.location.GPS).emit('room_event', {echo: `An orchard muglin is struck down!`});
       // io.to(characters[this.fighting.main].name).emit('combat_event', {echo: `Your mighty blow has SLAIN the muglin!`, type: 'combat_msg'});
       
       // Below: remove this entity from everybody's fighting object
       // Right now, it's a bit flawed because it assumes a single player fighting this fella as the main only
       // Do some filtering hijinks
    //    if (characters[this.fighting.main].fighting.main === this.entityID) io.to(characters[this.fighting.main].name).emit('character_data', {type: 'fighting_update', roomData: undefined, newFightingObj: {main: '', others: [...characters[this.fighting.main].fighting.others]}});
    //    if (this.fighting.others.length > 0) {
    //        for (let i = 0; i < this.fighting.others.length; i++) {
    //            // This iterates through every player/entity who has this muglin in their fighting.others array
    //            // characters[this.fighting.others[i]]
    //        }
    //    }

       // Hm. Ok, so we need to go through the entirety of this mob's fighting object, look up all characters, amend their fighting objects to delete this entity,
       // then send those new fighting objects down to their owners.
       // NOTE: this won't work properly unless we make absolutely sure to establish dual-directionality of the fighting object...
       //   that is to say, any player attacking a mob must pop themselves into the mob's fighting object (main or others), and vice versa if there
       //   is *any* combat 'relationship' between them

       // Also, let's actually send the new roomData for this entity's room so the client can update the view properly

    //    zaWarudo[this.location.RPS][this.location.GPS].mobs = zaWarudo[this.location.RPS][this.location.GPS].mobs.filter(mob => mob.id !== this.entityID);

        // HERE: Add corpse to room?
       depopulateRoom(this);

       if (characters[this.fighting.main].fighting.main === this.entityID) {
           characters[this.fighting.main].fighting.main = undefined;
           io.to(characters[this.fighting.main].name).emit('character_data', {type: 'fighting_update', roomData: zaWarudo[this.location.RPS][this.location.GPS], newFightingObj: {main: undefined, others: [...characters[this.fighting.main].fighting.others]}});
       } else {
           characters[this.fighting.main].fighting.others = characters[this.fighting.main].fighting.others.filter(target => target !== this.entityID);
           io.to(characters[this.fighting.main].name).emit('character_data', {type: 'fighting_update', roomData: zaWarudo[this.location.RPS][this.location.GPS], newFightingObj: {main: characters[this.fighting.main].fighting.main, others: characters[this.fighting.main].fighting.others}});
       }

       if (this.fighting.others.length > 0) {
           this.fighting.others.forEach(target => {
                if (characters[target].fighting.main === this.entityID) {
                    characters[target].fighting.main = undefined;
                    io.to(characters[target].name).emit('character_data', {type: 'fighting_update', roomData: zaWarudo[this.location.RPS][this.location.GPS], newFightingObj: {main: undefined, others: [...characters[target].fighting.others]}});
                } else {
                    characters[target].fighting.others = characters[target].fighting.others.filter(mob => mob !== this.entityID);
                    io.to(characters[target].name).emit('character_data', {type: 'fighting_update', roomData: zaWarudo[this.location.RPS][this.location.GPS], newFightingObj: {main: characters[target].fighting.main, others: characters[target].fighting.others}});
                }
           })
       }

       // Hm. I'm not sure the above are 'working' properly ATM; let's try a "cover all" send to the room with new data?
       io.to(this.location.RPS + '/' + this.location.GPS).emit('room_event', {
           echo: '',
           note: `This entity of ID ${this.entityID} shouldn't be in this data any longer. This is a 'death note.'`,
           type: 'entities_update',
           roomData: zaWarudo[this.location.RPS][this.location.GPS]
       })

       delete mobs[this.entityID];
    




       return `dealing ${damageTaken} damage, slaying it!`;
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
    const eFSkill = entity.effectiveSkill;

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

    /*
            Effective skill time!
            More specific than skills. Let's define some conceptually than programmatically...
            ... hm, having some trouble settling on specificity degree; hiding/stalking feels right, but 'attacking' 'defending' seem far too general
            ... but then breaking down per weapon might be too granular, might as well have 'foresthiding' vs 'cityhiding' then... hm.
            ... eh, we're only testing hiding/stalking for now, so. Away we go!

            SNEAKING: hiding, stalking, stealing
            TRAVERSAL: climbing, swimming, 
            FIGHTING: attacking, defending, 
            GATHERING: foraging, skinning, lumberjacking, 
            CRAFTING: carving, smithing, engineering?, building, 
            SPELLCASTING: artificing, targeting, channeling,  
            SCHOLARSHIP: teaching, learning, tomelore, 
            SENSING: searching, appraising, trading, 
            BUILDING: ???
            MEDICINE: healing, 
            ... starting to think BUILDING can scoot into CRAFTING? ok, yeah, let's do that
    */

    // Lots of room to rejigger here
    eFSkill.hiding = Math.floor(eSkill.sneaking * (1 + (eStat.agility / 100)));
    eFSkill.stalking = Math.floor(eSkill.sneaking * (1 + (eStat.agility / 100)));
    eFSkill.stealing = Math.floor(eSkill.sneaking);
    eFSkill.climbing = Math.floor(eSkill.traversal);
    eFSkill.swimming = Math.floor(eSkill.traversal);

    // HERE: Iterate through perks to add stats, fSkills

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
    if (entity.equipped.rightHand !== undefined && entity.equipped.rightHand.type !== undefined) {
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

    if (entity.equipped.leftHand !== undefined && entity.equipped.leftHand.type !== undefined) {
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
    if (entity.equipped.head !== undefined && entity.equipped.head.type !== undefined) {
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

    if (entity.equipped.body !== undefined && entity.equipped.body.type !== undefined) {
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

    if (entity.equipped.accessory !== undefined && entity.equipped.accessory.type !== undefined) {
        // Idle thought: it prooooobably makes sense just to loop through the accessory and slap any found stats onto the entity :P
        for (const statToBoost in entity.equipped.accessory.stat) {
            eStat[statToBoost] += entity.equipped.accessory.stat[statToBoost];
        }
    }

    if (entity.equipped.trinket !== undefined && entity.equipped.trinket.type !== undefined) {
        for (const statToBoost in entity.equipped.trinket.stat) {
            eStat[statToBoost] += entity.equipped.trinket.stat[statToBoost];
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
        fighting: entity.fighting || {main: undefined, others: []},
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
                    charToLoad.fighting = {main: undefined, others: []};
                    charToLoad.whatDo = 'explore';
                    if (characters[charToLoad.entityID] !== undefined) characters[charToLoad.entityID].fighting = {main: undefined, others: []};
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
        accessory: {},
        trinket: {}
    };
    // Test gear :P
    newChar.backpack = {contents1: [new Item(
        {
            mainType: 'weapon', buildType: 'sword', subtype: 'straight', range: 'melee', skill: 'fighting/1', stat: 'strength/1', slot: 'rightHand', hands: 1,
            enhancements: 0, quality: 100
        },
        'The Crystal Sword',
        `A legendary weapon made of a single beautiful sword-shaped blade of crystal affixed to a sturdy yet ornate bejeweled hilt.`,
        {ATK: 20, ACC: 10},
        {size: 8, weight: 16, durability: 500, maxDurability: 500, materials: 'crystal/4,starsteel/2', attributes: undefined},
        {legendary: 20},
        [],
        50000

    ), new Item(
        {
            mainType: 'headgear', buildType: 'helm', subType: 'greathelm', skill: 'fighting/1', stat: 'constitution/1', slot: 'head',
            enhancements: 0, quality: 80
        },
        'The Mask of Victory',
        `An elaborately fashioned greathelm with a terrifying visage. Provides incredible protection while also being quite intimidating.`,
        {DEF: 18, RES: 18},
        {size: 6, weight: 10, durability: 500, maxDurability: 500, materials: 'starsteel/4', attributes: undefined},
        [],
        25000
    ), {}, {}, {}, {}, {}, {}, {}, {}], contents2: [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}], contents3: null, contents4: null, size: 2, stackModifiers: {}};


    /*
        ITEMS look like this:
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
    */
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
    // Room here for differentiated stat seeds based on character creation choices
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
    newChar.equipped = {rightHand: undefined, leftHand: undefined, head: undefined, body: undefined, accessory: undefined, trinket: undefined};
    newChar.effectiveSkill = {};

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
                    mainType: 'weapon', buildType: 'sword', subType: 'straight', range: 'melee', skill: 'fighting/1', stat: 'strength/1', slot: 'rightHand', hands: 1,
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
                {mainType: 'weapon', buildType: 'staff', subType: 'wizard', range: 'melee', skill: 'casting/1', stat: 'willpower/1', slot: 'rightHand', hands: 3, enhancements: 0, quality: 20},
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
                {mainType: 'weapon', buildType: 'dagger', subType: 'stabbing', range: 'melee', skill: 'sneaking/1', stat: 'agility/1', slot: 'rightHand', hands: 1, enhancements: 0, quality: 20},
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
                {mainType: 'bodyarmor', buildType: 'clothes', subType: 'cloth', skill: 'sensing/1', stat: 'spirit/1', slot: 'body', enhancements: 0, quality: 20},
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
                {mainType: 'bodyarmor', buildType: 'robes', subType: 'cloth', skill: 'scholarship/1', stat: 'intelligence/1', slot: 'body', enhancements: 0, quality: 20},
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
                {mainType: 'bodyarmor', buildType: 'gear', subType: 'leather', skill: 'traversal/1', stat: 'agility/1', slot: 'body', enhancements: 0, quality: 20},
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
                {mainType: 'bodyarmor', buildType: 'gear', subType: 'leather', skill: 'crafting/1', stat: 'constitution/1', slot: 'body', enhancements: 0, quality: 20},
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
        myCharacter = characters[character.entityID];
        // The below isn't just 'regen' per se, but for now is close enough a concept to work with

        // Ok, so this is all a big ol' mess right now -- stutters on stale values sometimes, refreshing browser can cause multiple versions of this function running, etc.
        // Interval has the same problem(s). Hmmm.
        // Basically myCharacter.regen is always undefined but also not? It's weird.
        
        // console.log(`Backend believes character is NOT regenerating properly and thus is re-applying init of regen function.`);

        // console.log(`Regeneration status of ${myCharacter.name}: ${myCharacter.regenerating}`);
        // character.regenerating is probably unnecessary now -- consider removing or reappropriating
        
        myCharacter.regen = function() {
            // this.regenerating = true;
            // console.log(`${myCharacter.name} is regenerating!`);
            if (myCharacter.stat.HP < myCharacter.stat.HPmax) {
                myCharacter.stat.HP += 1;
                if (myCharacter.stat.HP > myCharacter.stat.HPmax) myCharacter.stat.HP = myCharacter.stat.HPmax;
            }
            if (myCharacter.stat.MP < myCharacter.stat.MPmax) {
                // Sort of a placeholder value for now... since we can't reasonably go below 1 at the moment
                myCharacter.stat.MP += 1;
                if (myCharacter.stat.MP > myCharacter.stat.MPmax) myCharacter.stat.MP = myCharacter.stat.MPmax;
            }
            if (myCharacter.equilibrium < 100) {
                myCharacter.equilibrium += 10;
                if (myCharacter.equilibrium > 100) myCharacter.equilibrium = 100;
            }
            // For some odd reason it hits around 20ish and then just kinda... stops? Or doesn't display anymore? It's a little odd.
            // Ok, so it will 'tick' at 20 and theoretically it'll be down to 10.
            if (myCharacter.stance > 0) {
                // console.log(`Stance is at ${myCharacter.stance} and dwindling!`);
                myCharacter.stance -= 5;
            }
            if (myCharacter.stance < 0) {
                // console.log(`Stance is ${myCharacter.stance}, now recovering!`);
                myCharacter.stance += 5;
            }
            if (Math.abs(myCharacter.stance) <= 5) {
                // console.log(`Stance is nearly neutral, back to zero!`);
                myCharacter.stance = 0;
            }
            io.to(myCharacter.name).emit('character_data', {echo: ``, type: 'stat_update', data: {
                'HP': myCharacter.stat.HP,
                'MP': myCharacter.stat.MP,
                'equilibrium': myCharacter.equilibrium,
                'stance': myCharacter.stance
            }});
            // setTimeout(() => {
            //     myCharacter.regen();
            // }, 2000);
        }
        myCharacter.regenLoop = setInterval(myCharacter.regen, 1000);
    

        
        // // Hm, there's nothing that 'turns off' regen on disconnect and such, so this check itself doesn't work well
        // // Also, the character isn't saved during regen, so every time I save this file it resets everyone :P
        myCharacter.ouch = (damageTaken, damageType) => {
            myCharacter.stat.HP -= damageTaken;
            io.to(myCharacter.name).emit('character_data', {echo: ``, type: 'stat_update', data: {'HP': myCharacter.stat.HP}});
            return `dealing ${damageTaken} damage!`;
            /*
                this.stat.HP -= damageTaken;
                if (this.stat.HP <= 0) return this.ded(damageTaken);

                // Any other behavior changes can occur around here

                return `dealing ${damageTaken} damage!`;            
            */
        }

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
            case 'combatinit': {
                // Added a quick check in the room -- should help mitigate 'main-targeting a mob that isn't even here' issues
                if (myCharacter.fighting.main === undefined || zaWarudo[myCharacter.location.RPS][myCharacter.location.GPS].mobs.find(aMob => aMob.entityID === myCharacter.fighting.main) === undefined) {
                    myCharacter.fighting.main = actionData.target;
                    console.log(`Targeting mob: ${actionData.target}`);
                } else {
                    console.log(`Targeting into others array.`);
                    if (myCharacter.fighting.others.find(mobID => mobID === actionData.target) === undefined) myCharacter.fighting.others.push(actionData.target);
                }
                // console.log(`Character's new fighting obj looks like this: ${JSON.stringify(myCharacter.fighting)}`);

                if (mobs[actionData.target].fighting.main === undefined) {
                    mobs[actionData.target].fighting.main = myCharacter.entityID;
                } else {
                    if (mobs[actionData.target].fighting.others.find(playerID => playerID === myCharacter.entityID) === undefined) mobs[actionData.target].fighting.others.push(myCharacter.entityID);
                }

                // console.log(`... and mob's fighting obj now looks like this: ${JSON.stringify(mobs[actionData.target].fighting)}`);

                io.to(myCharacter.name).emit('character_data', {
                    echo: `You move into position to attack ${mobs[actionData.target].glance}!`,
                    type: 'combatinit',
                    fightingObj: myCharacter.fighting,
                });
                break;
            }
            case 'combatact': {
                switch (actionData.attack) {
                    case 'strike': {
                        let strikeResult = strike(myCharacter, mobs[myCharacter.fighting.main]);
                        io.to(myCharacter.name).emit('combat_event', {echo: strikeResult, type: 'combat_msg'});
                    }
                }
                break;
            }
            case 'equip': {
                // Receiving: actionData.column in the form of contents1, contents2, etc. as well as an actionData.index within that section
                
                // For now just a quick 'unequip' sub-section in this case
                if (actionData.column === 'equipment') {
                    // Use findFirstOpenInventorySlot(myCharacter) to get ['contentsX', index] of first backpack slot available for use or [-1, -1] if pack's full

                    const slotToFill = findFirstOpenInventorySlot(myCharacter);
                    if (slotToFill[0] === -1) {
                        return io.to(myCharacter.name).emit('character_data', {echo: `You can't unequip that until you free up some inventory space.`});
                    }
                    let equipmentSlot;
                    switch (actionData.index) {
                        case 0: {
                            equipmentSlot = 'rightHand';
                            break;
                        }
                        case 1: {
                            equipmentSlot = 'leftHand';
                            break;
                        }
                        case 2: {
                            equipmentSlot = 'head';
                            break;
                        }
                        case 3: {
                            equipmentSlot = 'body';
                            break;
                        }
                        case 4: {
                            equipmentSlot = 'accessory';
                            break;
                        }
                        case 5: {
                            equipmentSlot = 'trinket';
                            break;
                        }
                    }
                    console.log(`It appears a character wants to unequip their ${equipmentSlot}?`);
                    let unequippedItemName = myCharacter.equipped[equipmentSlot].glance;
                    myCharacter.backpack[slotToFill[0]][slotToFill[1]] = JSON.parse(JSON.stringify(myCharacter.equipped[equipmentSlot]));
                    myCharacter.equipped[equipmentSlot] = {};
                    calcStats(myCharacter);

                    let equipResult = {
                        type: 'equipment_change',
                        echo: `You unequip ${unequippedItemName}.`,
                        stat: {...myCharacter.stat},
                        backpack: {...myCharacter.backpack},
                        equipped: {...myCharacter.equipped}
                    };
                    io.to(myCharacter.name).emit('character_data', equipResult);
                    return;
                }

                const itemToEquip = myCharacter.backpack[actionData.column][actionData.index];
                if (itemToEquip.type === undefined) {
                    console.log(`Attempting to equip a nonexistent item? For shame!`);
                    break;
                }
                const equipToSlot = itemToEquip.type.slot;
                // Using parse+stringify to create new instances rather than references -- just in case. Not sure if necessary at this stage.
                if (myCharacter.equipped[equipToSlot]) myCharacter.backpack[actionData.column][actionData.index] = JSON.parse(JSON.stringify(myCharacter.equipped[equipToSlot]))
                else myCharacter.backpack[actionData.column][actionData.index] = {};
                myCharacter.equipped[equipToSlot] = JSON.parse(JSON.stringify(itemToEquip));

                calcStats(myCharacter);

                // HERE: craft a 'unique' echo based on the item equipped and its slot, and possibly other factors of the item equipped
                
                // HERE: send back down updated stats, equipment, backpack, and ECHO for what just happened
                let equipResult = {
                    type: 'equipment_change',
                    echo: `You equip ${itemToEquip.glance}!`,
                    stat: {...myCharacter.stat},
                    backpack: {...myCharacter.backpack},
                    equipped: {...myCharacter.equipped}
                };
                io.to(myCharacter.name).emit('character_data', equipResult);
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
            case 'move': {
                // Go ahead and scoot player-move logic here to be conistent
                // Can also add 'sneaking' and other logic as well while we're at it!
                break;
            }
            case 'hide': {
                // time to attempt to HIDE!
                // let's add a 'hidden' attribute to entities... a moment...
                // ok, good enough for now... what happens here?
                // eventually, taking the room into consideration makes sense, but for now, basic-basic:
                // oh, we can call a hideMe function! Looks at everything then makes the entity hidden to the correct level.
                // After that we can pass it back down to the client to parse.

                let oldHideValue = myCharacter.hidden;
                let didIHide = hideMe(myCharacter);
                console.log(`Psst: old hide value was ${oldHideValue} and new value is ${myCharacter.hidden}`);
                let hideEcho = oldHideValue ? `You surreptitiously attempt to reposition yourself into a better hiding spot, ` : `You quickly and quietly search for a hiding spot, `;
                if (oldHideValue) hideEcho += myCharacter.hidden > oldHideValue ? `and manage to find a more concealed position for yourself.` : `but don't quite manage to figure out a better way to position yourself.`
                else hideEcho += didIHide ? `and manage to find a concealed position to hide yourself in.` : `but don't have enough sense of equilibrium to pull it off.`;
                if (!didIHide) hideEcho = `Your equilibrium is too off-balance to allow you to gauge your surroundings for hiding.`;
                let hideResult = {
                    type: 'hide_result',
                    echo: hideEcho,
                    hidden: myCharacter.hidden
                }
                io.to(myCharacter.name).emit('character_data', hideResult);
                
                // HERE: echo to room
                break;                
                // socket.emit('own_action_result', {echo: `You attempt to hide, but can't quite seem to figure out how yet. How embarrassing.`});
                // socket.to(roomString).emit('room_event', {echo: `${myCharacter.name} attempts to hide, but can't seem to figure out how.`});
                // break;
            }
            case 'unhide': {
                myCharacter.hidden = 0;
                let hideResult = {
                    type: 'hide_result',
                    echo: `You step out of your hiding spot and into plain view.`,
                    hidden: 0
                }
                io.to(myCharacter.name).emit('character_data', hideResult);
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
    if (characters[character.entityID] !== undefined) {
        characters[character.entityID].regenerating = false;
        clearInterval(characters[character.entityID].regenLoop);
    }
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


// THIS SECTION: basic abilities/actions/techs

function strike(attackingEntity, defendingEntity) {
    if (defendingEntity === undefined) return `A cloud of dust picks up from nowhere, obscuring battle for a moment!`;

    // Final Alpha Rejigger! ... raw stats, and how do skills factor in? This will be an imporant part of skilling up!
    // MODULAR PARTS OF STRIKE (and other attacks)

    // Rejiggering attack, accuracy, skill, defense, evasion, etc.
    // DEFENSE - flat % reduction + flat damage reduction
    // ATTACK POWER - the 'default' power of a physical swing
    // ACCURACY - 

    // So how should gear look now, and related concepts of combat?
    /*
        SPECIFIC TECH: base accuracy, base power mod, base damage type
    
    */


    // THIS: the most basic attack, just whack 'em with your weapon
    // Considerations: relevant stats, equilibrium, stance, changes to both on both sides
    // Call any relevant decrement methods on entities for damage/expended energy here as well, such as .ouch(amount, type)

    // Later considerations: let the attackingentity parse the exertion and results of their attack as well?

    // Can set 'move parameters' and/or 'move modifiers' at the top of this function to 'simplify' making other techniques
    // i.e. Have a 'default formula' used for a physical attack with various modifiers coming into play based on tech skill and tech parameters

    // This works pretty well now -- next step is to break it down into its parts so we can modularize/functionalize them and apply to ANY tech down the line


    // Model changes to EQL and stance here, as well as effects to both
    // EQL is 100-point scale, and stance defaults @300 and goes from -599 to 599 (if I recall correctly)
    // Just modified stance to be 0 by default, rather than 'bonus high' by default :P

    // Let's say at MAX EQL, the strike always gives some STANCE
    // At minimum EQL, it always costs some
    // What's the EQL cost? Let's say... 30! Immediate cost.
    // AGI boosts/mitigates the effect somewhat? Maybe!

    // First, for this, it's ATK vs DEF, and ACC vs EVA. 
    // We'll start by checking ACC vs EVA to determine whether the attacker hits, is partially avoided, or entirely avoided.

    // HERE: Check if at least 30 EQL is present on attacker
    let attackerName;
    if (attackingEntity.name !== undefined) attackerName = attackingEntity.name
    else attackerName = attackingEntity.glance;
    let defenderName;
    if (defendingEntity.name !== undefined && defendingEntity !== undefined) defenderName = defendingEntity.name
    else defenderName = defendingEntity.glance;

    if (attackingEntity.equilibrium < 30) return `${attackerName[0] + attackerName.slice(1)} can't attack due to being off-balance!`;
    // HERE: calculate stance mods first before deducting EQL
    attackingEntity.stance += (attackingEntity.equilibrium - 50);
    if (attackingEntity.stance > 599) attackingEntity.stance = 599;
    if (attackingEntity.stance < -599) attackingEntity.stance = -599;
    attackingEntity.equilibrium -= 30;

    let startString, midString, endString = '';
    // BELOW: crashes when attempting to NAME the muglin(s), so set the defending/attacking entity's identities at the beginning and use them from there
    startString = `${attackerName[0].toUpperCase() + attackerName.slice(1)} strikes at ${defenderName}, `;

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

    // HERE: let's roll for a random dodge before we go further! Can be a function of skill difference, stat difference, and absolute values as well

    if (accuracyMod >= 1) accuracyMod = Math.floor(10 * ((accuracyMod - 1) / 0.5))
    else accuracyMod = Math.floor(10 * ((modDefenderEVA / modAttackerACC - 1) / 0.5)) * -1;
    baseAccuracy = (baseAccuracy + accuracyMod) / 100;
    // ADD: amp crit as well for baseAccuracy > 1
    if (baseAccuracy > 1) baseAccuracy = 1;
    if (baseAccuracy < 0) return `${attackerName[0].toUpperCase() + attackerName.slice(1)} strikes, but completely misses the target!`;
    
    

    // We're contesting ATK vs DEF here, modifying both by their respective guiding stat slightly.
    // Doing just a massive multiplier on the rawDamage is probably a bit much? Well, for this super attack, anyway. We'll modify later.
    let rawDamage = 5 + modAttackerATK + attackingEntity.stat.strength / 5 * (1 + attackingEntity.stat.strength / 10);
    let rawMitigation = modDefenderDEF / 3 + defendingEntity.stat.constitution / 10;
    const totalDamage = Math.floor((rawDamage - rawMitigation) * baseAccuracy);

    // console.log(`Our attacker ${attackerName} uses their ${attackingEntity.stat.ATK} ATK and ${attackingEntity.stat.strength} strength with a stance of 
    // ${attackingEntity.stance} to do rawDamage of ${rawDamage} against a mitigation level of ${rawMitigation}. The accuracy here is ${baseAccuracy}.`);

    // HERE: Apply damage
    // Thought: can have 'ouch' return a string to apply as the return down below?
    // if (defendingEntity.entityType === 'mob') midString = defendingEntity.ouch(totalDamage, 'bonk');
    // if (defendingEntity.entityType === 'player') midString = defendingEntity.ouch(totalDamage, 'bonk');
    // else midString = totalDamage < 0 ? `but glances harmlessly off ${defenderName}'s armor!` : `dealing ${totalDamage} damage!`;
    midString = defendingEntity.ouch(totalDamage, 'bonk');

    // HERE: if attackingEntity.entityType === 'player' calcExp();


    if (attackingEntity.entityType === 'player') {
        io.to(attackingEntity.name).emit('character_data', {echo: ``, type: 'stat_update', data: {
            'HP': attackingEntity.stat.HP,
            'MP': attackingEntity.stat.MP,
            'equilibrium': attackingEntity.equilibrium,
            'stance': attackingEntity.stance
        }});
    }
    if (defendingEntity.entityType === 'player') {
        io.to(defendingEntity.name).emit('character_data', {echo: ``, type: 'stat_update', data: {
            'HP': defendingEntity.stat.HP,
            'MP': defendingEntity.stat.MP,
            'equilibrium': defendingEntity.equilibrium,
            'stance': defendingEntity.stance
        }});
    }

    // HERE: Send updated mob information to the room? Hmmm
    // Actually, the above COULD work universally, right? STAT_UPDATE could be for ALL entities involved
    // Alternatively, stat_update could continue to be player-only, and mob_update could be for mobs...
    // Eh, it'd be good to have a 'universal, send-it-to-the-room' way for the client to know status of ALL entities in the room
    // It's true that somewhere there are hooks I put in for basic room data for mobs to include health and such. Let's look into that real quick first...

    // Ok, the below works! Sorta. I think the HP in the entity object is NOT a reference, so we need to actually update the HP on the mob...
    // Woof. I'm going to try a completely stupid and hack-y way to 'fix' it here, just as a test...
    // ... aaaand test is SUCCESSFUL. Neat. This causes proper updating of the entity's HP in their room array object.


    // Ok, so if the entity being attacked went ahead and died, we do NOT send stale room data below, we're good to end the function here.
    if (defendingEntity.flags.dead) return startString + midString + endString;


    // This assumes the defender is alive, so the below is our hack-y way to 'update' their entry in the room (their HP and such, and later their condition)
    // An 'updateEntity' function would probably be more reasonable here :P
    depopulateRoom(defendingEntity);
    populateRoom(defendingEntity);

    // Ok, entity.stat.HP is part of the entity's stats when the room is populated, so in theeeeeory, as long as that's updating properly as a reference,
    // we could just do a room update pass here
    io.to(attackingEntity.location.RPS + '/' + attackingEntity.location.GPS).emit('room_event', {
        echo: ``,
        type: 'entities_update',
        roomData: zaWarudo[attackingEntity.location.RPS][attackingEntity.location.GPS]
    });

    return startString + midString + endString;
    // return `${attackingEntity.name || attackingEntity.glance[0].toUpperCase() + attackingEntity.glance.slice(1)} strikes at ${defendingEntity.name || defendingEntity.glance} for ${totalDamage} points of damage!`;
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

    // Can implement this next -- extrapolate out the basics of the strike() functionality so don't have to copy-paste 99% of it

    // Brainstorm: what is the essence of the Goblin Punch?
    // Big hit, takes MP, has a windup that's telegraphed, set up to guard/dodge/dispel it or take a big hit that's damaging, unbalancing, and maybe debuffing
}

function findFirstOpenInventorySlot(character) {
    let firstOpenInventoryIndex;
    firstOpenInventoryIndex = character.backpack.contents1.findIndex(itemSlot => itemSlot.type === undefined);
    if (firstOpenInventoryIndex !== -1) return ['contents1', firstOpenInventoryIndex];
    firstOpenInventoryIndex = character.backpack.contents2.findIndex(itemSlot => itemSlot.type === undefined);
    if (firstOpenInventoryIndex !== -1) return ['contents2', firstOpenInventoryIndex];
    if (character.backpack.size >= 3) {
        firstOpenInventoryIndex = character.backpack.contents3.findIndex(itemSlot => itemSlot.type === undefined);
        if (firstOpenInventoryIndex !== -1) return ['contents3', firstOpenInventoryIndex];
    }
    if (character.backpack.size >= 4) {
        firstOpenInventoryIndex = character.backpack.contents4.findIndex(itemSlot => itemSlot.type === undefined);
        if (firstOpenInventoryIndex !== -1) return ['contents4', firstOpenInventoryIndex];
    }
    return [-1, -1];
    // HM: Just realized that items WILL be set to stack in some cases; in that case we'll want to pass in the item,
    //  and then find the first applicable stack to slot into based on any applicable backpack.stackModifiers.thatItemType
    //  ... good concept for later, when we have stackable items! :P
}

function hideMe(hider) {
    // AGI boosts sneaking skill. INT and WIS help boost the lower floor of the skill up, reflecting selecting from a better pool of hiding places.
    // However, I didn't account for having a sneaking skill of 0. :P My 'mercenary' character can't hide at all! Whoops!
    // Should probably set a minimum EQL req to prevent 'infinite re-hiding' that I'm doing now :P

    // ADD: more nuanced messaging scaffolding -- let players know how 'good' their hiding spot is relative to their skill/potential hiding to avoid wasting hide attempts
    // ADD: call to skillUp fxn (this hideMe fxn *should* contest and determine difficulty of hiding, so ultimately we'll call it here, not in myCharacter axns)

    if (hider.equilibrium < 50) return false;

    let hideDifficulty = 0;

    /*
        HERE: ramp up hideDifficulty based on various factors...
        -- the effective 'sensing' ability of all players, mobs, and npcs in the room (roll against each, maybe bonus xp for total number, main xp vs highest)
        -- note that the effective sensing ability will be highest for any entity that's actively fighting the hider, and even moreso if hider is their fighting.main
        -- side note for myself: let's have calcStats (or similar) yield an 'effective' skill for everything

        Hm. I like adding effective skill calculation. Hopping to Character.js model real quick...
        ... going with effectiveSkill for now, an amalgam of skill, stat, any relevant gear mods, any relevant perk mods
        ... calcStats has its work cut out for it! But once done, this function can take a rest with a simpler hideMin and hideMax
    */

    let EQLmod = hider.equilibrium / 100;
    let hideMin = hider.hidden > 0 ? hider.hidden : Math.floor(hider.effectiveSkill.hiding / 4);
    let hideMax = hider.effectiveSkill.hiding;
    if (hideMin > hideMax) hideMax = hideMin;
    // Used to ADD 1 here, but let players stack to infinite hiding by re-hiding a lot :P
    // Now if hideValue is 0 due to low skill or whatever else, the character gets a 'pity' hide value, hidden-but-really-super-barely.
    // Future iterations could have a 'hiding fail' but still grant some exp so the user can just 'figure it out' through trial and error.
    let hideValue = Math.floor(rando(hideMin, hideMax) * EQLmod) || 1;

    // We'll calc the xp gain here, regardless of actual hiding success
    // Hm, how to set up successRate, knowing it's the primary determinant of exp gain? 
    let hideSuccessRate = hideValue - hideDifficulty;
    
    skillUp(hider, 'sneaking', hideSuccessRate, 'hiding');

    // We'll call hideValue the 'success' rating base -- how well your hide attempt went by default
    // We can do multiple iterations to determine final hiding value vs 'pass/fail,' but for now:
    if (hideValue > hideDifficulty) {
        hider.hidden = hideValue - hideDifficulty;
        hider.equilibrium = 0;
        return true;
    } else {
        return false;
    }



}

function skillUp(entity, skillName, successRate, actionType) {
    // HERE WE GO! Let's gain skills, sirs and madams!
    // I'd like this to be pretty nuanced and 'involved' later on for big numbers, like 10, 20, 30... and maybe adding more requirements to higher skill levels, etc.
    // For now! Just skill it up.

    // How should we compose this? Pass in skill and difficulty and just return the skill gain?
    // Alternatively, can pass in the entire entity and modify them directly.

    // Advantage of #2 is that we can handle higher skills having nuanced requirements, as well as reference other parts of the entity's stuff.

    // Ok, let's do that then. Let's for now assume any entity that can skill up is a player -- but that'd be cool to change down the line.
    let expGain;
    // Barely succeed, barely fail = best exp
    // So, in testing HIDING exp training, definitely falling into the 'spam hiding to rank up' trap that's... boring and repetitive, if effective
    // Maybe have EXPbonus for acts that are 'rarer' or slower? Or expMod? Hm. So sneaking wildly around would be faster but teach less.
    successRate = Math.abs(successRate);
    // The below is slow and clunky and can definitely be optimized.
    if (successRate <= 10) expGain = 100;
    if (successRate <= 25 && successRate > 10) expGain = 75;
    if (successRate <= 50 && successRate > 25) expGain = 50;
    if (successRate <= 75 && successRate > 50) expGain = 25;
    if (successRate <= 95 && successRate > 75) expGain = 10;
    if (successRate > 95) expGain = 1;

    if (entity.skill[skillName] < 10) {
        // We might have to bound with && here if we don't right returning code so we don't hit every single range on the way up
        entity.skillProgress[skillName].general += expGain;

        // 'Quick and dirty' for now -- more nuance will make sense later, when each skill has its own specific actionTypes and such to check on
        if (entity.skillProgress[skillName].general > (entity.skill[skillName] + 1) * 1000) {
            io.to(entity.name).emit('character_data', {echo: `You've gained a new rank in ${skillName}!`});
            entity.skill[skillName] += 1;
            entity.skillProgress[skillName] = {general: 0};
        }
    }
    if (entity.skill[skillName] >= 10 && entity.skill[skillName] < 20) {
        // Caps at 20 for now :P
    }


    /*
        OK! Low skills scale up easily. 
        We'll need to make a new variable for all this. Object, likely, call it skillProgress? Sure!
        So something like myGuy.skillProgress.sneaking.general, and only look at that for now, and look at sub-stuff later.
        General exp is specified so we can do stuff like myGuy.skillProgress.sneaking.hiding later (for example, specifics may change).

        Generally, actions in the 'sweet spot' can award ~100 exp.
        ... too easy, 1 exp, and eventually none. Whoa!
        ... too hard, same thing. We'll call 100 exp ideal.

        Hm, maybe the params should be entity, skill, actionType, and successRate? Hm...

        Let's walk it out. Character hides at 0 skill. Difficulty of uncontested hiding is determined during the hiding itself, right? 
        So during the hiding function, we will know the difficulty, and the successRate upon doing the thing.
        ... if we have a standard scale for relative success, that could help us determine the 'sweet spot' mentioned above.

        Back to the example. Newbie hides. Skill is 0, no observers, skill at 0 has no special reqs so we ignore actionType and add to general only.
        -- We'll presume a 'learning how to hide' difficulty in the initial skillcheck to make it favorable for new sneakers

        At ~100 exp a pop ideally, let's make sub-10 ranks really pretty quick! For simplicity, we'll use MATHEMATICS.
        -- Calculate on next rank (i.e. if at rank 0 calculate to rank 1)
        -- Let's say 1000 exp to do 0 --> 1
        -- So 2000 to 2, then? 
        -- Eh, straightforward, it's fine for the First 10.
        -- Let's add skillups for first 10!

        And now extrapolating... when do we call this fxn? Any time we're using a skill to do a thing. That's a manual interpretation as we build here.
    */
}


// HERE: implement some MAGIC!

/*
    Brainstorming Magic
    Currently thinking every spell has a School, Book, and Type. Can easily rename these terms later.
        School: the overarching family of the spell, such as Elementalism, Psychic, etc.
        Book: the specific subfamily/category, such as Fire Magic, Telekinesis, etc.
        Type: Restoration, Alteration, Conjuration, etc. ... maybe 'Intention' or 'Purpose'
    
    So let's take an example:
    ZEPHYR - Elemental Wind Restoration
    SUMMON MOTE - some sort of Conjuration

    Then there's actually casting the thing, whereby MP is used to help harness and bind magic into its ultimate effect,
        which can be immediate (invoked for instant effect), called into the area, placed on an entity, held and channeled for ongoing effect, etc.
    
    It's possible that the 'immediate' effect IS to create an ongoing effect, such as a storm, a summon that behaves in a certain way, etc...
        -- In that case, the duration is part of the spell's casting cost.
        -- For non-immediate variations of the same spell, it could be cast in another mode: 'held,' fixed into an object or entity (enchantment), etc. to keep it going
        -- So long as the 'cost' of the spell's continued coherence is paid somehow, including any ongoing degradation in the patterning, all's well!
    
    Basing it loosely off the 'spell pattern' DR concept. Caster's innate MP isn't really generally enough to power a spell outright, so the ritual
        of 'preparing' the spell by harnessing ambient mana and bending it all into a usable form and sparking the cast is the process.
    
    Note that non-trivial (non-cantrip) level spells require some specialization, earned in two ways:
    1) Learning the appropriate Perks based on Spellcasting skill
        1a) Each aspect of a given spell can be Perked, so for e.g. Zephyr, you can get there by being focused on Restoration, Elementalism, and/or Wind magic
    2) Internalizing actual spells, whose combined makeup influence how easy/difficult it is to learn similar (or contrasting) magic

    The takeaway is that there's benefit to choosing which spells to learn, and someone can choose to specialize in Elemental magic and get Zephyr learned,
        or they could be a Restoration specialist and likewise pick it up that way.
    
    Haven't decided if it's worth the trouble at *this* stage of development to make the spells different based on the background of the caster
        (i.e. having the elemental master's casting and/or effects differ from the healing master who otherwise hasn't a drop of elemental expertise).

    I think for testing purposes, Zephyr shall temporarily be given to all players on login as a castable spell if they don't know it. Whee!
        - Probably a good 'tester' spell -- immediate effect, held effect, can play with it a little
    
    What are the Intentions?
        CONJURATION
        ALTERATION (Restoration/Destruction/???) ... nah, too "umbrella", divide it up
    
    Can also just make spells and sort it out later. :P
    ... rethinking, simplify:
    -- Unlock spell possibilities with SCHOOL perks, then specialize with BOOK and/or TYPE perks
    -- This essentially sets the SCHOOL as the topmost level; hierarchy of casting
    
*/

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

The de-facto note-taking section of the app ATM. What's left as of 6/3/21?

[ STORM - 'Tech Demo' Alpha ]

BASICS! Core functionality. We're really close to 'alpha,' so let's push and polish.
TIMELINE: 7-11, 14-18, 21-25 (3 full weeks) + 28th and 30th (M/W). Let's aim for 'pretty much ready' by end of next week (6/11). 

It is now the FINAL FULL WEEK FOR ALPHA. Let's go!
Add core functionality:
- World expansion (just a skosh) - mostly vendors, useful information NPCs, and some more mobs
- Combat refactor: defense/resistance scaling, dodging, skill factor/influence, module-izing strike() so can more easily build out other attacks
- Death refactor: injury-based rather than straight HP-based?
- Ability to buy, sell, and drop stuff
- S(k)ills page (techs, abilities, etc. that can be used from the menu or hotkey'd)
- Tech bar (abilities, techs, spells hotkey'd)
- Interactables such as gates/portals scoot to the 'Also Here' right-bar
- Some techs, spells, mob/entity detailed viewing and smart responsiveness of menu
- Basic skill up, basic tech-up, basic spell-up (maybe?)
- Basic learning of techs (equipment for now, maybe NPC's for a cost; players later)
- Basic perk learning (from NPC's?) - from having sufficient skill, and maybe <type>skill as well
- Basic learning of spells
- Hiding, sneaking, foraging, crafting
- Mobs drop stuff (super basic for now -- you kill, you get swag, monster goes poof)
- Player death handling
- Injuries (basic)

Improvements to UX:
- Add a 'save' function to this server that pushes to the DB with some regularity, such as when equipping new gear


ALPHA WORLD
- Sketch it out on paper, translate to zaWarudo
- Beach/sea east of town
- Orchard
- Fields/farms
- Northern Trade Route, Western Trade Route
- Woods
- Offshoot rivers
- Larger Rivercrossing w/npc's and shops
 > SHOP: Spells (primal)
 > SHOP: Weapons (basic tier, 2nd tier, fancy tier)
 > SHOP: Armor (basic tier, 2nd tier, fancy tier)
- Moar mobs 
 > moblin shaman: caster w/array of magic-based attacks, loot table includes chance at magical goodies
 > crabs: beach/sea east of town, tiered, stupidly high DEF but low accuracy and low RES, good magic-centric area
 > trolls: first 'boss/elite' type mob, forest, tough, regen quickly unless ticked down with fire, fast and vicious, turns into wood when defeated
 > bograt: first 'swarm' type mob, aggressive and ultimately designed to be provoked/directed and AoE'd ideally, rarely carry cool trinkets


ALPHA SPELLS
: Basic spellcasting and learning system in place (can just stick with buying spells for Alpha, implment studying/scrolls later)
- Zephyr (elemental restoration) - a room effect that restores HP
- Elementary Elemental (elemental conjuration) - a caster-following entity that periodically restores MP
- Fireblast (elemental destruction) - pure heat and fury aimed at an opponent
- Stoneskin (elemental transformation) - +con, -agi, defense up, evasion down, armor up, gain some resistances
- Brook's Babbles (elemental comprehension)
- ??? (elemental enchantment)

- Magical Shell (primal protection) - simple straight DEF/RES boost to self
- Energetic Bolt (primal destruction) - pew pew target's HP away with a 'punch' of semi-raw magical force
- Restorative Jolt (primal restoration) - inefficient, costly, exhausting, but effective at restoring HP and curbing the most critical injuries
- Sparkling Mote (primal conjuration) - a bizarre entity that acts apparently chaotically
- Mimetic Mind (primal comprehension) - boost scholarship (at the cost of something perhaps?)

: QUICK SKETCH, other starting schools?
- psychic (mind-reading, mind-influencing, telekinesis/mindpower-to-actual-power, illusion/sensory manipulation, fatereading)
- spatial (teleportation, 'storage,' planar shenanigans, light manipulation)
- divine (blessing, restoring, lifebringing?)
- life/nature
: CASTING! How to implement casting? Basic is best for now... right? But I'd like to have the option to 'prepare/modify/cast'... ultimately or now?


ALPHA PERKS
: How to learn? Which to have? ... maybe for now, just a special menu where learnable ones pop up and can be acquired
- basic rule: every 2 'spent' skillpoints required yields +1 stat point (generally; some exception for perks that are JUST to boost stats)


ALPHA SKILLUP
: Basic as can be, should be able to brainstorm and implement inside of an hour


ALPHA TECHS (pick a small handful, can add more later)
- Buster Cleave (physical type - power based - DEF down)
- BIG BLOW (physical type - power based - physical finisher)
- Reversal (physical type - speed based - 'steal' some enemy stance, effectiveness greatly heightened by poor stance vs strong stance)
- STAGGER BLOW (phyical type - power based - disrupt/damage enemy stance)
- Rake (physical type - speed based - RES down)
- Dirt in Your Eye (physical type - speed based - ACC down)
- Wing Clipper (physical type - ? based - EVA down)
- Ritual (mental type - ? based - MAG up, duration?)
- Purse Cutter (physical type - speed based - snatch a treasure while doing some damage, basic mug)
: WEAPONTYPES: sword, dagger, hammer, staff, axe, polearm, 


ALPHA FORAGING
- Gather materials from the area for fun and profit! 
- Consider having a CRAFT+FORAGE option, take an extra step out


ALPHA CRAFTING
- Mostly survival stuff
- Also basic upgrades, using thematic + composed-of materials to boost gear


ALPHA HIDING/STEALTH


ALPHA CHAR CREATION
- Storytelling (ideally with static backgrounds), rather than 'skill selection'


ALPHA GUI
- Everything mouse-able, same input result as keyboard input
- Basic integrated color scheme
- Optimized resizing (within reason)
- Static background FE



For later:
- Party/formations (player and mob)
- Day/night/weather cycle(s)
- Crafting, expanded upgrades

*/