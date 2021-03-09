import React, { useState, useContext } from 'react';
import { Context } from '../context/context';
import { SkyBox } from './styled';
import basicSky from '../assets/skyboxes/bluesky.jpg';

const Sky = () => {
    const [state] = useContext(Context);
    const [skyImageSrc, setSkyImageSrc] = useState(); // Alternatively, the CONTEXT page might be able to handle the 'basicSky' import above? Hm.

    return (
        <SkyBox color={state.above.color} bg={basicSky}>
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