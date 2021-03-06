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
        // console.log(`Pressed ${e.key}`);
        // ArrowUp, ArrowDown, ArrowLeft, ArrowRight, 1, 2, 3, 4, etc.
        if (!keysDown.current[e.key]) {
            // This was based on an older model that expected stuff like Shift or Meta + additional key. Will leave this here for now, but may remove later.
            keysDown.current[e.key] = true;
        }        

        // CHANGE: need to account for all current possible whatDo scenarios; can get into trouble trying to do things while npcinteract is up, for example
        // Do I want a 'master switch' for whatDo? And then handle the keys from there? Possibly.
        // Ok, time to do it. WHEEBALL!
        switch (state.whatDo) {
 
            case 'combat': {
                // Let's decide on some keys to use for combat!
                // The numbered key for shortcuts to techs/etc., definitely... oh, we should have combatShortcuts defined somewhere, huh? 
                //  -- Weapon/equipment techs should be readily available; menu for 'slower' selections?
                //  -- also maybe work with arrow keys in concert with specific alpha keys
                if (e.key === 'r') {
                    dispatch({type: actions.UPDATE_FIGHTING});
                    dispatch({type: actions.PACKAGE_FROM_SERVER, payload: {echo: `You run the heck out of combat. Whew!`}});
                    return dispatch({type: actions.UPDATE_WHATDO, payload: 'explore'});
                }
                if (e.key === 'a') {
                    return dispatch({type: actions.PACKAGE_FOR_SERVER, payload: {action: 'combatact', attack: 'strike'}});
                }
                break;
            }

            case 'explore': {
                if (e.key === 'w' || e.key === 'e' || e.key === 'd' || e.key === 'c' || e.key === 'x' || e.key === 'z' || e.key === 'a' || e.key === 'q') {
                    // probably change this into more now-standard PACKAGE_FOR_SERVER style call
                    const mover = {who: state.entityID, where: e.key};
                    return socketToMe.emit('movedir', mover); 
                }
                if (e.key === 'h') return dispatch({type: actions.PACKAGE_FOR_SERVER, payload: {action: 'hide'}});
                if (e.key === 'u') return dispatch({type: actions.PACKAGE_FOR_SERVER, payload: {action: 'unhide'}});
                if (e.key === 'f') return dispatch({type: actions.PACKAGE_FOR_SERVER, payload: {action: 'forage'}});
                if (e.key === 's') return dispatch({type: actions.PACKAGE_FOR_SERVER, payload: {action: 'search'}});
                
                if (e.key === 'm') {
                    dispatch({type: actions.UPDATE_VIEW_INDEX});
                    dispatch({type: actions.UPDATE_ACTION_BAR, payload: ['(C)ast', '(P)repare']});
                    dispatch({type: actions.UPDATE_VIEW_TARGET, payload: {type: 'spell', id: state.spells[0].name}});
                    return dispatch({type: actions.UPDATE_WHATDO, payload: 'magic'});
                }
                
                
                if (e.key === 't') return dispatch({type: actions.UPDATE_WHATDO, payload: 'stats'});

                if (e.key === 'i') {
                    // Update viewIndex, currentBarSelected, and viewTarget:
                    dispatch({type: actions.UPDATE_VIEW_INDEX});
                    dispatch({type: actions.UPDATE_SELECTED_BAR, payload: 'inventory/1'});
                    dispatch({type: actions.UPDATE_VIEW_TARGET, payload: {type: 'inventory', id: 0, item: {...state.backpack?.contents1[0]}}});
                    dispatch({type: actions.UPDATE_ACTION_BAR, payload: setActionBar(state?.backpack[`contents1`][0]?.type?.mainType)}); 
                    return dispatch({type: actions.UPDATE_WHATDO, payload: 'inventory'});
                }
                if (e.key === 'Tab') {
                    e.preventDefault();
                    return dispatch({type: actions.UPDATE_WHATDO, payload: 'talk'});
                }
                if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                    // UPDATE: context-sensitive blooping
                    if (state.currentBarSelected === 'action') {
                        let newIndex;
                        let changeAmount = (e.key === 'ArrowUp') ? -1 : 1;
                        newIndex = state.viewIndex + changeAmount;
                        if (newIndex < 0) newIndex = state.currentActionBar.length - 1;
                        if (newIndex >= state.currentActionBar.length) newIndex = 0;
                        dispatch({type: actions.UPDATE_VIEW_INDEX, payload: newIndex});
                        return dispatch({type: actions.UPDATE_VIEW_TARGET, payload: {type: 'action', id: state.currentActionBar[newIndex].toLowerCase()}});
                    }
                    if (state.currentBarSelected === 'entity') {
                        // HERE: boop along on the right side
                        let changeAmount = (e.key === 'ArrowUp') ? -1 : 1;
                        return dispatch({type: actions.UPDATE_VIEW_INDEX, payload: state.viewIndex + changeAmount});
                        // normally we'd have returned the viewTarget from here, but that's handled in MainView.js, so popping over there instead
                    }
                }
                if (e.key === 'ArrowRight') {
                    if (state.currentBarSelected === 'action' && (state.location?.room?.npcs?.length + state.location?.room?.mobs?.length + state.location?.room?.players?.length) > 1) {
                        dispatch({type: actions.UPDATE_VIEW_INDEX, payload: 0});
                        return dispatch({type: actions.UPDATE_SELECTED_BAR, payload: 'entity'});
                    }
                    // else dispatch({type: actions.UPDATE_SELECTED_BAR, payload: 'action'});                
                }
                if (e.key === 'ArrowLeft') {
                    if (state.currentBarSelected === 'entity') {
                        dispatch({type: actions.UPDATE_VIEW_INDEX, payload: 0});
                        dispatch({type: actions.UPDATE_SELECTED_BAR, payload: 'action'});
                        return dispatch({type: actions.UPDATE_VIEW_TARGET, payload: {type: 'action', id: state.currentActionBar[0].toLowerCase()}})
                    }
                }
                if (e.key === 'Enter') {
                    switch (state.viewTarget?.type) {
                        case 'action': {
                            if (state.viewTarget?.id === '(m)agic') dispatch({type: actions.UPDATE_WHATDO, payload: 'magic'});
                            return console.log(`I wish to take action! :-D`);
                        }
                        case 'npc': {
                            dispatch({type: actions.PACKAGE_FOR_SERVER, payload: {action: 'npcinteract', target: state.viewTarget.id}});
                            dispatch({type: actions.UPDATE_TARGET, payload: {...state.viewTarget}});
                            dispatch({type: actions.UPDATE_WHATDO, payload: 'npcinteract'});
                            return console.log(`Time to interact with an NPC!`);
                        }
                        case 'mob': {
                            /* 
                                Aha! Now we have all the bits on the backend to initiate COMBAT. Let's set that up!
                                ... just using enter is good, but what if we want to sneak and steal?
                                ... we can use the NPC interact model above to open a menu, and have a quick key like "V" be quick-combat-mode
                                Next step is to study how combat initiates from the muglin's perspective and enable that to start up from the client here

                                io.to(characters[this.fighting.main].name).emit('character_data', {
                                    echo: `You feel the menace of MUGLIN COMBAT!`,
                                    type: 'combatinit',
                                    fightingObj: characters[this.fighting.main].fighting,
                                });      
                                .... the above should be key to init-ing the combat from the client.

                                Let's see. We need to send to backend the mob's ID, which can initiate combat in the backend, and then send the above back.

                            */

                            dispatch({type: actions.PACKAGE_FOR_SERVER, payload: {action: 'combatinit', target: state.viewTarget?.id}});
                            return console.log(`Time to engage a mob! Possibly in MORTAL COMBAT!!`);
                        }
                        case 'player': {
                            return console.log(`Who dis? Let's play with another player!`);
                        }
                        case 'npcinteraction': {
                            return console.log(`You are viewing this: ${JSON.stringify(state.viewTarget)}`);
                        }
                        case 'portal': {
                            return console.log(`It would be great to enter this portal!`);
                        }
                    }
                }
            }

            case 'talk': {
                if (e.key === 'Tab') {
                    e.preventDefault();
                    return dispatch({type: actions.UPDATE_WHATDO, payload: 'explore'});
                }
                return;
            }

            case 'npcinteract': {
                // Shenanigans to occur here! Mwaha!
                // Hm. Lemme update UPDATE_WHATDO real quick...
                // Great! Ok, now we need to update VIEW_TARGET so we can PACKAGE_FOR_SERVER the npc-interact goodies.
                if (e.key === 'ArrowRight') return dispatch({type: actions.UPDATE_VIEW_INDEX, payload: state.viewIndex + 1});
                if (e.key === 'ArrowLeft') return dispatch({type: actions.UPDATE_VIEW_INDEX, payload: state.viewIndex - 1});   
                if (e.key === 'Enter') {
                    // Time to update this in concert with MainView: remove package_for_server except in specific cases
                    if (state.viewTarget?.menu === 'Leave') {
                        dispatch({type: actions.UPDATE_TARGET, payload: {}});
                        return dispatch({type: actions.UPDATE_WHATDO, payload: 'explore'});
                    } 
                    if (state.viewTarget?.menu) {
                        // console.log(`Activating new menu selection: ${state.viewTarget.menu}`);
                        return dispatch({type: actions.UPDATE_SELECTED_BAR, payload: `npcmenu/${state.viewTarget?.menu}`});
                    }
                    
                    // else {
                    //     return dispatch({type: actions.PACKAGE_FOR_SERVER, payload: {...state.viewTarget, action: 'npcinteraction'}})
                    // }
                }
                return;           
            }

            case 'magic': {
                if (e.key === 'm') return dispatch({type: actions.UPDATE_WHATDO, payload: 'explore'});

                if (e.key === 'ArrowDown') {
                    if (state.viewIndex < state.spells.length - 1) {
                        dispatch({type: actions.UPDATE_VIEW_TARGET, payload: {type: 'spell', id: state.spells[state.viewIndex + 1].name}});
                        return dispatch({type: actions.UPDATE_VIEW_INDEX, payload: state.viewIndex + 1});
                    }
                    return;
                }
                if (e.key === 'ArrowUp') {
                    if (state.viewIndex > 0) {
                        dispatch({type: actions.UPDATE_VIEW_TARGET, payload: {type: 'spell', id: state.spells[state.viewIndex - 1].name}});
                        return dispatch({type: actions.UPDATE_VIEW_INDEX, payload: state.viewIndex - 1});
                    }
                    return;
                }

                if (e.key === 'c') {
                    // HERE: default cast, simplest mechanics
                    dispatch({type: actions.PACKAGE_FOR_SERVER, payload: {action: 'spellcast', spell: state.spells[state.viewIndex].id, spellParams: 'default'}});
                    return;
                }

                if (e.key === 'p') {
                    // Intent: open up the spellcasting menu to twiddle with variables
                    return;
                }

                return;
            }

            case 'stats': {
                if (e.key === 't') return dispatch({type: actions.UPDATE_WHATDO, payload: 'explore'});
                return;
            }

            case 'inventory': {
                // Let's review what's happening here so we can add 'interactions' to items (equipping, using, etc.)
                // Obviously we need to add 'Enter' as a functional command here, which should result in... hm, let's see:
                /*
                    Ok! More room to breathe. Good.
                    Should ENTER auto-equip gear? ... well, we don't have the left menu changing yet, but some commands...
                    (E)quip - for now, automatically slots into proper field (main hand for weapons)
                    (O)ffhand - for dual wielding :P (can do later, doesn't need to be a release feature)
                    (D)rop
                    (U)se - context-specific depending on the item (currently prefer this rather than multiple different context-specific/item-specific commands)
                    (G)ive - maybe in a later version
                    (S)ort (ultimately, not a first priority)

                    How to trigger it? Hm, when we know what we're selecting, we can UPDATE_ACTION_BAR with relevant commands
                    ... then when a command is entered, update on backend and reflect to frontend

                    Looks like we're using 'currentBarSelected' for equipment, inventory/1, etc.
                    And our VIEW_TARGET has the index in 'id' and the item itself in 'item' ... that should be all we need!
                    -- Can use these two factors to 'target' the item on the server for the intended use/effect
                    
                    ... ok, so when we flit about, we need an extra DISPATCH event: 'read' the item's type and UPDATE_ACTION_BAR with commands that work with it
                    ... and then add handlers for all the interaction keys, such as (E)quip, etc.

                    When selecting equipped items, can Un(E)quip :P, as well as USE



                    ... guess I need to add a 'use' part of the Item class so these things can have such effects :P

                */
                if (e.key === 'i') return dispatch({type: actions.UPDATE_WHATDO, payload: 'explore'});

                // The Arrow keys below have some redundancies; can DRY it out later
                if (e.key === 'ArrowLeft') {
                    if (state.currentBarSelected === 'inventory/1') {
                        dispatch({type: actions.UPDATE_VIEW_INDEX});
                        dispatch({type: actions.UPDATE_VIEW_TARGET, payload: {type: 'equipment', id: 0, item: {...state?.equipped?.rightHand}}});
                        return dispatch({type: actions.UPDATE_SELECTED_BAR, payload: 'equipment'});
                    }
                    if (state.currentBarSelected === 'equipment') return;
                    let inventorySpot = state.currentBarSelected.split('/');
                    inventorySpot[1] = parseInt(inventorySpot[1]) - 1;
                    dispatch({type: actions.UPDATE_VIEW_TARGET, payload: {type: 'inventory', id: state.viewIndex, item: {...state?.backpack[`contents${inventorySpot[1].toString()}`][state.viewIndex]}}});
                    dispatch({type: actions.UPDATE_ACTION_BAR, payload: setActionBar(state?.backpack[`contents${inventorySpot[1].toString()}`][state.viewIndex]?.type?.mainType)});
                    return dispatch({type: actions.UPDATE_SELECTED_BAR, payload: inventorySpot.join('/')});
                }

                if (e.key === 'ArrowRight') {
                    if (state.currentBarSelected === 'inventory/2' && state.backpack?.size < 3) return;
                    if (state.currentBarSelected === 'inventory/3' && state.backpack?.size < 4) return;
                    if (state.currentBarSelected === 'equipment') {
                        dispatch({type: actions.UPDATE_VIEW_INDEX});
                        dispatch({type: actions.UPDATE_VIEW_TARGET, payload: {type: 'inventory', id: 0, item: {...state?.backpack?.contents1[0]}}});
                        return dispatch({type: actions.UPDATE_SELECTED_BAR, payload: 'inventory/1'});
                    }
                    if (state.currentBarSelected === 'inventory/4') return;
                    let inventorySpot = state.currentBarSelected.split('/');
                    inventorySpot[1] = parseInt(inventorySpot[1]) + 1;
                    dispatch({type: actions.UPDATE_VIEW_TARGET, payload: {type: 'inventory', id: state.viewIndex, item: {...state?.backpack[`contents${inventorySpot[1].toString()}`][state.viewIndex]}}});
                    dispatch({type: actions.UPDATE_ACTION_BAR, payload: setActionBar(state?.backpack[`contents${inventorySpot[1].toString()}`][state.viewIndex]?.type?.mainType)});
                    return dispatch({type: actions.UPDATE_SELECTED_BAR, payload: inventorySpot.join('/')});
                }

                if (e.key === 'ArrowUp') {
                    if (state.viewIndex === 0) return;
                    let inventoryColumn = state.currentBarSelected.split('/');
                    inventoryColumn = inventoryColumn[1];
                    if (state.currentBarSelected === 'equipment') {
                        let equipmentTarget;
                        switch (state.viewIndex - 1) {
                            case 0: {
                                equipmentTarget = 'rightHand';
                                break;
                            }
                            case 1: {
                                equipmentTarget = 'leftHand';
                                break;
                            }
                            case 2: {
                                equipmentTarget = 'head';
                                break;
                            }
                            case 3: {
                                equipmentTarget = 'body';
                                break;
                            }
                            case 4: {
                                equipmentTarget = 'accessory';
                                break;
                            }
                        }
                        dispatch({type: actions.UPDATE_VIEW_TARGET, payload: {type: state.viewTarget.type, id: state.viewIndex - 1, item: {...state?.equipped[equipmentTarget]}}});
                    }
                    if (state.currentBarSelected.split('/')[0] === 'inventory') dispatch({type: actions.UPDATE_VIEW_TARGET, payload: {type: state.viewTarget.type, id: state.viewIndex - 1, item: {...state?.backpack[`contents${inventoryColumn.toString()}`][state.viewIndex - 1]}}});
                    // console.log(`VIEWTARGET IS NOW: ${JSON.stringify(state.viewTarget)}`);
                    // The above works-ISH, the viewtarget is the PREVIOUS viewTarget (the dispatch doesn't take effect instantly)
                    // Ok, we have inventoryColumn 1 or 2 or 3 or 4 for contents1, etc. ... and viewIndex for the index within that column

                    // The fxn below returns the ARRAY of options for the item; use w/ dispatch here
                    if (state.currentBarSelected !== 'equipment') dispatch({type: actions.UPDATE_ACTION_BAR, payload: setActionBar(state?.backpack[`contents${inventoryColumn.toString()}`][state.viewIndex - 1]?.type?.mainType)}); 

                    return dispatch({type: actions.UPDATE_VIEW_INDEX, payload: state.viewIndex - 1});
                }

                if (e.key === 'ArrowDown') {
                    if (state.currentBarSelected === 'equipment' && state.viewIndex === 5) return;
                    if (state.currentBarSelected.split('/')[0] === 'inventory' && state.viewIndex === 9) return;
                    let inventoryColumn = state.currentBarSelected.split('/');
                    inventoryColumn = inventoryColumn[1];
                    if (state.currentBarSelected === 'equipment') {
                        let equipmentTarget;
                        switch (state.viewIndex + 1) {
                            case 1: {
                                equipmentTarget = 'leftHand';
                                break;
                            }
                            case 2: {
                                equipmentTarget = 'head';
                                break;
                            }
                            case 3: {
                                equipmentTarget = 'body';
                                break;
                            }
                            case 4: {
                                equipmentTarget = 'accessory';
                                break;
                            }
                            case 5: {
                                equipmentTarget = 'trinket';
                                break;
                            }
                        }
                        dispatch({type: actions.UPDATE_VIEW_TARGET, payload: {type: state.viewTarget.type, id: state.viewIndex + 1, item: {...state?.equipped[equipmentTarget]}}});                        
                    }
                    if (state.currentBarSelected.split('/')[0] === 'inventory') dispatch({type: actions.UPDATE_VIEW_TARGET, payload: {type: state.viewTarget.type, id: state.viewIndex + 1, item: {...state?.backpack[`contents${inventoryColumn.toString()}`][state.viewIndex + 1]}}});
                    
                    if (state.currentBarSelected !== 'equipment') dispatch({type: actions.UPDATE_ACTION_BAR, payload: setActionBar(state?.backpack[`contents${inventoryColumn.toString()}`][state.viewIndex + 1]?.type?.mainType)});
                    return dispatch({type: actions.UPDATE_VIEW_INDEX, payload: state.viewIndex + 1});
                }

                if (e.key === 'e') {
                    // Ok! The below works great for equipping from backpack.
                    // ... we still need to add something to handle UN-equipping stuff. :P
                    // Shouldn't be hard; just add handling so the below doesn't crash when currentBarSelected === equipment, 
                    //  then extra server handling for when column is equipment
                    if (state.currentBarSelected === 'equipment') return dispatch({type: actions.PACKAGE_FOR_SERVER, payload: {action: 'equip', column: 'equipment', index: state.viewIndex}});                    
                    if (state.backpack[`contents${state.currentBarSelected.split('/')[1]}`][state.viewIndex]) return dispatch({type: actions.PACKAGE_FOR_SERVER, payload: {action: 'equip', column: `contents${state.currentBarSelected.split('/')[1]}`, index: state.viewIndex}});
                }

                return;
            }

            case 'character_creation': {
                if (e.key === 'Tab' && state.currentBarSelected !== 'action') e.preventDefault();
                if (e.key === 'ArrowRight') {
                    if (state.viewIndex >= 2) return;
                    return dispatch({type: actions.UPDATE_VIEW_INDEX, payload: state.viewIndex + 1});
                }
                if (e.key === 'ArrowLeft') {
                    if (state.viewIndex > 0) return dispatch({type: actions.UPDATE_VIEW_INDEX, payload: state.viewIndex - 1});
                    return;
                }
                if (e.key === 'ArrowDown') {
                    // dispatch({type: actions.UPDATE_VIEW_INDEX});
                    // console.log(`Boop, arrow down.`)
                    switch (state.currentBarSelected) {
                        case 'enterName': {
                            // console.log(`Switching to chooseHomeTown...`);
                            return dispatch({type: actions.UPDATE_SELECTED_BAR, payload: 'chooseHometown'});
                        }
                        case 'chooseHometown': {
                            return dispatch({type: actions.UPDATE_SELECTED_BAR, payload: 'chooseClass'});
                        }
                        case 'chooseClass': {
                            // console.log(`current bar should be enterPassword`)
                            return dispatch({type: actions.UPDATE_SELECTED_BAR, payload: 'enterPassword'});
                        }
                        case 'enterPassword': {
                            return dispatch({type: actions.UPDATE_SELECTED_BAR, payload: 'createCharacter'});
                        }
                        default: {
                            return;
                        }
                    }
                }
                if (e.key === 'ArrowUp') {
                    // dispatch({type: actions.UPDATE_VIEW_INDEX});
                    switch (state.currentBarSelected) {
                        case 'chooseClass': {
                            return dispatch({type: actions.UPDATE_SELECTED_BAR, payload: 'chooseHometown'});
                        }
                        case 'chooseHometown': {
                            return dispatch({type: actions.UPDATE_SELECTED_BAR, payload: 'enterName'});
                        }
                        case 'enterPassword': {
                            return dispatch({type: actions.UPDATE_SELECTED_BAR, payload: 'chooseClass'});
                        }
                        case 'createCharacter': {
                            return dispatch({type: actions.UPDATE_SELECTED_BAR, payload: 'enterPassword'});
                        }
                        default: {
                            return;
                        }
                    }
                }
                if (e.key === 'Enter') {
                    // Outdated mode; change to 'select' whatever is currently viewed on charCreation page
                    return dispatch({type: actions.UPDATE_VIEW_INDEX, payload: (state.viewIndex + 1) * -1});
                }
            }

        }

        // if (state.whatDo === 'talk' || state.whatDo === 'character_creation') return;
        // if (e.key === 'Enter') {

        //     switch (state.viewTarget?.type) {
        //         case 'action': {
        //             if (state.viewTarget?.id === 'magic') dispatch({type: actions.UPDATE_WHATDO, payload: 'magic'});
        //             return console.log(`I wish to take action! :-D`);
        //         }
        //         case 'npc': {
        //             dispatch({type: actions.PACKAGE_FOR_SERVER, payload: {action: 'npcinteract', target: state.viewTarget.id}});
        //             dispatch({type: actions.UPDATE_TARGET, payload: {...state.viewTarget}});
        //             dispatch({type: actions.UPDATE_WHATDO, payload: 'npcinteract'});
        //             return console.log(`Time to interact with an NPC!`);
        //         }
        //         case 'mob': {
        //             return console.log(`Time to engage a mob! Possibly in MORTAL COMBAT!!`);
        //         }
        //         case 'player': {
        //             return console.log(`Who dis? Let's play with another player!`);
        //         }
        //         case 'npcinteraction': {
        //             return console.log(`You are viewing this: ${JSON.stringify(state.viewTarget)}`);
        //         }
        //         case 'portal': {
        //             return console.log(`It would be great to enter this portal!`);
        //         }
        //     }
        // }        

        // if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        //     // UPDATE: context-sensitive blooping
        //     if (state.whatDo === 'explore' && state.currentBarSelected === 'action') {
        //         let newIndex;
        //         let changeAmount = (e.key === 'ArrowUp') ? -1 : 1;
        //         newIndex = state.viewIndex + changeAmount;
        //         if (newIndex < 0) newIndex = state.currentActionBar.length - 1;
        //         if (newIndex >= state.currentActionBar.length) newIndex = 0;
        //         dispatch({type: actions.UPDATE_VIEW_INDEX, payload: newIndex});
        //         return dispatch({type: actions.UPDATE_VIEW_TARGET, payload: {type: 'action', id: state.currentActionBar[newIndex].toLowerCase()}});
        //     }
        //     if (state.whatDo === 'explore' && state.currentBarSelected === 'entity') {
        //         // HERE: boop along on the right side
        //         let changeAmount = (e.key === 'ArrowUp') ? -1 : 1;
        //         return dispatch({type: actions.UPDATE_VIEW_INDEX, payload: state.viewIndex + changeAmount});
        //         // normally we'd have returned the viewTarget from here, but that's handled in MainView.js, so popping over there instead
        //     }
        // }

        // if (e.key === 'ArrowRight') {
        //     if (state.whatDo === 'explore') {
        //         if (state.currentBarSelected === 'action' && (state.location?.room?.npcs?.length + state.location?.room?.mobs?.length + state.location?.room?.players?.length) > 1) {
        //             dispatch({type: actions.UPDATE_VIEW_INDEX, payload: 0});
        //             dispatch({type: actions.UPDATE_SELECTED_BAR, payload: 'entity'});
        //         }
        //         // else dispatch({type: actions.UPDATE_SELECTED_BAR, payload: 'action'});                
        //     }   
        // }
        // if (e.key === 'ArrowLeft') {
        //     if (state.whatDo === 'explore' && state.currentBarSelected === 'entity') {
        //         dispatch({type: actions.UPDATE_VIEW_INDEX, payload: 0});
        //         dispatch({type: actions.UPDATE_SELECTED_BAR, payload: 'action'});
        //         dispatch({type: actions.UPDATE_VIEW_TARGET, payload: {type: 'action', id: state.currentActionBar[0].toLowerCase()}})
        //     }
        // }

        // switch (e.key) {
        //     // Did a HAX below for now, but going forward, let's sort out ways to parse state.whatDo/game mode/gamestate
        //     case '1': {
        //         return dispatch({type: actions.PACKAGE_FOR_SERVER, payload: {action: 'interact_with_structure', index: 0}});
        //     }
        //     // case 'ArrowUp': {
        //     //     let newIndex;
        //     //     if (state.actionIndex === 0) newIndex = state.currentActionBar.length - 1
        //     //     else newIndex = state.actionIndex - 1;
        //     //     dispatch({type: actions.UPDATE_ACTION_INDEX, payload: newIndex});
        //     //     break;
        //     // }
        //     // case 'ArrowDown': {
        //     //     let newIndex;
        //     //     if (state.actionIndex === state.currentActionBar.length - 1) newIndex = 0
        //     //     else newIndex = state.actionIndex + 1;
        //     //     dispatch({type: actions.UPDATE_ACTION_INDEX, payload: newIndex});
        //     //     break;
        //     // }
        //     case 'b': {
        //         if (keysDown.current['Meta']) dispatch({type: actions.TOGGLE_BACKPACK});
        //         break;
        //     }
        //     case 'w':
        //     case 'e':
        //     case 'd':
        //     case 'c':
        //     case 'x':
        //     case 'z':
        //     case 'a':
        //     case 'q':                
        //         {
        //             // Sometimes doesn't trigger, but that's always been the case. Hm. Mostly when I save here and it reloads over there. But not always!
        //             // Might just be failure to add event listener at some step? 
        //             if (state.whatDo === 'explore') {
        //                 const mover = {who: state.entityID, where: e.key};
        //                 socketToMe.emit('movedir', mover); 
        //             }
        //             break;
        //             // Right now ANY connected entity is using this code to manipulate the single 'character' dummy in API...
        //             // I can think of a few ways to implement separate characters, but offhand:
        //             // Use normal axios/auth stuff to log in/select character, which can then prepare global variables to ship with these requests
        //             // Package in any crypto-signed goodies to measure validity of commands/origin of commands? 
        //             // Well, get a basic implementation down, then expand to minFR status
        //             // const mover = {who: state.name, where: e.key};
                    
        //         }
        //     case 'h': {
        //         return dispatch({type: actions.PACKAGE_FOR_SERVER, payload: {action: 'hide'}});
        //     }
        //     case 'f': {
        //         return dispatch({type: actions.PACKAGE_FOR_SERVER, payload: {action: 'forage'}});
        //     }
        //     case 's': {
        //         return dispatch({type: actions.PACKAGE_FOR_SERVER, payload: {action: 'search'}});                
        //     }
        //     case 'm': {
        //         return (state.whatDo === 'explore' ? dispatch({type: actions.UPDATE_WHATDO, payload: 'magic'}) : dispatch({type: actions.UPDATE_WHATDO, payload: 'explore'}))
        //     }
        // }
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
                // console.log(data.feedback);
                dispatch({type: actions.UPDATE_ROOM, payload: { updatedLocation: data.newLocation }});
                dispatch({type: actions.RESET_VIEW});
                // HERE: unpack data, adjust state via dispatch - room details, weather, time of day, etc.
            });
            socketToMe.on('room_event', roomEventObj => {
                if (roomEventObj.type === 'entities_update') {
                    const newLocationData = {room: roomEventObj.roomData, RPS: roomEventObj.roomData.RPS, GPS: roomEventObj.roomData.GPS};
                    // Currently can return here, as this type is only meant to be a 'behind the scenes' data update
                    console.log(`New room data! HOORAY! Let's look at the mobs in particular: ${JSON.stringify(newLocationData.room.mobs)}`);
                    // AHA! So it seems that the DED is firing, and THEN the strike is firing, giving us 'ghost' mobs. Lovely.
                    if (roomEventObj.note !== undefined) {
                        console.log(`Additional note from backend: ${roomEventObj.note}`);
                    }
                    return dispatch({type: actions.UPDATE_ROOM, payload: { updatedLocation: newLocationData }});             
                }
                // console.log(stringy);
                // Alright, what do we need to receive?
                // 1) what the room currently looks like (location data) -- use the moved_dir data above as a framework for that
                // 2) updated character data
                // 3) the raw stringly bit(s) to let the client know what's happening -- we can parse it here into a message to pass below
                dispatch({type: actions.PACKAGE_FROM_SERVER, payload: roomEventObj});
                
            });
            socketToMe.on('character_data', eventObj => {
                // Currently testing this as a 'data sent to specific player' situation; may entirely replace 'own_action_result' below
                
                if (eventObj.type === 'fighting_update') {
                    // Playing with parsing directly in this section where applicable, skipping putting the data in state for other areas to listen to
                    // HERE: add dispatch to udpate room data
                    const newLocationData = {room: eventObj.roomData, RPS: eventObj.roomData.RPS, GPS: eventObj.roomData.GPS};
                    dispatch({type: actions.UPDATE_ROOM, payload: { updatedLocation: newLocationData }});
                    return dispatch({type: actions.UPDATE_FIGHTING, payload: eventObj.newFightingObj});
                }

                if (eventObj.type === 'skill_up') {
                    dispatch({type: actions.UPDATE_SKILL_RANKS, payload: eventObj.skill});
                }

                if (eventObj.type === 'spells_update') {
                    dispatch({type: actions.UPDATE_SPELLS, payload: eventObj.spellsList});
                }

                if (eventObj.type === 'stat_update') {
                    dispatch({type: actions.UPDATE_STATS, payload: eventObj.data});
                    if (!eventObj.echo) return;
                }

                if (eventObj.type === 'hide_result') {
                    dispatch({type: actions.UPDATE_HIDING, payload: eventObj.hidden});
                    dispatch({type: actions.UPDATE_EQL, payload: eventObj.eql});
                }

                if (eventObj.type === 'equipment_change') {
                    // HERE: dispatch change to stat/backpack/equipped
                    dispatch({type: actions.EQUIPMENT_CHANGE, payload: eventObj});
                }
                dispatch({type: actions.PACKAGE_FROM_SERVER, payload: eventObj});
            });
            socketToMe.on('combat_event', combatEventObj => {
                dispatch({type: actions.PACKAGE_FROM_SERVER, payload: combatEventObj});
            });
            socketToMe.on('own_action_result', resultObj => {
                // HERE: set up to parse the resultObj into a coherent result string and any changes to state that need to be known to the user
                // The main difference between room_event and own_action_result is the former *might* not have access to every effected player on the backend, currently.
                
                // let processedObj;
                dispatch({type: actions.PACKAGE_FROM_SERVER, payload: resultObj});
                
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

function setActionBar(itemType) {
    // Now's as good a time as any! In Inventory, ITEM TYPES to parse for ACTION_BAR:

    // Any other types?
    switch (itemType) {
        case 'weapon':
        case 'headgear':
        case 'bodygear':
        case 'accessory':
        case 'trinket': 
        case 'tool':
        case 'shield':
            return ['(E)quip', '(U)se', '(D)rop'];
        case 'potion':
        case 'scroll':
            return ['(U)se', '(D)rop'];
        default: return;
    }
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