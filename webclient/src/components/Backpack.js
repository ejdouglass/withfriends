import React, { useContext } from 'react';
import { Context } from '../context/context';
import { BackpackContainer, Text } from './styled';

const Backpack = () => {
    const [state, dispatch] = useContext(Context);
    
    return (
    <>
        {state.backpack.open ? (
            <BackpackContainer>
                <Text>Your backpack is, sadly, rather empty at the moment. Go get some STUFF!</Text>
            </BackpackContainer>
        ) : (
            <></>
        )}
    </>
    )
}

export default Backpack;