import styled, { keyframes, css } from 'styled-components';

const color = {
    pale: '',
    light: '',
    base: 'gray',
    dark: '',
    blackish: '',
    bold: '',
};

const animateBackpackOpening = keyframes`
    from {
        transform: translate(10px, -10px);
        opacity: 0;
    }
    to {
        transform: translate(0, 0);
        opacity: 1;
    }
`;

const floatingClouds = keyframes`
    0% {
        background-position: 50% 25%;
    }
    25% {
        background-position: 75% 50%;
    }
    50% {
        background-position: 50% 75%;
    }
    75% {
        background-position: 25% 50%;
    }
    100% {
        background-position: 50% 25%;
    }
`;

const swayingGrass = keyframes`
    0% {
        transform: none;
        background-position: 50% 99%;
    }
    50% {
        transform: skew(10deg, 0deg);
        background-position: 51% 99%;
        
    }
    100 %{
        transform: none;
        background-position: 50% 99%;
    }
`;

const flicker = keyframes`
    0% {
        background-color: hsl(220, 85%, 50%);
    }
    50% {
        background-color: hsl(200, 75%, 80%);
    }
    100% {
        background-color: hsl(220, 85%, 50%);
    }
`;

export const Container = styled.div`
    display: flex;
    padding: 1rem;
    ${props => props.row && css`
        flex-direction: row;
    `}
    ${props => props.column && css`
        flex-direction: column;
    `}
    ${props => props.centered && css`
        justify-content: center;
    `}
    ${props => props.aligncentered && css`
        align-items: center;
    `}
    ${props => props.screenwidth && css`
        width: 100vw;
    `}
    ${props => props.fullwidth && css`
        width: 100%;
    `}
    ${props => props.halfwidth && css`
        width: 50%;
    `}
    ${props => props.quarterwidth && css`
        width: 25%;
    `}
    ${props => props.screenheight && css`
        height: 100vh;
    `}
    ${props => props.fullheight && css`
        height: 100%;
    `}
    ${props => props.halfheight && css`
        height: 50%;
    `}
    ${props => props.quarterheight && css`
        height: 25%;
    `}
`;

export const Button = styled.button``;

export const Input = styled.input``;

export const Title = styled.h1``;

export const Text = styled.p`
    overflow: hidden;
    text-overflow: ellipsis;
`;




export const PageContainer = styled(Container)`
    width: 100vw;
    height: calc(100vh - 100px);
    flex-direction: column;
    align-items: center;
    padding: 1rem;
`;

export const Card = styled(Container)``;

export const SkyBox = styled.div`
    display: flex;
    position: fixed;
    top: 0;
    left: 0;
    margin: 0;
    z-index: 0;
    width: 100vw;
    height: 70vh;
    background-color: ${props => props.color};
    &:before {
        content: "";
        background-image: url(${props => props.bg});
        background-size: contain no-repeat;
        background-position: middle;
        animation: ${floatingClouds} 300s linear 0s infinite;
        width: 100%;
        height: 100%;
        opacity: 0.4;
    }
`;

export const AroundBox = styled.div`
    display: flex;
`;

export const GroundBox = styled.div`
    display: flex;
    position: fixed;
    bottom: 0;
    left: -5%;
    margin: 0;
    z-index: 0;
    width: 110vw;
    height: 30vh;
    background-color: ${props => props.color};
    background-image: linear-gradient(hsla(130, 85%, 15%, 0.8), hsla(110, 45%, 65%, 0.5));
    &:before {
        content: "";
        background-image: url(${props => props.bg});
        background-size: contain no-repeat;
        background-position: 50% 99%;
        animation: ${swayingGrass} 10s linear 0s infinite;
        width: 100%;
        height: 100%;
        opacity: 0.5;
    }
`;

export const BackpackContainer = styled.div`
    display: flex;
    position: fixed;
    z-index: 20;
    top: 150px;
    padding: 15px;
    box-sizing: border-box;
    left: 10%;
    width: 80vw;
    height: calc(100vh - 300px);
    background-color: tan;
    border: 3px solid brown;
    animation: ${animateBackpackOpening} 0.1s linear;
`;

export const MainScreen = styled.div`
    display: flex;
    background-color: white;
    opacity: 1;
    z-index: 1;
    position: fixed;
    width: 86vw;
    height: 86vh;
    box-sizing: border-box;
    border: 1px solid gray;
    top: 8%;
    left: 7%;
`;

// Width needs a minimum value; since it needs a certain width to do its job well; see if we can find a good responsive way to get that rejiggered
export const CharCard = styled.div`
    display: flex;
    flex-direction: row;
    position: absolute;
    width: calc(200px + 30vw);
    height: 20vmin;
    top: -5vmin;
    left: -5vmin;
    background-color: hsl(180, 15%, 95%);
    border-radius: 3px;
    border: 1px solid black;
`;

export const CharProfileContainer = styled.div`
    display: flex;
    flex-direction: column;
    width: calc(100px + 15vw);
    border-right: 1px solid red;
`;

export const CharProfileImg = styled.div`
    display: flex;
    width: calc(100px + 15vw);
    height: calc(100px + 15vw);
    background-color: blue;
`;

export const CharProfileName = styled.p`
    font-size: calc(6px + 0.5vw);
    text-align: center;
    width: 100%;
    font-weight: 700;
`;

export const MyMapView = styled.div`
    display: flex;
    position: absolute;
    justify-content: center;
    background-color: hsl(40, 65%, 95%);
    width: calc(100px + 20vmin);
    height: calc(100px + 20vmin);
    border-radius: 40vmin;
    border: 1px solid hsl(30, 75%, 45%);
    right: -7vmin;
    bottom: -5vmin;
`;

export const MyMapGuy = styled.div`
    align-self: center;
    width: 2vmin;
    height: 2vmin;
    border-radius: 100vmin;
    background-color: hsl(220, 85%, 50%);
    animation: ${flicker} 2s linear 0s infinite;
`;

export const CreateCharacterScreen = styled.div`
    z-index: 9999;
    position: fixed;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 1rem;
    width: 100vw;
    height: 100vh;
    top: 0;
    left: 0;
    background-color: white;
    opacity: 0.9;
`;

export const CharacterNameInput = styled.input`
    height: 2rem;
    font-size: 1.2rem;
    width: calc(200px + 5vw);
    padding: 0.5rem;
    font-weight: 600;
    margin: 0.5rem;
`;

export const PWInput = styled(CharacterNameInput)``;

export const CreateCharacterForm = styled.form`
    display: flex;
    flex-direction: column;
`;

export const CreateCharacterButton = styled.button`
    width: calc(200px + 5vw);
    padding: 0.5rem;
    font-size: 1.1rem;
    margin: 0.5rem;
    font-weight: 600;
    border-radius: 6px;
    &:hover {
        transform: translateY(-1px);
    }
`;