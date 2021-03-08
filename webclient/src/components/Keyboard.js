import React, { useContext, useEffect, useRef, useCallback } from 'react';
import { Context, actions } from '../context/context';
import { Container } from './styled';

const Keyboard = () => {
    const [state, dispatch] = useContext(Context);
    const keysDown = useRef({});
    const keyDownCB = useCallback(keyevent => handleKeyDown(keyevent), [handleKeyDown]);
    const keyUpCB = useCallback(keyevent => handleKeyUp(keyevent), [handleKeyUp]);

    // Down here we're going to be paying attention to the state, which should tell us what we're currently up to for proper reactions to keyevent(s)
    function handleKeyDown(e) {
        // console.log(`Pressed ${e.key}`);
        if (!keysDown.current[e.key]) {
            keysDown.current[e.key] = true;
        }
        switch (e.key) {
            case 'b': {
                if (keysDown.current['Meta']) dispatch({type: actions.TOGGLE_BACKPACK});
            }
        }
    }

    function handleKeyUp(e) {
        // console.log(`Released ${e.key}`);
        keysDown.current[e.key] = false;
    }

    useEffect(() => {
        window.addEventListener('keydown', keyDownCB);
        window.addEventListener('keyup', keyUpCB);

        return () => {
            window.removeEventListener('keydown', keyDownCB);
            window.removeEventListener('keyup', keyUpCB);
        }
    }, [keyDownCB, keyUpCB]);

    return (
        <Container></Container>
    )
}

export default Keyboard;

/*
    This component's job is to always be watching, waiting, listening.

    I'm idly currently thinking of, perhaps insanely, having this do LITERALLY EVERYTHING in the app.
    -- The user's every input will be 'heard' here; the state and actions are all tracked, so
        just gotta keep an 'eye' on what the user's trying to do and have the app respond appropriately. EZPZ?
    -- Anyway, for now, I'll enable 'full default prevention' behavior.
    -- MAXIMUM INPUT HIJACKING, mwahahahahaha *koff*

*/