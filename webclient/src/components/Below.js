import React, { useContext } from 'react';
import { Context } from '../context/context';
import { GroundBox } from './styled';

const Below = () => {
    const [state] = useContext(Context);

    return (
        <GroundBox color={state.below.color}>
        </GroundBox>
    )
}

export default Below;