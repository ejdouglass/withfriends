import React, { useContext, useEffect } from 'react';
import { Context } from '../context/context';

// This is also a pretty good chance to set up how the 'world' will live on the backend, as well.
// This will obviously be almost painfully basic for now, but will help guide future building endeavors
let world = {

};

const GameScreen = () => {
    // 'an eye on things' -- eureka! 
    const [state, dispatch] = useContext(Context);

    useEffect(() => {
        // game loop TURN ON ... uh, let's look up how to do that properly :P
    }, []);

    return (
        <>
        </>
    )
}

export default GameScreen;

/*

    OK! I have conjectured a purpose for this screen. It can hold the GAME LOOP. Ta-da!
    -- The 'game loop' such as it is now is mostly just a world-ping to see if anything has changed, quick compare 'n contrast if state needs updating
    -- It can also do basic AI-y things, such as spawn, despawn, world self-checking protocols, etc.

    ... and for basic front-end testing purposes for now, I can probably also tuck the 'truth' in here -- the 'world.' 

    ... actually, now that we've got a SOCKET online, the game loop will live on the backend. Soooooo. Back to the drawing board...


*/