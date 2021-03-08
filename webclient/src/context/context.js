import React, { createContext, useReducer } from 'react';

export const actions = {
    OPEN_BACKPACK: 'open_backpack',
    CLOSE_BACKPACK: 'close_backpack',
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
    sky: {
        color: 'bright blue'
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