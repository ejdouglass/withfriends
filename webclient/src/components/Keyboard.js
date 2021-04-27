import React, { useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { Context, actions } from '../context/context';
import { Container } from './styled';
import axios from 'axios';
import io from 'socket.io-client';
let socketToMe;
const ENDPOINT = 'http://localhost:5000';

const Keyboard = () => {
    const [state, dispatch] = useContext(Context);
    const [response, setResponse] = useState('');
    const [socketActive, setSocketActive] = useState(false);
    const keysDown = useRef({});
    const keyState = useState({});
    const keyDownCB = useCallback(keyevent => handleKeyDown(keyevent), [handleKeyDown]);
    const keyUpCB = useCallback(keyevent => handleKeyUp(keyevent), [handleKeyUp]);
    const history = useHistory();

    // Down here we're going to be paying attention to the state, which should tell us what we're currently up to for proper reactions to keyevent(s)
    function handleKeyDown(e) {
        if (e.key === 'Enter') {
            // HERE: basically, "do the thing that's currently selected"
        }
        if (e.key === 'Tab' && state.whatDo !== 'character_creation') {
            e.preventDefault();
            if (state.whatDo === 'talk') {
                return dispatch({type: actions.UPDATE_WHATDO, payload: 'explore'});
            }
            return dispatch({type: actions.UPDATE_WHATDO, payload: 'talk'});
        }
        if (state.whatDo === 'talk' || state.whatDo === 'character_creation') return;
        // console.log(`Pressed ${e.key}`);
        // ArrowUp, ArrowDown, ArrowLeft, ArrowRight, 1, 2, 3, 4, etc.
        // NOTE: Currently NOT preventing default, but we may wish to in some cases.
        if (!keysDown.current[e.key]) {
            keysDown.current[e.key] = true;
        }

        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            // UPDATE: context-sensitive blooping
            if (state.whatDo === 'explore' && state.currentBarSelected === 'action') {
                let newIndex;
                let changeAmount = (e.key === 'ArrowUp') ? -1 : 1;
                newIndex = state.viewIndex + changeAmount;
                if (newIndex < 0) newIndex = state.currentActionBar.length - 1;
                if (newIndex >= state.currentActionBar.length) newIndex = 0;
                dispatch({type: actions.UPDATE_VIEW_INDEX, payload: newIndex});
            }
            if (state.whatDo === 'explore' && state.currentBarSelected === 'entity') {
                // HERE: boop along on the right side
                let changeAmount = (e.key === 'ArrowUp') ? -1 : 1;
                dispatch({type: actions.UPDATE_VIEW_INDEX, payload: state.viewIndex + changeAmount});
            }
        }

        if (e.key === 'ArrowRight') {
            dispatch({type: actions.UPDATE_VIEW_INDEX, payload: 0});
            if (state.whatDo === 'explore') {
                if (state.currentBarSelected === 'action' && (state.location?.room?.npcs?.length + state.location?.room?.mobs?.length + state.location?.room?.players?.length) > 1) {
                    return dispatch({type: actions.UPDATE_SELECTED_BAR, payload: 'entity'});
                }
                // else dispatch({type: actions.UPDATE_SELECTED_BAR, payload: 'action'});                
            }   
        }
        if (e.key === 'ArrowLeft') {
            dispatch({type: actions.UPDATE_VIEW_INDEX, payload: 0});
            if (state.whatDo === 'explore' && state.currentBarSelected === 'entity') return dispatch({type: actions.UPDATE_SELECTED_BAR, payload: 'action'});
        }

        switch (e.key) {
            // Did a HAX below for now, but going forward, let's sort out ways to parse state.whatDo/game mode/gamestate
            case '1': {
                return dispatch({type: actions.PACKAGE_FOR_SERVER, payload: {action: 'interact_with_structure', index: 0}});
            }
            // case 'ArrowUp': {
            //     let newIndex;
            //     if (state.actionIndex === 0) newIndex = state.currentActionBar.length - 1
            //     else newIndex = state.actionIndex - 1;
            //     dispatch({type: actions.UPDATE_ACTION_INDEX, payload: newIndex});
            //     break;
            // }
            // case 'ArrowDown': {
            //     let newIndex;
            //     if (state.actionIndex === state.currentActionBar.length - 1) newIndex = 0
            //     else newIndex = state.actionIndex + 1;
            //     dispatch({type: actions.UPDATE_ACTION_INDEX, payload: newIndex});
            //     break;
            // }
            case 'b': {
                if (keysDown.current['Meta']) dispatch({type: actions.TOGGLE_BACKPACK});
                break;
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
                    // Sometimes doesn't trigger, but that's always been the case. Hm. Mostly when I save here and it reloads over there. But not always!
                    // Might just be failure to add event listener at some step? 
                    if (state.whatDo === 'explore') {
                        const mover = {who: state.entityID, where: e.key};
                        socketToMe.emit('movedir', mover);
                    }
                    break;
                    // Right now ANY connected entity is using this code to manipulate the single 'character' dummy in API...
                    // I can think of a few ways to implement separate characters, but offhand:
                    // Use normal axios/auth stuff to log in/select character, which can then prepare global variables to ship with these requests
                    // Package in any crypto-signed goodies to measure validity of commands/origin of commands? 
                    // Well, get a basic implementation down, then expand to minFR status
                    // const mover = {who: state.name, where: e.key};
                    
                }
            case 'h': {
                return dispatch({type: actions.PACKAGE_FOR_SERVER, payload: {action: 'hide'}});
            }
            case 'f': {
                return dispatch({type: actions.PACKAGE_FOR_SERVER, payload: {action: 'forage'}});
            }
            case 's': {
                return dispatch({type: actions.PACKAGE_FOR_SERVER, payload: {action: 'search'}});                
            }
            case 'm': {
                return (state.whatDo === 'explore' ? dispatch({type: actions.UPDATE_WHATDO, payload: 'magic'}) : dispatch({type: actions.UPDATE_WHATDO, payload: 'explore'}))
            }
        }
    }


    function handleKeyUp(e) {
        // console.log(`Released ${e.key}`);
        keysDown.current[e.key] = false;
    }

    function loadCharFromToken(charToken) {
        // THIS: axios passes the charToken to the API in an attempt to load up the character in question
        axios.post('/character/login', { charToken: charToken })
            .then(res => {
                console.log(res.data);
                dispatch({type: actions.LOAD_CHAR, payload: {character: res.data.payload.character}});
                localStorage.setItem('withFriendsJWT', res.data.payload.token);
                history.push('/play');

                // HERE: dispatch alert if sucessfully failed :P
            })
            .catch(err => {
                console.log(err);
                history.push('/');
                // HERE: dispatch alert for user feedback
            });
    }


    
    useEffect(() => {
        window.addEventListener('keydown', keyDownCB);
        window.addEventListener('keyup', keyUpCB);

        return () => {
            window.removeEventListener('keydown', keyDownCB);
            window.removeEventListener('keyup', keyUpCB);
        }
    }, [keyDownCB, keyUpCB]);

    useEffect(() => {
        // This doesn't work well with our new additional screens. Rejigger this concept a bit.
        if (state.name !== undefined) {
            if (!socketActive) setSocketActive(true);
        }
    }, [state.name])

    useEffect(() => {
        // This super assumes there's ALWAYS a token present for a valid playing character. Shouuuuuld be a fairly safe assumption for now.
        const charToken = localStorage.getItem('withFriendsJWT');
        if (charToken) {
            console.log(`Found a token! Attempting to load from it.`);
            loadCharFromToken(charToken);
        } else {
            history.push('/');
        }
    }, []);

    useEffect(() => {
        // Ok, this works! But did NOT work when I defined socketToMe's variable was declared in the component. There's a lesson in there somewhere.

        // New consideration/realization: almost EVERY emit from backend should include a room update to be parsed here
        if (socketActive) {
            socketToMe = io(ENDPOINT);
            socketToMe.on('connect', () => {
                socketToMe.emit('login', state);
            });
            socketToMe.on('moved_dir', data => {
                console.log(data.feedback);
                dispatch({type: actions.UPDATE_ROOM, payload: { updatedLocation: data.newLocation }});
                // HERE: unpack data, adjust state via dispatch - room details, weather, time of day, etc.
            });
            socketToMe.on('room_event', stringy => {
                // console.log(stringy);
                dispatch({type: actions.PACKAGE_FROM_SERVER, payload: stringy});
            });
            socketToMe.on('own_action_result', resultString => {
                // console.log(resultString);
                dispatch({type: actions.PACKAGE_FROM_SERVER, payload: resultString});
            });
            
            return () => {
                socketToMe.disconnect();
            }
        }
    }, [socketActive]);

    useEffect(() => {
        if (socketActive && state.named === undefined) {
            setSocketActive(false);
        }
    }, [state.name]);

    useEffect(() => {
        if (state?.package?.action) {
            socketToMe.emit('action', state.package);
            dispatch({type: actions.PACKAGE_FOR_SERVER, payload: undefined});
        }
    }, [state.package]);

    // useEffect(() => {
    //     console.log(`Keystate has changed!`);
    // }, [keyState]);

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