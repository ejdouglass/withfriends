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

class SpawnMap {
    constructor(mobArray, tickRate, spawnRooms, spawnRules) {
        this.mobArray = mobArray; // array of objects: class of mob to use, level range, etc.
        this.tickRate = tickRate; // how often to check itself to see if it needs to spawn
        this.spawnRooms = spawnRooms; // array of rooms to potentially spawn in
        this.spawnRules = spawnRules;

        this.mobs = []; // keep track of mobs spawned, see how they're doing, make more if necessary
        this.active = false; // variable that controls whether this SpawnMap is currently active ... may not be necessary upon further reflection
    }

    run() {
        // HERE: all the logic runs and then sets a timeout to run again and again, whee!

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

class Item {
    constructor(type, glance, description, stat, build, special, value) {
        this.type = type; // objectified - item type and subtypes, if applicable
        this.glance = glance;
        this.description = description;
        this.stat = stat; // objectified - atk, mag, def, res
        this.build = build; // objectified - size, weight, durability, materials
        this.special = special; // ???
        this.value = value; // ideally derived from materials as well as skill/difficulty in its creation modified by overall concept of rarity, buuuut whatever for now
    }
}

// Hm, going to have to figure out how we want to actually use these values...
// The strength of classes is being able to make new items on the fly, while this is just setting it all randomly here?
// Well, we can also do a new Item whenever we spawn a new mob or create an item or 'create' from a store buying, etc.
// So this is mostly just to sketch out the concept for now, I suppose
let goblinKnife = new Item(
    {main: 'weapon', sub: 'dagger', range: 'melee'},
    `a jagged stone knife`,
    `A crude but effective tool crafted of stone chipped carefully into a jagged-edged long knife bound tightly to a well-worn wooden handle.`,
    {atk: 10, mag: 10, def: 0, res: 0},
    {size: 1, weight: 5, durability: 50, maxDurability: 50, materials: 'stone/1,wood/1'},
    [],
    15
);

let goblinRags = new Item(
    {main: 'armor', sub: 'cloth'},
    `some stitch-ragged leather clothes`,
    `While it looks capable of providing some basic protection, this patchwork collection of rough-worn leather is enthusiastically but poorly held together with dreams and optimism almost as much as it is copious amounts of crude twine.`,
    {atk: 0, mag: 0, def: 10, res: 10},
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
        this.name = name;
        this.level = 1; // Placeholder for now
        this.glance = glance; // Room/sidebar text
        this.location = location;
        this.description = description || `This being is very nondescript.`;
        this.race = 'human';
        this.zoneLocked = true;
        this.entityType = 'npc';
        this.mode = 'nonsense';
        this.wanderlust = 0;
        this.actInterval = 15000;
        this.number = rando(1,10);
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
            io.to(this.location.RPS + '/' + this.location.GPS).emit('room_event', emittedAction);
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
        io.to(this.location.RPS + '/' + this.location.GPS).emit('room_event', emittedAction);
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
        this.actInterval = rando(5,12) * 1000;
    }

    // HERE: maybe add a "wake()" function (or live or whatever) that "boots up" the entity to live its best life
    

}

// 'Generic' Mob class will probably get divided up into stuff like new Goblin()... will look into class logistics and refine
class Mob {
    constructor(glance, stats, location, description, race) {
        this.name = '';
        this.glance = glance;
        this.stat = JSON.parse(JSON.stringify(stats)); // Deep copy. Just in case. :P Though may not end up doing it this way, can receive an obj and parse into separate fields in a fashion similar to Characer.
        this.derivedStat = {};
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
        this.location = location; // The only outside variable needed to successfully spawn this fella currently...
        // Might add 'monsterLevel' and such 
        this.glance = `an orchard goblin`;
        this.entityID = undefined;
        this.stat = {strength: 15, agility: 15, constitution: 15, willpower: 15, intelligence: 15, wisdom: 15, charisma: 15};
        this.derivedStat = {HP: undefined, HPmax: 60, MP: 15, MPmax: undefined, ATK: undefined, MAG: undefined, DEF: undefined, RES: undefined, ACC: undefined, EVA: undefined, FOC: undefined, DFL: undefined};
        this.mode = undefined; // gotta define modes and such, too, like wandering, self-care (later), etc.... may want to set 'default' names for ease and later mobs
        this.injuries = []; // haven't decided how to define these quite yet
        this.equilibrium = 100;
        this.stance = 300;
        this.equipped = {};
        this.target = undefined;
        this.actInterval = undefined;
        this.level = 1; // hrmmm, might set this up to be a constructor variable, and then pop stats and values up from there
        this.loot = undefined; // hm, how to loot table
    }

    init() {
        // HERE: give an entityID, roll for gear, etc. and probably start up the actOut setTimeout loop and actInterval
        // Roll up gear, 'equip' gear (not through equip function, just slap 'em into here real quick), calc all derivedStats
        this.entityID = 'mob' + generateRandomID();
        // OH! Yeah, maybe we can roll up 'custom' glances for them, too. Separate them a little bit.
        let appearanceRoll = rando(1,10);
        switch (appearanceRoll) {
            case 1:
            case 2:
            case 3:
                this.glance = `a rough-skinned orange orchard goblin`;
                break;
            case 4:
            case 5:
            case 6:
                this.glance = `a stout ruddy orchard goblin`;
            case 7:
            case 8:
            case 9:
                this.glance = `a fuzzy green orchard goblin`;
            case 10:
            default: 
                this.glance = `an oblong yellow orchard goblin`;
                break;
        }

        this.actInterval = 3000;
        setTimeout(() => this.actOut(), this.actInterval);
    }

