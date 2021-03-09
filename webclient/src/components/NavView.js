import React, { useContext } from 'react';
import { Context } from '../context/context';
import { NavBox } from './styled';

const NavView = () => {
    const [state] = useContext(Context);

    return (
        <NavBox>

        </NavBox>
    )
}

export default NavView;

/*

Not sure if we want to have an opaque or very slightly transparent 'nav' layer. Either way:
FEATURES
-- A 'view margin' based on how light/dark/visible things are here

*/