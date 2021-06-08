const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Interesting! Passing in 'unaccounted for' variables results in them being trimmed out? entityID was purged until I added it here.
const CharacterSchema = new Schema({
    name: {type: String, required: true},
    gender: String,
    age: Number,
    features: Object,
    description: {type: String, default: `This is a being much like yourself, a fellow player, currently with no particular features until I implement all that.`},
    // identity: {type: String, default: 'Wayfarer'}, // May eliminate this altogether or repurpose much later
    entityType: {type: String, default: 'player'},
    entityID: {type: String, required: true},
    class: {type: String, default: 'Wayfarer'},
    salt: {type: String, required: true},
    hash: {type: String, required: true},
    equilibrium: {type: Number, default: 100},
    stance: {type: Number, default: 0},
    regenerating: {type: Boolean, default: false},
    regen: Object, // Wouldn't allow definition as Function, so.... let's see how this flies :P
    mainHand: {type: String, default: 'right'},
    location: {
        type: Object,
        default: {RPS: 0, GPS: '500,500,0'}
    },
    level: {type: Number, default: 1},
    experience: {type: Object, default: {
        exp: 0
    }},
    stat: {
        type: Object, 
        required: true,
        default: {
            seed: {HPmax: 100, MPmax: 15, strength: 10, agility: 10, constitution: 10, willpower: 10, intelligence: 10, wisdom: 10, spirit: 10},
            strength: undefined, agility: undefined, constitution: undefined, willpower: undefined, intelligence: undefined, wisdom: undefined, spirit: undefined, 
            HP: undefined, HPmax: undefined, MP: undefined, MPmax: undefined, 
            ATK: undefined, MAG: undefined, DEF: undefined, RES: undefined, ACC: undefined, EVA: undefined, FOC: undefined, LUK: undefined
        }
    },
    injuries: Object, // thinking adding key=type, and other stats... 
    target: Object, // Just leaving this here for now... thinking through its implementation, may remove or reconfigure
    viewTarget: Object,
    combatTarget: Object,
    interactionTarget: Object,
    targetOf: Object, // Likewise, here for now -- see if we can hook it up to enable more nuanced 'Combat Mode' logistics
    tagged: Object,
    backpack: {
        type: Object,
        default: {contents1: [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}], contents2: [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}], contents3: null, contents4: null, size: 2, stackModifiers: {}}
    },
    wallet: {type: Object, default: {
        gems: [],
        crystals: 250
    }}, // sure, why not :P
    equipped: {
        type: Object,
        default: {
            rightHand: undefined,
            leftHand: undefined,
            head: undefined,
            body: undefined,
            accessory1: undefined,
            accessory2: undefined
        }
    },
    buffs: Array,
    debuffs: Array, // hm, thinking of just having an 'effects' object instead... with keys such as atkUP, atkDOWN, poison, etc.
    effects: Array, // probably will just go with this
    modifiers: Object, // pondering implementation
    position: {type: String, default: 'standing'},
    fighting: {type: Object, default: {main: undefined, others: []}},
    skill: {
        type: Object,
        default: {
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
        }
    },
    flags: {type: Object, default: {}},
    spells: {type: Array, default: []},
    techs: {type: Array, default: []},
    abilities: {type: Array, default: []},
    perks: {type: Array, default: []},
    bonuses: {type: Object, default: {}}, // current thinking is where ALL perk-related bonuses come to live; maybe also equipment-related stuff?
    quirk: {
        type: Object, // Proooobably gonna rename this fella
        default: {}
    },
    admin: {type: Boolean, default: false},
    actionIndex: {type: Number, default: 0},
    currentActionBar: {type: Array, default: ['(M)agic', '(I)nventory', '(S)earch Area', 'S(t)ats']},
    currentBarSelected: {type: String, default: 'action'}, // action, entity, ___?
    actionBarActions: {type: Object, default: {explore: ['Magic', 'Hide', 'Forage', 'Stats', 'Inventory'], combat: ['(S)trike, (G)uard, (D)odge']}}
}, { minimize: false });

module.exports = mongoose.model('Character', CharacterSchema);