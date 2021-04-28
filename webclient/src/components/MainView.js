import React, { useState, useEffect, useContext, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { actions, Context } from '../context/context';
import { LeftMenu, ActionButton, ChatPrompt, RightMenuLabel, EntityList, RoomName, RoomDetails, RoomImg, RoomDesc, EyeView, RightMenu, TopMenu, StructureContainer, MainScreen, RoomView, CharCard, MainViewContainer, ChatWrapper, ChatInput, ChatSubmit, CharProfileImg, CharProfileName, MyCompassView, CompassArrow, ZoneTitle, MyMapGuy, CurrentFocus, EyeSpyLine, NPCInteractionContainer, EntityGlancer } from './styled';

const MainView = () => {
    const [state, dispatch] = useContext(Context);

    return (
        <MainScreen>
            <CurrentFocusBox state={state} dispatch={dispatch} />
            <ViewBox state={state} dispatch={dispatch} />
            <MyChar state={state} dispatch={dispatch} />
            <MyMap state={state} />
            <LeftMenuBox state={state} dispatch={dispatch} />
            <RightMenuBox state={state} dispatch={dispatch} />
        </MainScreen>
    )
}

export default MainView;


const LeftMenuBox = ({ state, dispatch }) => {
    // What action bar items are we missing? Hm...

    function handleActionSelection(actionName) {
        actionName = actionName.toLowerCase();
        
        dispatch({type: actions.UPDATE_WHATDO, payload: `${actionName}`});
    }

    return (
        <LeftMenu>
            {state.currentActionBar.map((actButton, index) => (
                <ActionButton key={index} viewed={(state.currentBarSelected === 'action' && index === state.viewIndex) ? true : false} selected={state.whatDo === actButton.toLowerCase() ? true : false} onClick={() => handleActionSelection(actButton)}>{actButton}</ActionButton>
            ))}
        </LeftMenu>
    );
}

const RightMenuBox = ({ state, dispatch }) => {
    // Entities! -- NPCs, mobs, players
    // Probably in the order PLAYERS, MOBS, NPCS... but only two sections is fine, NPCs and MOBs are pretty interchangeable
    const [entityList, setEntityList] = useState([]);

    // HM. Might have to do a dispatch in here if we exceed the current list of things on the right side;
    //  that is to say, listen for updates to state.viewIndex, adjust here and modify if it falls out of bounds.
    // That sounds a little sloppy, but for now, if it works, brava!

    useEffect(() => {
        // ...state.location?.room?.mobs, ...state.location?.room?.npcs, ...state.location?.room?.players
        let fullList = [];
        if (state.location?.room?.mobs?.length > 0) fullList = [...state.location.room.mobs];
        if (state.location?.room?.npcs?.length > 0) fullList = [...fullList, ...state.location.room.npcs];
        if (state.location?.room?.players?.length > 0) {
            let playerList = state.location.room.players.filter(playa => playa.name !== state.name);
            fullList = [...fullList, ...playerList];
        }
        setEntityList(fullList);
    }, [state]);
    
    useEffect(() => {
        if (state.currentBarSelected === 'entity') {
            if (state.viewIndex >= entityList.length) {
                return dispatch({type: actions.UPDATE_VIEW_INDEX, payload: 0});
            }
            if (state.viewIndex < 0) {
                return dispatch({type: actions.UPDATE_VIEW_INDEX, payload: entityList.length - 1});
            }
            return dispatch({type: actions.UPDATE_VIEW_TARGET, payload: {type: entityList[state.viewIndex]?.type, id: entityList[state.viewIndex]?.id, glance: entityList[state.viewIndex]?.glance, description: entityList[state.viewIndex]?.description}});
            
        }
    }, [state.viewIndex, state.currentBarSelected]);

    return (
        <RightMenu>
            <RightMenuLabel>Also Here:</RightMenuLabel>
            <EntityList>
                {/* SOMETHING about this is deeply borked. Does a gazillion updates. Hold on a sec. */}
                {entityList.length > 0 ? (
                    <>
                        {entityList.map((entity, index) => (
                            <EntityBox key={index} index={index} type={entity.type} entity={entity} />
                        ))}
                    </>
                ) : (
                    <p>Nobody but yourself.</p>
                )}
                {/* {state.location?.room?.players?.length + state.location?.room?.npcs?.length + state.location?.room?.mobs?.length > 1 ? (
                        <>
                        {state.location?.room?.mobs?.map((mob, index) => (
                            <p key={index} entity={mob} type={'mob'}>{mob.glance}</p>
                        ))}
                        {state.location?.room?.npcs?.map(npc => (
                            <EntityBox key={npc.id} type={'npc'} entity={npc} /> 
                        ))}                    
                        {state.location?.room?.players?.map((player, index) => (
                            <p key={index} entity={player} type={'player'}>{player.name === state.name ? null : player.name}</p>
                        ))}
                        </>
                    ) : (
                        <p>Nobody but you.</p>
                    )
                } */}
            </EntityList>
        </RightMenu>
    );
}

const EntityBox = ({ type, entity, index }) => {
    const [state, dispatch] = useContext(Context);

    function targetEntity(tgEntity) {
        if (state.target?.id !== tgEntity.id) return dispatch({type: actions.TARGET_ENTITY, payload: {targetType: 'view', target: {...tgEntity}}});
        return dispatch({type: actions.TARGET_ENTITY, payload: {}});
    }

    // useEffect(() => {
    //     if (index === state.viewIndex && state.viewTarget?.id !== entity.id) {
    //         dispatch({type: actions.TARGET_ENTITY, payload: {targetType: 'view', target: {...entity}}})
    //     }
    // }, [state]);

    switch (type) {
        case 'mob': {
            return (
                <EntityGlancer mob viewed={state.viewTarget?.id === entity.id || (state.currentBarSelected === 'entity' && state.viewIndex === index)}>{entity.glance}</EntityGlancer>
            )
        }
        case 'npc': {
            return (
                <EntityGlancer npc viewed={state.viewTarget?.id === entity.id || (state.currentBarSelected === 'entity' && state.viewIndex === index)} onClick={() => targetEntity(entity)}>{entity.glance}</EntityGlancer>
            )
        }
        case 'player': {
            return (
                <EntityGlancer player viewed={state.viewTarget?.id === entity.id || (state.currentBarSelected === 'entity' && state.viewIndex === index)}>{entity.name === state.name ? null : entity.name}</EntityGlancer>
            )
        }
        default: {
            return <EntityGlancer>a spooky entity</EntityGlancer>
        }
    }
}

const TopMenuBox = ({ state, dispatch }) => {

    // Idly pondering setting up multiple states this can hold. It's valuable real estate!
    // Regardless, I want to set up keybinding here. I want to be able to tap the number button while 'Exploring' to interact with a structure.
    // So, how to set that up...

    function handleStructureInteraction(structIndex) {
        return dispatch({type: actions.PACKAGE_FOR_SERVER, payload: {action: 'interact_with_structure', index: structIndex}});
    //     console.log(`You interact with ${structure.name}! Good for you.`);
    //     // For real, though. What happens when you BOOP a structure? What kind of structures we talkin'?
    //     /*
    //         HERE: parse the structure type. We'll do our now-usual split for '/', index 0 will be the core 'type.

    //         TYPES:
    //         -- portal
    //         -- shop
    //         -- crafting
    //     */
    //    switch (structure.type) {
    //        case 'portal': {
    //            // Gotta figure out how this'll parse on the backend. Well, we have scaffolding for it, so let's find out together!
    //            // actions.PACKAGE_FOR_SERVER
    //            // structures can have IDs eventually, replace name with ID at that point
    //            dispatch({type: actions.PACKAGE_FOR_SERVER, payload: {action: 'enter_portal', target: structure.name}})
    //        }
    //    }
    }
    
    return (
        <TopMenu>
            {state.location.room?.structures?.map((structure, index) => (
                <StructureContainer key={index} onClick={() => handleStructureInteraction(index)}>{index + 1} : {structure.name}</StructureContainer>
            ))}
        </TopMenu>
    );
}


const CurrentFocusBox = ({ state, dispatch }) => {
    const [mode, setMode] = useState({focused: false, type: undefined});

    function doneFocusing() {
        console.log(`Done focusing, probably`);
        dispatch({type: actions.UPDATE_WHATDO, payload: 'explore'});
    }

    useEffect(() => {
        let amIFocused = state.whatDo.split('/');
        if (amIFocused[0] === 'focus') {
            console.log(`Focusing on ${amIFocused[1]} now.`);
            return setMode({focused: true, type: amIFocused[1]});
        }
        return setMode({focused: false, type: undefined});
    }, [state.whatDo]);

    /*
        Some FOCUS modes, which would correspond to whatDo situations (for key responses):
            -- NPC interaction
            -- Shopping
            -- Combat
            -- Fishing
            -- Foraging?
            -- Crafting
            -- Hiding!
            
        Gets a bit wacky narrow at lower widths, but the shrinking text of the main view shows we can probably accomodate that ok.

        More screen refitting:
        -- right side: buildings/shops/etc, npcs, mobs
        -- below chat: 'also here', or maybe bottom right?
        -- left side: actions (cast, use, do, search, forage/fish, etc.)

        Idea: leftFocus and rightFocus, so if you're CASTING, that's maybe a right-side thing, and COMBAT lives on the left, so they 'mix' well?
    */
   switch (state.whatDo) {
        case 'explore': {
           return null;
        }
        case 'npcinteract': {
            return (
                <NPCInteractionContainer>
                    Ohai! I'm not interactive yet, but I'm really trying my hardest!
                </NPCInteractionContainer>
            )
        }
        case 'magic': {
            // NOTE: currently this is the same 'small menu' as combat and such; will change later to be full-screen wackiness
            return (
                <NPCInteractionContainer>
                    BEEP BOOP
                </NPCInteractionContainer>
            )
        }
        default: {
            return null;
        }
   }
}



const ViewBox = ({ state, dispatch }) => {
    const [talkText, setTalkText] = useState('');
    const [iSpy, setISpy] = useState(['So a new day of adventure begins.', 'Proceed boldly!']);
    const chatRef = useRef(null);
    // let mainViewElement;

    function handleSubmittedChatText(e) {
        e.preventDefault();
        if (talkText === '') {
            return;
        }
        dispatch({type: actions.PACKAGE_FOR_SERVER, payload: {action: 'talk', message: talkText}});
        setTalkText('');
    }

    useEffect(() => {
        if (state.whatDo === 'talk') {
            chatRef.current.focus();
        } else {
            setTalkText('');
        }
    }, [state.whatDo]);

    useEffect(() => {
        // THIS: when a new string is processed through PACKAGE_FROM_SERVER, it ends up here for display. Makes sense!
        if (state.received) {
            let newSights = [...iSpy];
            newSights.push(state.received);
            setISpy(newSights);
            dispatch({type: actions.PACKAGE_FROM_SERVER, payload: undefined});
            // HERE, probably: clear out state.received to avoid redundancies/repeats
        }
    }, [state.received]);

    useEffect(() => {
        // mainViewElement = document.getElementById('mainview');
    }, []);

    useEffect(() => {
        let mainViewElement = document.getElementById('mainview');
        mainViewElement.scrollTop = mainViewElement.scrollHeight;
    }, [iSpy]);


    return (
        <>
            
            <MainViewContainer>
                <RoomView>
                    
                    {state.currentBarSelected === 'entity' &&
                    <>
                    <RoomName>{state.viewTarget?.glance || state.viewTarget?.name}</RoomName>
                    <RoomDetails>
                        <RoomImg />
                        <RoomDesc>
                            {state.viewTarget?.description}
                        </RoomDesc>
                    </RoomDetails>
                    </>
                    }
                    {state.currentBarSelected === 'action' &&
                    <>
                    <RoomName>{state.location?.room?.zone} - {state.location?.room?.room}</RoomName>
                    <RoomDetails>
                        <RoomImg />
                        <RoomDesc>
                            {state.location?.room?.description}
                        </RoomDesc>
                    </RoomDetails>
                    </>
                    }

                </RoomView>
                <EyeView id='mainview'>
                    {iSpy.map((line, index) => (
                        <EyeSpyLine key={index}>{line}</EyeSpyLine>
                    ))
                    }
                </EyeView>
            </MainViewContainer>
            <ChatPrompt chatting={state.whatDo === 'talk'}>(TAB to talk)</ChatPrompt>
            <ChatWrapper chatting={state.whatDo === 'talk'} onSubmit={handleSubmittedChatText}>
                <ChatInput type='text' ref={chatRef} readOnly={state.whatDo === 'talk' ? false : true} value={talkText} onChange={e => setTalkText(e.target.value)} autoComplete={'off'} autoCorrect={'off'}></ChatInput>
                <ChatSubmit>!</ChatSubmit>
            </ChatWrapper>
        </>
    )
}



const MyChar = ({ state, dispatch }) => {
    // Hm, a little bulky. Think about what else is going in here, maybe shrink it down to mostly fixed with a little bit of vw.
    // Also, name shrinks far too much when screen size changes. Pump it up!

    const history = useHistory();

    function logout() {
        localStorage.removeItem('withFriendsJWT');
        dispatch({type: actions.LOGOUT_CHAR});
        history.push('/');
    }

    return (
        <CharCard>
            <TopMenuBox state={state} dispatch={dispatch} />
            <CharProfileImg />
            <CharProfileName>{state.name}</CharProfileName>
            <button style={{marginLeft: '2rem', height: '40%'}} onClick={logout}>Log Out</button>
            <MyCompassView>
                <MyMapGuy />
                <CompassArrow east navigable={state.location?.room?.exits?.e}/>
                <CompassArrow southeast navigable={state.location?.room?.exits?.se}/>
                <CompassArrow south navigable={state.location?.room?.exits?.s}/>
                <CompassArrow southwest navigable={state.location?.room?.exits?.sw}/>
                <CompassArrow west navigable={state.location?.room?.exits?.w}/>
                <CompassArrow northwest navigable={state.location?.room?.exits?.nw}/>
                <CompassArrow north navigable={state.location?.room?.exits?.n}/>
                <CompassArrow northeast navigable={state.location?.room?.exits?.ne}/>
            </MyCompassView>
        </CharCard>
    )
}



const MyMap = ({ state }) => {
    // Ok, let's rethink. MyMapView should probably be a square again, just a little compass whose arrows light up when dir is available.
    // UP and DOWN can be on the side as sweeping arrows.
    // This MYMAP component can render just a NavCompass in MUD rooms, and expand to be a big screen view if/when Open World opens up.
    // We'll rejigger state variables to check that later, since we DO have it defined in AREAS on backend, each area has a 'type' such as 'mud'
    
    return (
        <></>
    )
}

/*

Refactored! Whoa! This is now the big 'main box' and its assorted bits and bobs.

Wed 3/10:
-- Doot da doo

Copying notes in here from App:

When traveling, the main part of the screen should be a visual representation of where you can go (we'll stick with top-down nav).
-- 'Map' between areas/world-wide can be spinny 'walk forward' "tank control" style
-- 'Areas' will be DR-like, with eight directions, up/down, out, etc. -- riiiight? Probably still the 'easiest' way to do it, so let's stick with that.
-- 'Forage' and 'context' menu on the bottom? Side? Side bottom? :P
-- COMMAND BAR: clickable/keyboardable buttons that let you know what you can do
-- 'Status' and 'condition' and 'hands' on the top
-- 'Chat' mode/interaction mode/'looking' mode? How to square with big ol' center NavView? HMMM.

-- We have a big ol' CENTER BOX. What to do with you? 
: Character Box ('face', condition, state such as stealth) in upper-left feels like a good start
: Command Bar across top related to character - Stuff, Stats, etc.
: Contextual Command Bar (forage, fish, etc.) across bottom?
: Surroundings-related (people, critters, mobs of various descriptions) - ???
: Picked-up/dropped items scooted to upper left near charbox, mayhaps?

Oof. I'm 'stuck' on this part. Let's see. CENTER BOX. Let's get you going, my friend...
-- What's the essential problem? What to 'see' and 'how' to see it. 

*/