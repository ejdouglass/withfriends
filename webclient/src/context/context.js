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

const initialState = {
    above: {
        type: 'sky',
        color: 'hsl(215, 90%, 75%)'
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
    }
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