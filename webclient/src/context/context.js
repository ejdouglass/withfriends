import React, { createContext, useReducer } from 'react';

export const actions = {
    TOGGLE_BACKPACK: 'toggle_backpack',
    LOAD_CHAR: 'load_char',
    SET_GAME_STATE: 'set_game_state',
    SET_ALERT: 'set_alert',
    UPDATE_ROOM: 'update_room'
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

            return {...state, ...character, above: above, around: around, below: below, alert: undefined, whatDo: mode.TRAVEL};
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
        default: {
            return state;
        }
    }
}

const mode = {
    TRAVEL: 'travel',
    CHARACTER_CREATION: 'character_creation'
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
        atMap: undefined, //Hm, this will probably become an object rather than a string at some point
        atX: -1,
        atY: -1,
        GPS: '0,0,0',
        RPS: 0,
        room: {}
    },
    whatDo: mode.CHARACTER_CREATION,
    alert: undefined
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