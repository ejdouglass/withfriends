const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CharacterSchema = new Schema({
    name: {type: String, required: true},
    identity: {type: String},
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
        // Ok, we're gonna shrinky-dink all this pure nonsense. :P Basic-basics, with EXPERTISE that's earned through use that levels this stuff up.
        // Idle thought: 3 to one, 2 to two, 1 to three, rest zero, keep it 'basic' :P
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
        // default: {
        //     gathering: {
        //         fishing: 0,
        //         foraging: 0,
        //         lumberjacking: 0,
        //         mining: 0,
        //         skinning: 0
        //     },
        //     crafting: {
        //         smithing: 0,
        //         stitching: 0,
        //         carving: 0,
        //         enchanting: 0,
        //         engineering: 0,
        //         construction: 0,
        //         brewing: 0
        //     },
        //     stealth: {
        //         hiding: 0,
        //         stealing: 0
        //     },
        //     traversal: {
        //         swimming: 0,
        //         climbing: 0,
        //         running: 0
        //     },
        //     combat: {
        //         marksmanship: 0,
        //         swordplay: 0,
        //         throwing: 0,
        //         blocking: 0,
        //         dodging: 0
        //     },
        //     mercantile: 0,
        //     medicine: 0
        // }
    },
    expertise: {
        type: Object
    },
    quirk: {
        type: Object,
        default: {}
    },
    admin: {type: Boolean, default: false}
}, { minimize: false });

module.exports = mongoose.model('Character', CharacterSchema);