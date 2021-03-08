import React, { useContext } from 'react';
import { Context } from '../context/context';
import { PageContainer, Title } from '../components/styled';

const GameScreen = () => {
    const [state, dispatch] = useContext(Context);

    return (
        <PageContainer>
            <Title>I am GAME SCREEN (turnt on).</Title>
        </PageContainer>
    )
}

export default GameScreen;

/*

    This is an interesting 'screen' because it's not actually a screen, now that I think it through... just a place for the router to put you. :P

    I could do this in two ways as of thinking it through right now:
    1) A butt-ton of conditional rendering through this 'page'
    ... or... 
    2) Little or no rendering on this page, and just a lot of top-level components in APP that are precisely positioned and know to appear or not based on
        global state.

    ... yeah, number two seems like a clear winner here. Ok! So, yeah, this page is 'doomed' to kind of just hang out for now, unless
        I invent another purpose for it. :P Interesting, not what I initially expected for it.

*/