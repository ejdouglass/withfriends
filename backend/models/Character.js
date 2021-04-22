const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Interesting! Passing in 'unaccounted for' variables results in them being trimmed out? entityID was purged until I added it here.
const CharacterSchema = new Schema({
    name: {type: String, required: true},
    gender: String,
    age: Number,
    features: Object,
    // identity: {type: String, default: 'Wayfarer'}, // May eliminate this altogether or repurpose much later
    entityType: {type: String, default: 'player'},
    entityID: {type: String, required: true},
    class: {type: String, default: 'Wayfarer'},
    salt: {type: String, required: true},
    hash: {type: String, required: true},
    equilibrium: {type: Number, default: 100},
    stance: {type: Number, default: 300},
    location: {
        type: Object,
        default: {RPS: 0, GPS: '500,500,0'}
    },
    level: {type: Number, default: 1},
    experience: {type: Object, default: {
        exp: 0
    }},
    baseStat: {
        type: Object, 
        required: true,
        default: {strength: 15, agility: 15, constitution: 15, willpower: 15, intelligence: 15, wisdom: 15, spirit: 15}
    },
    derivedStat: Object,
    secondaryStat: {
        type: Object,
        default: {HP: undefined, HPmax: undefined, MP: undefined, MPmax: undefined, ATK: undefined, MAG: undefined, DEF: undefined, RES: undefined, ACC: undefined, EVA: undefined, FOC: undefined, LUK: undefined}
    },
    injuries: Object, // thinking adding key=type, and other stats... 
    target: String, // Just leaving this here for now... thinking through its implementation, may remove or reconfigure
    tagged: Object,
    backpack: {
        type: Object,
        default: {open: false, contents: [], size: 10, stackModifiers: {}}
    },
    purse: Object, // can expound on this later
    equipped: {
        type: Object,
        default: {
            rightHand: {},
            leftHand: {},
            head: {},
            torso: {},
            accessory1: {},
            accessory2: {}
        }
    },
    buffs: Array,
    debuffs: Array, // hm, thinking of just having an 'effects' object instead... with keys such as atkUP, atkDOWN, poison, etc.
    effects: Object, // probably will just go with this
    position: {type: String, default: 'standing'},
    skill: {
        type: Object,
        // Scale: 0 - 100, 'Perk' can be purchased/trained every 5 points of expertise
        // May reconfigure to do something like fighting: {level: 0, perks: []} ... think about how that'll scale in practice
        default: {
            fighting: 0,
            gathering: 0,
            sneaking: 0,
            traversal: 0,
            crafting: 0,
            spellcasting: 0,
            scholarship: 0,
            sensing: 0, // perception, etc... search out exits, hidden entities, appraise the nature of objects, etc.
            building: 0,
            medicine: 0
        }
    },
    spells: Array,
    techs: Array,
    abilities: Array,
    quirk: {
        type: Object, // Proooobably gonna rename this fella
        default: {}
    },
    admin: {type: Boolean, default: false},
    actionIndex: {type: Number, default: 0},
    currentActionBar: {type: Array, default: ['Explore', 'Talk', 'Magic', 'Survey Area', 'Inventory']}
}, { minimize: false });

module.exports = mongoose.model('Character', CharacterSchema);