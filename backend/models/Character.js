const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Interesting! Passing in 'unaccounted for' variables results in them being trimmed out? entityID was purged until I added it here.
const CharacterSchema = new Schema({
    name: {type: String, required: true},
    identity: {type: String}, // May change this to "background," though won't do that until I'm able to go through all related files/code to change properly
    entityType: {type: String, default: 'player'},
    entityID: {type: String, required: true},
    class: {type: String},
    salt: {type: String, required: true},
    hash: {type: String, required: true},
    location: {
        type: Object,
        default: {RPS: 0, GPS: '500,500,0'}
    },
    stat: {
        type: Object, 
        required: true,
        default: {strength: 20, agility: 20, constitution: 20, willpower: 20, intelligence: 20, wisdom: 20, charisma: 20}
    },
    derivedStat: {
        type: Object,
        default: {HP: undefined, MP: undefined, ATK: undefined, MAG: undefined, DEF: undefined, RES: undefined}
    },
    combatTarget: String, // Just leaving this here for now... thinking through its implementation, may remove or reconfigure
    backpack: {
        type: Object,
        default: {open: false, contents: [], size: 10, stackModifiers: {}}
    },
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
    position: {type: String, default: 'standing'},
    skill: {
        type: Object,
        // Scale: 0 - 100, 'Perk' can be purchased/trained every 5 points of expertise
        // May reconfigure to do something like fighting: {level: 0, perks: []} ... think about how that'll scale in practice
        default: {
            fighting: 0,
            gathering: 0,
            sneaking: 0,
            traveling: 0,
            crafting: 0,
            casting: 0,
            knowing: 0,
            building: 0,
            connecting: 0,
        }
    },
    spells: Array,
    abilities: Array,
    quirk: {
        type: Object,
        default: {}
    },
    admin: {type: Boolean, default: false},
    actionIndex: {type: Number, default: 0},
    currentActionBar: {type: Array, default: ['Explore', 'Talk', 'Magic', 'Survey Area', 'Inventory']}
}, { minimize: false });

module.exports = mongoose.model('Character', CharacterSchema);