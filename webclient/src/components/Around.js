import React, { useContext } from 'react';
import { Context } from '../context/context';
import { AroundBox } from './styled';

const Around = () => {
    const [state] = useContext(Context);

    return (
        <AroundBox>

        </AroundBox>
    )
}

export default Around;