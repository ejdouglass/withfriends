import React, { useState, useContext } from 'react';
import { Context } from '../context/context';
import { SkyBox } from './styled';
import basicSky from '../assets/skyboxes/bluesky.jpg';

const Sky = () => {
    // const [state] = useContext(Context);
    // const [skyImageSrc, setSkyImageSrc] = useState();
    // Dunno if we actually need to havee the skyImageSrc state object? Having all the skies in this file makes sense,
    //  but beyond that, just interpreting the global data to modify the color and bg when state changes seems most sound.


    return (
        <SkyBox color={'hsl(220,20%,30%)'}>
        </SkyBox>
    )
}

export default Sky;

/*

Now to figure out how to add clouds and stuff to the SkyBox. :P
... as well as modify the color for time of day, weather, etc.
... add the sun/moon(s) up there, too!

Oh. We can do gradients, too. Obviously. With sunrise, sunset. Fancy, wowee.

*/