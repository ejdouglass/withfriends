import React, { useState, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { Context, actions } from '../context/context';
import axios from 'axios';
import { LoginPage, CredentialsForm, CredentialsInput, SubmitCredentialsButton } from '../styled/LoginScreenStyled';
import { WelcomeCard, WelcomeText, WithFriendsLogo } from '../styled/WelcomeScreenStyled';

const LoginScreen = () => {
    const [state, dispatch] = useContext(Context);
    const [loginCredentials, setLoginCredentials] = useState({
        charName: '',
        password: ''
    });
    const history = useHistory();

    function parseNameInput(name) {
        if (name.length > 0) name = name[0].toUpperCase() + name.slice(1);
        name = name.split(' ').join('');
        setLoginCredentials({...loginCredentials, charName: name});
    }

    function login(e) {
        e.preventDefault();
        if (loginCredentials.charName.length > 5 && loginCredentials.charName.length < 12 && loginCredentials.password.length > 4) {
            axios.post('/character/login', { userCredentials: loginCredentials })
                .then(res => {
                    localStorage.setItem('withFriendsJWT', res.data.payload.token);
                    dispatch({type: actions.LOAD_CHAR, payload: { character: res.data.payload.character}});
                    history.push('/play');
                })
                .catch(err => {
                    console.log(`Error logging in: ${err}`);
                    // HERE: dispatch for user alert/feedback
                })
        }
    }

    return (
        <LoginPage>
            <WithFriendsLogo></WithFriendsLogo>
            <WelcomeCard>
                <WelcomeText>Please enter your character's login info!</WelcomeText>
                <CredentialsForm onSubmit={e => login(e)}>
                    <CredentialsInput type='text' placeholder={`character name`} autoFocus={true} value={loginCredentials.charName} onChange={e => parseNameInput(e.target.value)}></CredentialsInput>
                    <CredentialsInput type='text' placeholder={`password`} value={loginCredentials.password} onChange={e => setLoginCredentials({...loginCredentials, password: e.target.value})}></CredentialsInput>
                    <SubmitCredentialsButton>Log In!</SubmitCredentialsButton>
                </CredentialsForm>
            </WelcomeCard>
        </LoginPage>
    )
}

export default LoginScreen;