import React, { useContext } from 'react';
import { Context } from '../context/context';
import { Container } from './styled';

const Cutscene = () => {
    const [state, dispatch] = useContext(Context);
    
    return (
        <Container></Container>
    )
}

export default Cutscene;