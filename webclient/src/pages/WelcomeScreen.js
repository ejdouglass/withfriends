import React, { useState, useEffect, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { Context, actions } from '../context/context';
import axios from 'axios';
import { LoadingPage, LoadingText, WelcomePage, WelcomeCard, WelcomeText, WithFriendsLogo, ChoiceContainer, ChoiceButton } from '../styled/WelcomeScreenStyled';

const WelcomeScreen = () => {
    const [state, dispatch] = useContext(Context);
    const [JWTchecked, setJWTchecked] = useState(false);
    const history = useHistory();

    function loadCharFromToken(charToken) {
        // THIS: axios passes the charToken to the API in an attempt to load up the character in question
        axios.post('/character/login', { charToken: charToken })
            .then(res => {
                console.log(res.data);
                dispatch({type: actions.LOAD_CHAR, payload: {character: res.data.payload.character}});
                localStorage.setItem('withFriendsJWT', res.data.payload.token);
                history.push('/play');

                // HERE: dispatch alert if sucessfully failed :P
            })
            .catch(err => {
                console.log(err);
                localStorage.removeItem('withFriendsJWT');
                // HERE: dispatch alert for user feedback
            });
    }

    useEffect(() => {
        const charToken = localStorage.getItem('withFriendsJWT');
        setJWTchecked(true);
        if (charToken) {
            console.log(`Attempting to load character from found stored JWT.`);
            loadCharFromToken(charToken);
        }
    }, [])

    return (
        <>
        {JWTchecked ? (
            <WelcomePage>
                <WithFriendsLogo />
                <WelcomeCard>
                    <WelcomeText>Welcome to With Friends!</WelcomeText>
                    <WelcomeText>Please Log In or Create a New Character to play.</WelcomeText>
                    <ChoiceContainer>
                        <ChoiceButton onClick={() => history.push('/login')}>Log In</ChoiceButton>
                        <ChoiceButton onClick={() => history.push('/create_character')}>Create New</ChoiceButton>
                    </ChoiceContainer>
                </WelcomeCard>
            </WelcomePage>
        ) : (
            <LoadingPage>
                <LoadingText>Loading...</LoadingText>
            </LoadingPage>
        )}
        </>
    )
}

export default WelcomeScreen;

/*

    This page's only purpose is to say "Loading..." while checking for JWT in localStorage.
    -- if no JWT found, offer to CREATE or LOG IN!

*/