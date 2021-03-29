import React, { useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { actions, Context } from '../context/context';
import { MainScreen, CharCard, CharProfileImg, CharProfileName, MyCompassView, CompassArrow, ZoneTitle, RoomTitle, MyMapGuy } from './styled';

const MainView = () => {
    const [state, dispatch] = useContext(Context);

    return (
        <MainScreen>
            <MyChar state={state} dispatch={dispatch} />
            <MyMap state={state} />
        </MainScreen>
    )
}

export default MainView;



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
            <CharProfileImg />
            <CharProfileName>{state.name}</CharProfileName>
            <button style={{marginLeft: '2rem', height: '40%'}} onClick={logout}>Log Out</button>
        </CharCard>
    )
}



const MyMap = ({ state }) => {
    // Ok, let's rethink. MyMapView should probably be a square again, just a little compass whose arrows light up when dir is available.
    // UP and DOWN can be on the side as sweeping arrows.
    // This MYMAP component can render just a NavCompass in MUD rooms, and expand to be a big screen view if/when Open World opens up.
    // We'll rejigger state variables to check that later, since we DO have it defined in AREAS on backend, each area has a 'type' such as 'mud'
    
    return (
        <MyCompassView>
            <ZoneTitle>{state.location?.room?.zone || 'An Endless Void'}</ZoneTitle>
            <RoomTitle>{state.location?.room?.room || 'Floating Aimlessly'}</RoomTitle>
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