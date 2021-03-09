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

// Hm. Lots of ways to set up the copious data... state.user.stat.strength vs state.strength, for example. Let's figure out a good balance.
const initialState = {
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
        contents: []
    },
    position: 'standing',
    healthStatus: 'fine',
    mindStatus: 'clear',
    location: {
        coords: [0, 0, 0],
        room: {}
    },
    mode: 'travel'
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