import React, { useState, useEffect, useContext, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { actions, Context } from '../context/context';
import { LeftMenu, ActionButton, RoomName, RoomDetails, RoomImg, RoomDesc, EyeView, RightMenu, TopMenu, StructureContainer, MainScreen, RoomView, CharCard, MainViewContainer, ChatWrapper, ChatInput, ChatSubmit, CharProfileImg, CharProfileName, MyCompassView, CompassArrow, ZoneTitle, MyMapGuy, CurrentFocus, EyeSpyLine } from './styled';

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
                <ActionButton key={index} selected={index === state.actionIndex ? true : false} onClick={() => handleActionSelection(actButton)}>{actButton}</ActionButton>
            ))}
        </LeftMenu>
    );
}

const RightMenuBox = ({ state, dispatch }) => {
    // Entities! -- NPCs, mobs, players
    return (
        <RightMenu>
        </RightMenu>
    );
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
        dispatch({type: actions.UPDATE_WHATDO, payload: 'travel'});
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

    return (
        <CurrentFocus style={{display: mode.focused ? 'block' : 'none'}}>
            <button onClick={doneFocusing}>Done Focusing</button>
            {/* In here: several different FOCUS styles depending on said focus */}
        </CurrentFocus>
    )
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
        // console.log(`State received has changed! It is THIS: ${state.received}.`);
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

    // Rejiggering the view below. Hm. Ok, makes the most sense to wrap the EyeSpy stuff in a separate container, so the RoomView can live there too.

    return (
        <>
            
            <MainViewContainer>
                <RoomView>
                    <RoomName>{state.location?.room?.zone} - {state.location?.room?.room}</RoomName>
                    <RoomDetails>
                        <RoomImg />
                        <RoomDesc>
                            {state.location?.room?.description}
                        </RoomDesc>
                    </RoomDetails>
                </RoomView>
                <EyeView id='mainview'>
                    {iSpy.map((line, index) => (
                        <EyeSpyLine key={index}>{line}</EyeSpyLine>
                    ))
                    }
                </EyeView>
            </MainViewContainer>
            <ChatWrapper onSubmit={handleSubmittedChatText}>
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
            <ZoneTitle>{state.location?.room?.zone || 'An Endless Void'}</ZoneTitle>
            <ZoneTitle room>{state.location?.room?.room || `Floating Aimlessly`}</ZoneTitle>
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