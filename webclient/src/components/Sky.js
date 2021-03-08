import React, { useContext } from 'react';
import { Context } from '../context/context';
import { Container, Title } from './styled';

const Sky = () => {
    const [state] = useContext(Context);

    return (
        <Container>
            <Title>Sky is {state.sky.color}.</Title>
        </Container>
    )
}

export default Sky;