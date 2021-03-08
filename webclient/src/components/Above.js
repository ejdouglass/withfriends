import React, { useContext } from 'react';
import { Context } from '../context/context';
import { SkyBox } from './styled';

const Sky = () => {
    const [state] = useContext(Context);

    return (
        <SkyBox color={state.above.color}>
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