    actOut() {
        io.to(this.location.RPS + '/' + this.location.GPS).emit('room_event', `An orchard goblin wants to collect some apples!`);

        this.actInterval = rando(3,12) * 1000;
        setTimeout(() => this.actOut(), this.actInterval);
        // HERE: assess self and situation, modify mode if necessary, and get going!
    }
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
const npcs = [];

// 'Birth of an NPC' process as it currently stands. We can functionalize this for the GameMaster!
let newGuy = new NPC('Taran Wanderer', 'a wandering townsperson', {RPS: 0, GPS: '500,500,0'}, `A young fellow with shoulder-length dark hair and wearing rough-worn traveler's attire.`);
populateRoom(newGuy);
newGuy.actOut();
npcs.push(newGuy);

function depopulateRoom(entity) {
    let roomArrayTarget = `${entity.entityType + 's'}`;
    // console.log(`Removing entity ${entity.name} from GPS ${entity.location.GPS}`)
    zaWarudo[entity.location.RPS][entity.location.GPS][roomArrayTarget] = zaWarudo[entity.location.RPS][entity.location.GPS][roomArrayTarget].filter((roomEntity) => roomEntity.entityID !== entity.entityID);
}

function populateRoom(entity) {
    // console.log(`Attempting to populate room with ${entity.entityID} who is ${entity.name} at new GPS ${entity.location.GPS}`);
    let roomArrayObject = {
        id: entity.entityID,
        name: entity.name || '',
        glance: entity.glance || '',
        level: entity.level || 0,
        HP: 100,
        condition: [] // asleep, stunned, not-so-alive, etc.
    }
    zaWarudo[entity.location.RPS][entity.location.GPS][`${entity.entityType + 's'}`].push(roomArrayObject);
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
        depopulateRoom(entity);
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
        case 's': {
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

    // Hm, be mindful of this section when changing frontend to more 'basic' loadout
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
                console.log(`Name for new character is available!`);
                // HERE: Craft the object that will be the foundation, including salt, hash from password and salt, and stats
                const salt = createSalt();
                const hash = createHash(newChar.password, salt);
                let newCharacter = new Character({
                    name: newChar.name,
                    entityID: generateRandomID(),
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
        socket.to(roomString).emit('room_event', `${character.name} just appeared as if from nowhere! Wowee!`);
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
        switch (actionData.action) {
            // Ok, so we're setting this up to be a passed object of the format {action: ACTION_TO_RESPOND_TO}...
            // And then we can just add whatever other actions and data we want/need.
            case 'talk': {
                // HERE, eventually: see if char CAN talk before just babbling away :P
                socket.to(roomString).emit('room_event', `${myCharacter.name} says, "${actionData.message}"`);
                socket.emit('own_action_result', `You say, "${actionData.message}"`);
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
                        socket.to(roomString).emit('room_event', `${myCharacter.name} went through ${portalName}`);
                        socket.leave(roomString);                        
                        moveEntity(myCharacter, null, myCharacter.location.room.structures[actionData.index].goes.to);
                        roomString = `${myCharacter.location.RPS}/${myCharacter.location.GPS}`;
                        socket.join(roomString);
                        socket.to(roomString).emit('room_event', `${myCharacter.name} just arrived through ${portalName}.`); // Might have to change. Or not!
                        socket.emit('own_action_result', `You move through the ${portalName} to ${myCharacter.location.room.room}.`);
                        socket.emit('moved_dir', {newLocation: myCharacter.location});
                        break;
                    }
                    case 'shop': {
                        socket.emit('own_action_result', `You wish to go shopping! But can't figure out how. Awkward.`);
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
                    socket.emit('own_action_result', `You move through the ${existingPortal.name} to ${myCharacter.location.room.room}.`);
                    socket.emit('moved_dir', {newLocation: myCharacter.location});
                } else socket.emit('own_action_result', `BONK! You can't figure out that portal at all!`);
                break;
            }
            default: 
                socket.emit('own_action_result', `You try to do a thing, but for some reason can't figure out what you're doing or how to do it.`);
                break;
        }
    });


    socket.on('movedir', mover => {
        // HERE: use the request from the client to plug into the character and le GO
        const moveChar = characters[mover.who];

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
            socket.to(roomString).emit('room_event', `${moveChar.name} just went wherever the ${mover.where} key takes them.`);
            socket.leave(roomString);
            roomString = moveChar.location.RPS.toString() + '/' + moveChar.location.GPS;
            socket.join(roomString);
            socket.to(roomString).emit('room_event', `${moveChar.name} just arrived. Hi!`);
            socket.emit('own_action_result', `You move ${direction.long} to ${moveChar.location.room.room}.`);
        }


        socket.emit('moved_dir', walkResult);
    });

    // Fascinating. Yeah, myCharacter is holding some STALE-ASS data most of the time. WTF. If I can fix that, we'll be GOLDEN (hearts get broken).
    // setInterval(() => {
    //     socket.emit(`own_action_result`, `You are standing at ${myCharacter.location.room.room}.`)
    // }, 1000);

    socket.on('disconnect', () => {
        socket.to(roomString).emit('room_event', `${myCharacter.name} just disappeared in a puff of smoke! Wow!`);
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

let orchardGoblinSpawn = new SpawnMap(); // '400,550,0' is the 'south' room, so center room is 400,575,0

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