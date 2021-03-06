import React, { useContext } from 'react';
import { Context } from '../context/context';
import { PageContainer, Title } from '../components/styled';

const GameScreen = () => {
    const [state, dispatch] = useContext(Context);

    return (
        <PageContainer>
            <Title>I am GAME SCREEN (turnt on).</Title>
        </PageContainer>
    )
}

export default GameScreen;