import React, { useContext } from 'react';
import { Context } from '../context/context';
import { BackpackContainer, Title } from './styled';

const Backpack = () => {
    const [state, dispatch] = useContext(Context);
    
    return (
    <>
        {state.backpack.open ? (
            <BackpackContainer>
                <Title>BACKPACK HERE!</Title>
            </BackpackContainer>
        ) : (
            <></>
        )}
    </>
    )
}

export default Backpack;