import React, { useContext } from 'react';
import { Context } from '../context/context';
import { Container, Title } from './styled';

const Backpack = () => {
    const [state, dispatch] = useContext(Context);
    
    return (
    <>
        {state.backpack.open ? (
            <Container>
                <Title>BACKPACK HERE!</Title>
            </Container>
        ) : (
            <></>
        )}
    </>
    )
}

export default Backpack;