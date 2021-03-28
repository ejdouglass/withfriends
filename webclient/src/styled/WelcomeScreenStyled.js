import styled, { keyframes, css } from 'styled-components';

export const LoadingPage = styled.div`
    display: flex;
    position: fixed;
    z-index: 6000;
    top: 0;
    left: 0;
    justify-content: center;
    align-items: center;
    background-color: white;
    width: 100vw;
    height: 100vh;
`;

export const LoadingText = styled.h1`
    font-size: 4rem;
    font-weight: 900;
`;

export const WelcomePage = styled.div`
    background-color: white;
    display: flex;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 6000;
    width: 100vw;
    height: 100vh;
    flex-direction: column;
    align-items: center;
`;

export const WithFriendsLogo = styled.div`
    margin-top: 3rem;
    width: 20vmin;
    height: 20vmin;
    background-color: green;
`;

export const WelcomeCard = styled.div`
    width: 50vw;
    height: 400px;
    margin-top: 2rem;
`;

export const WelcomeText = styled.h1`
    font-size: 1.8rem;
    text-align: center;
    font-weight: 700;

`;

export const ChoiceContainer = styled.div`
    display: flex;
    flex-direction: row;
    width: 100%;
    justify-content: space-around;
    margin-top: 1.5rem;
`;

export const ChoiceButton = styled.button`
    width: 40%;
    height: 60px;
    font-size: 1.3rem;
    font-weight: 600;
    background: linear-gradient(#0AF, blue);
    color: white;
`;