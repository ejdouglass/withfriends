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
    UPDATE_SELECTED_BAR: 'update_selected_bar'
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
            const { updatedLocation } = action.payload;
            console.log(`Receiving an updated location: ${JSON.stringify(updatedLocation)}`);
            // Anytime the 'view' dictating room/area details changes, we amend it here! Just pass in a whole new 'location' bit.
            return {...state, location: updatedLocation};
        }
        case actions.LOGOUT_CHAR: {
            return initialState;
        }
        case actions.UPDATE_WHATDO: {
            return {...state, whatDo: action.payload};
        }
        case actions.UPDATE_ACTION_INDEX: {
            return {...state, actionIndex: action.payload, whatDo: state.currentActionBar[action.payload].toLowerCase()};
        }
        case actions.UPDATE_VIEW_INDEX: {
            return {...state, viewIndex: action.payload || 0};
        }
        case actions.UPDATE_VIEW_TARGET: {
            // Hm, ok, so view target can be an ACTION, an ENTITY, an OBJECT... how to structure?
            // Maybe type/(id), so ENTER changes mode based on that
            // mob/id, npc/id, player/id open separate command screens
            // action/actionName would just do that action
            // object/id would enable further interaction with said object, depending on mode (equip/use in inventory, pick up off ground, etc.)
            console.log(`Setting viewTarget to ${action.payload}`);
            return {...state, viewTarget: action.payload};
        }
        case actions.UPDATE_TARGET: {
            return {...state, target: action.payload};
        }
        case actions.PACKAGE_FOR_SERVER: {
            return {...state, package: action.payload};
        }
        case actions.PACKAGE_FROM_SERVER: {
            return {...state, received: action.payload};
        }
        case actions.TARGET_ENTITY: {
            // receive an object with entityID, type, glance, name
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
        default: {
            return state;
        }
    }
}

/*
    Mode ponder...
    npcinteract mode! (works for shops or just chatting, because why not)
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
    currentBarSelected: 'action',
    currentActionBar: ['Magic', 'Survey Area', 'Inventory'],
    alert: undefined,
    package: undefined,
    received: undefined,
    target: undefined,
    viewTarget: undefined,
    combatTarget: undefined
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