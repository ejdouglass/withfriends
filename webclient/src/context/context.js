import React, { createContext, useReducer } from 'react';

export const actions = {
    TOGGLE_BACKPACK: 'toggle_backpack',
    LOAD_CHAR: 'load_char',
    LOGOUT_CHAR: 'logout_char',
    SET_GAME_STATE: 'set_game_state',
    SET_ALERT: 'set_alert',
    UPDATE_ROOM: 'update_room',
    UPDATE_WHATDO: 'update_whatdo',
    UPDATE_ACTION_INDEX: 'update_action_index',
    UPDATE_VIEW_INDEX: 'update_view_index',
    UPDATE_VIEW_TARGET: 'update_view_target',
    UPDATE_TARGET: 'update_target',
    PACKAGE_FOR_SERVER: 'package_for_server',
    PACKAGE_FROM_SERVER: 'package_from_server',
    TARGET_ENTITY: 'target_entity',
    UPDATE_SELECTED_BAR: 'update_selected_bar',
    RESET_VIEW: 'reset_view',
    START_COMBAT: 'start_combat',
    UPDATE_FIGHTING: 'update_fighting',
    UPDATE_STATS: 'update_stats'
}

export const Reducer = (state, action) => {
    switch (action.type) {
        case actions.TOGGLE_BACKPACK: {
            return {...state, backpack: {...state.backpack, open: !state.backpack.open}};
        }
        case actions.LOAD_CHAR: {
            const { character } = action.payload;
            console.log(`Loading this character: ${JSON.stringify(character)}`);
            // Stop-gap measures below so displays properly; change when BACKGROUND/AREA data is derived from actual room and not just supplied through state
            const above = {
                type: 'sky',
                imgsrc: '../assets/skyboxes/bluesky.jpg',
                color: 'hsla(215, 90%, 75%, 0.3)'
            };
            const around = {type: 'field'};
            const below = {
                type: 'grass',
                color: 'hsl(125, 80%, 30%)'
            };

            return {...state, ...character, above: above, around: around, below: below, alert: undefined, whatDo: mode.EXPLORE};
        }
        case actions.SET_GAME_STATE: {
            return {...state, whatDo: action.payload};
        }
        case actions.SET_ALERT: {
            // Set up to send action.payload.alert here:
            const { alert } = action.payload;
            return {...state, alert: alert};
        }
        case actions.UPDATE_ROOM: {
            // This CURRENTLY is only called when we move locations.
            const { updatedLocation } = action.payload;
            console.log(`Receiving an updated location: ${JSON.stringify(updatedLocation)}`);
            // Anytime the 'view' dictating room/area details changes, we amend it here! Just pass in a whole new 'location' bit.
            return {...state, location: updatedLocation};
        }
        case actions.LOGOUT_CHAR: {
            return initialState;
        }
        case actions.RESET_VIEW: {
            return {...state, whatDo: 'explore', viewIndex: 0, currentBarSelected: 'action', viewTarget: {type: 'action', id: state.currentActionBar[0].toLowerCase()}}
        }
        case actions.UPDATE_WHATDO: {
            // Trying out a quick poke to viewIndex...
            // *May* also reset viewTarget? Maybe not? Will think about the implications of that in a bit...

            // Update to below: the currentActionBar might change for whatDo === 'combat', so we might want to reset that here as well
            // ... but haven't decided on a good core currentActionBar content set yet, so just a note to self for now

            // Adding actionBarActions as an object in the format {combat: ['ComAct1', 'ComAct2'], explore: ['ExpAct1', 'ExpAct2']}
            // Updating whatDo is probably where we want to adjust the currentActionBar contents to any new relevant actions
            // We can also adjust NPC interaction and shopping to follow this format as well? Gonna require some shenanigans and investigation to do it properly
            // It's best to match mode/whatDo names in the aforementioned object for easiest transitions
            if (action.payload === 'explore') return {...state, whatDo: action.payload, viewIndex: 0, currentBarSelected: 'action'};
            return {...state, whatDo: action.payload, viewIndex: 0};
        }
        case actions.UPDATE_ACTION_INDEX: {
            return {...state, actionIndex: action.payload, whatDo: state.currentActionBar[action.payload].toLowerCase()};
        }
        case actions.UPDATE_VIEW_INDEX: {
            // console.log(`BEEP BOOP UPDATING VIEWINDEX TO ${action.payload}`)
            return {...state, viewIndex: action.payload || 0};
        }
        case actions.UPDATE_VIEW_TARGET: {
            // Hm, ok, so view target can be an ACTION, an ENTITY, an OBJECT... how to structure?
            // Maybe type/(id), so ENTER changes mode based on that
            // mob/id, npc/id, player/id open separate command screens
            // action/actionName would just do that action
            // object/id would enable further interaction with said object, depending on mode (equip/use in inventory, pick up off ground, etc.)

            // NEW WAY: let's include id, type, glance, description object instead rdrr
            // ALL should have a type and id, so action/magic would have type action and id magic
            // mobs/npcs will have a much more robust display including their glance and description for now
            // ... might have to add additional variables
            
            // VIEW_TARGET always has a type and id, for raisins
            // console.log(`Setting viewTarget to ${action.payload}`);
            return {...state, viewTarget: action.payload};
        }
        case actions.UPDATE_TARGET: {
            return {...state, target: action.payload};
        }
        case actions.PACKAGE_FOR_SERVER: {
            return {...state, package: action.payload};
        }
        case actions.PACKAGE_FROM_SERVER: {
            if (action.payload?.roomData) {
                console.log(`Received new room data: ${JSON.stringify(action.payload.roomData)}`);
                return {...state, received: action.payload, location: action.payload.roomData};
            }
            return {...state, received: action.payload};
        }
        case actions.TARGET_ENTITY: {
            // receive an object with entityID, type, glance, name
            console.log(`WARNING: OLD TARGET ENTITY ENGAGED`)
            if (action.payload.targetType === 'view') {
                return {...state, viewTarget: action.payload.target || {}};
            }
            if (action.payload.targetType === 'combat') {
                return {...state, combatTarget: action.payload.target || {}};
            }
        }
        case actions.UPDATE_SELECTED_BAR: {
            return {...state, currentBarSelected: action.payload};
        }
        case actions.START_COMBAT: {
            // Our payload should include an object: {main: {}, others: []}, all entityID's
            return {...state, whatDo: 'combat', fighting: action.payload};
        }
        case actions.UPDATE_FIGHTING: {
            return {...state, fighting: action.payload || {main: '', others: []}};
        }
        case actions.UPDATE_STATS: {
            // Let's try to receive an object that looks like: data: {HP: newnumber, MP: newnumber, strength: newnumber, ...}
            // It can have any subset of stats to update! We'll have to loop through the action.payload.data object

            // Hm, action.payload.stance isn't registering due to value of 0 being falsy. Oh, silly JS. Let's see...
            let updatedStats = JSON.parse(JSON.stringify(state.stat));
            for (const statKey in action.payload) {
                if (statKey !== 'equilibrium' && statKey !== 'stance') updatedStats[statKey] = action.payload[statKey];
            }
            let eqlVal = action.payload.equilibrium || state.equilibrium;
            let stanceVal = action.payload.stance === undefined ? state.stance : action.payload.stance;
            return {...state, stat: {...updatedStats}, equilibrium: eqlVal, stance: stanceVal};
        }
        default: {
            return state;
        }
    }
}

