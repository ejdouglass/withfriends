import React, { createContext, useReducer } from 'react';

export const Reducer = (state, action) => {
    switch (action.type) {
        default: {
            return state;
        }
    }
}

const initialState = {

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