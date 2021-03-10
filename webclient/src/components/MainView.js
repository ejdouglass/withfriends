import React, { useContext } from 'react';
import { Context } from '../context/context';
import { MainScreen, MyMapView } from './styled';

const MainView = () => {
    const [state] = useContext(Context);

    return (
        <MainScreen>
            <MyMap />
        </MainScreen>
    )
}

export default MainView;

const MyMap = () => {
    return (
        <MyMapView></MyMapView>
    )
}

/*

Refactored! Whoa! This is now the big 'main box' and its assorted bits and bobs.

Wed 3/10:
-- Thinking the 'DR nav directions' is primarily a secondary but prominent part in the corner?

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
: Picked-up rise on upper right, dropped fall on lower right (possibly outside of box altogether)

Oof. I'm 'stuck' on this part. Let's see. CENTER BOX. Let's get you going, my friend...
-- What's the essential problem? What to 'see' and 'how' to see it. 

*/