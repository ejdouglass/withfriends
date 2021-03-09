import React, { useContext } from 'react';
import { Context } from '../context/context';
import { GroundBox } from './styled';
import basicGrass from '../assets/groundboxes/basicGrass.jpg';

const Below = () => {
    const [state] = useContext(Context);

    return (
        <GroundBox color={state.below.color} bg={basicGrass}>
        </GroundBox>
    )
}

export default Below;