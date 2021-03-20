import React, { createContext, useReducer } from 'react';

export const actions = {
    TOGGLE_BACKPACK: 'toggle_backpack',
    LOAD_CHAR: 'load_from_localstorage_char',
    SET_GAME_STATE: 'set_game_state'
}

export const Reducer = (state, action) => {
    switch (action.type) {
        case actions.TOGGLE_BACKPACK: {
            return {...state, backpack: {...state.backpack, open: !state.backpack.open}};
        }
        case actions.LOAD_CHAR: {
            // Receive a valid GUY or GUYETTE from the backend and set up global state accordingly
            return state;
        }
        case actions.SET_GAME_STATE: {
            return {...state, whatDo: action.payload}
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
    characterName: undefined,
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
        room: {}
    },
    whatDo: mode.CHARACTER_CREATION
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