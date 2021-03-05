import React, { useContext } from 'react';
import { Context } from '../context/context';
import { PageContainer, Title } from '../components/styled';

const Landing = () => {
    const [state, dispatch] = useContext(Context);

    return (
        <PageContainer>
            <Title>I am HOME.</Title>
        </PageContainer>
    )
}

export default Landing;