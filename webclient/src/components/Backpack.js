import React, { useContext } from 'react';
import { Context } from '../context/context';
import { Container } from './styled';

const Backpack = () => {
    const [state, dispatch] = useContext(Context);
    
    return (
        <Container></Container>
    )
}

export default Backpack;