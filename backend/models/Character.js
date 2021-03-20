const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CharacterSchema = new Schema({
    name: {type: String, required: true},
    location: {
        type: Object,
        default: {atMap: 'lilMap', atX: 2, atY: 1, room: undefined} // As noted in webclient context, likely to refactor atMap into {} vs ''
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
        default: {
            fishing: 0,
            foraging: 0,
            lumberjacking: 0,
            stealth: 0,
            mercantile: 0,
            traversal: 0,
            marksmanship: 0,
            swordplay: 0,
            defense: 0
        }
    }
}, { minimize: false });

module.exports = mongoose.model('Character', CharacterSchema);