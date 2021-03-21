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
        default: {atMap: 'lilMap', atX: 2, atY: 1, GPS: undefined, room: undefined} // As noted in webclient context, likely to refactor atMap into {} vs ''
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
            head: {},
            neck: {},
            shoulders: {},
            torso: {},
            arms: {},
            hands: {},
            rings: [{},{}],
            legs: {},
            feet: {},
            accessories: [{},{}]
        }
    },
    position: {type: String, default: 'standing'},
    skill: {
        type: Object,
        // Thinking through some skills, hmmm
        // Add: crafting, constructing, magic, ___
        default: {
            gathering: {
                fishing: 0,
                foraging: 0,
                lumberjacking: 0,
                mining: 0,
                skinning: 0
            },
            crafting: {
                smithing: 0,
                stitching: 0,
                carving: 0,
                enchanting: 0,
                engineering: 0,
                construction: 0,
                brewing: 0
            },
            stealth: {
                hiding: 0,
                stealing: 0
            },
            traversal: {
                swimming: 0,
                climbing: 0,
                running: 0
            },
            combat: {
                marksmanship: 0,
                swordplay: 0,
                throwing: 0,
                blocking: 0,
                dodging: 0
            },
            mercantile: 0,
            medicine: 0
        }
    },
    quirk: {
        type: Object,
        default: {}
    }
}, { minimize: false });

module.exports = mongoose.model('Character', CharacterSchema);