/*
    Mode ponder...
*/
const mode = {
    TRAVEL: 'travel',
    EXPLORE: 'explore',
    CHARACTER_CREATION: 'character_creation',
    CHAT: 'chat',
    RUMMAGE: 'rummage',
    COMBAT: 'combat'
}

const initialState = {
    name: undefined,
    // Gonna reconfig ABOVE and AROUND and BELOW to be information contained in LOCATION data
    above: {
        type: 'sky',
        imgsrc: '../assets/skyboxes/bluesky.jpg',
        color: 'hsla(215, 90%, 75%, 0.3)'
    },
    around: {
        type: 'field'
    },
    below: {
        type: 'grass',
        color: 'hsl(125, 80%, 30%)'
    },
    backpack: {
        open: false,
        contents: [],
        size: 10,
        stackModifiers: {}
    },
    equipped: {
        rightHand: {},
        leftHand: {},
        head: {},
        torso: {},
        accessory1: {},
        accessory2: {}
    },
    position: 'standing',
    healthStatus: 'fine',
    mindStatus: 'clear',
    stat: {
        strength: 0,
        agility: 0,
        constitution: 0,
        willpower: 0,
        intelligence: 0,
        wisdom: 0,
        charisma: 0
    },
    location: {
        RPS: 0,
        GPS: '500,500,0',
        room: {}
    },
    whatDo: mode.CHARACTER_CREATION,
    actionIndex: 0,
    viewIndex: 0,
    stance: 0,
    equilibrium: 100,
    currentBarSelected: 'action',
    currentActionBar: ['Magic', 'Survey Area', 'Inventory'],
    alert: undefined,
    package: undefined,
    received: undefined,
    target: undefined,
    viewTarget: undefined,
    combatTarget: undefined,
    fighting: {main: undefined, others: []}
}

export const Context = createContext(initialState);

export const Store = ({children}) => {
    const [state, dispatch] = useReducer(Reducer, initialState);

    return (
        <Context.Provider value={[state, dispatch]}>
            {children}
        </Context.Provider>
    )
}