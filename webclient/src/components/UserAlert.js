import React, { useContext } from 'react';
import { Context } from '../context/context';

const UserAlert = () => {
    const [state] = useContext(Context);

    return (
        <div>
            <h1>I am Alert Message!</h1>
        </div>
    )
}

export default UserAlert;