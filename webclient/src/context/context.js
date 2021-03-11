import React, { createContext, useReducer } from 'react';

export const actions = {
    TOGGLE_BACKPACK: 'toggle_backpack'
}

export const Reducer = (state, action) => {
    switch (action.type) {
        case actions.TOGGLE_BACKPACK: {
            return {...state, backpack: {...state.backpack, open: !state.backpack.open}};
        }
        default: {
            return state;
        }
    }
}

const mode = {
    TRAVEL: 'travel'
}

const initialState = {
    name: 'Noname Smith',
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
        stackModifiers: []
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
        strength: 20,
        agility: 20,
        constitution: 20,
        willpower: 20,
        intelligence: 20,
        wisdom: 20,
        charisma: 20
    },
    location: {
        coords: [0, 0, 0],
        room: {}
    },
    whatDo: mode.TRAVEL
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