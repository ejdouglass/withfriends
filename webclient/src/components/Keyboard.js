import React, { useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { Context, actions } from '../context/context';
import { Container } from './styled';
import axios from 'axios';
import io from 'socket.io-client';
const ENDPOINT = 'http://localhost:5000';

const Keyboard = () => {
    const [state, dispatch] = useContext(Context);
    const [response, setResponse] = useState('');
    const [socketActive, setSocketActive] = useState(false);
    const keysDown = useRef({});
    const keyState = useState({});
    const keyDownCB = useCallback(keyevent => handleKeyDown(keyevent), [handleKeyDown]);
    const keyUpCB = useCallback(keyevent => handleKeyUp(keyevent), [handleKeyUp]);
    let socketToMe = undefined;
    const history = useHistory();

    // Down here we're going to be paying attention to the state, which should tell us what we're currently up to for proper reactions to keyevent(s)
    function handleKeyDown(e) {
        // console.log(`Pressed ${e.key}`);
        // NOTE: Currently NOT preventing default, but we may wish to in some cases.
        if (!keysDown.current[e.key]) {
            keysDown.current[e.key] = true;
        }
        switch (e.key) {
            // Did a HAX below for now, but going forward, let's sort out ways to parse state.whatDo/game mode/gamestate
            case 'b': {
                if (keysDown.current['Meta'] && state.whatDo !== 'character_creation') dispatch({type: actions.TOGGLE_BACKPACK});
            }
            case 'w':
            case 'e':
            case 'd':
            case 'c':
            case 'x':
            case 'z':
            case 'a':
            case 'q':                
                {
                    if (state.whatDo !== 'character_creation') {
                        const mover = {who: state.name, where: e.key};
                        socketToMe.emit('movedir', mover);
                    }
                    // Right now ANY connected entity is using this code to manipulate the single 'character' dummy in API...
                    // I can think of a few ways to implement separate characters, but offhand:
                    // Use normal axios/auth stuff to log in/select character, which can then prepare global variables to ship with these requests
                    // Package in any crypto-signed goodies to measure validity of commands/origin of commands? 
                    // Well, get a basic implementation down, then expand to minFR status
                    // const mover = {who: state.name, where: e.key};
                    
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

    // useEffect(() => {
    //     const socket = io(ENDPOINT);
    //     setSocketActive(true);
    //     socket.on('FromAPI', data => {
    //         setResponse(data);
    //     });

    //     return () => {
    //         socket.disconnect();
    //         setSocketActive(false);
    //     };
    // }, []);

    useEffect(() => {
        // Gonna see if SOCKET CONNECTION can be set up effectively in here ... so far, mostly yes? Might have to set up unmounting behavior.
        if (state.name !== undefined) {
            socketToMe = io(ENDPOINT);
            socketToMe.on('connect', () => {
                socketToMe.emit('login', state);
            });
            socketToMe.on('moved_dir', data => {
                console.log(data);
                // HERE: unpack data, adjust state via dispatch - room details, weather, time of day, etc.
            });
        } else {
            history.push('/');
        }
    }, [state.name])

    useEffect(() => {
        console.log(`Keystate has changed!`);
    }, [keyState]);

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