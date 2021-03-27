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
    width: 20vmin;
    height: 20vmin;
    background-color: blue;
`;

export const CharProfileName = styled.p`
    font-size: calc(0.7rem + 0.5vw);
    text-align: center;
    padding-left: 1rem;
    font-weight: 700;
`;

export const MyCompassView = styled.div`
    display: flex;
    position: absolute;
    justify-content: center;
    background-color: hsl(40, 65%, 95%);
    width: calc(150px + 5vw);
    height: calc(150px + 5vw);
    border-radius: 6px;
    border: 1px solid hsl(30, 75%, 45%);
    right: -1vw;
    bottom: -1vw;
`;

export const CompassArrow = styled.div`
    visibility: hidden;
    position: absolute;
    box-sizing: border-box;
    width: calc(6px + 1vw);
    height: calc(6px + 1vw);
    border: solid black;
    border-width: 0 calc(3px + 0.2vw) calc(3px + 0.2vw) 0;
    padding: 3px;
    ${props => props.navigable && css`
        visibility: visible;
    `}
    ${props => props.east && css`
        transform: rotate(-45deg);
        top: calc(50% - 3px - 0.5vw);
        right: 30%;
    `}
    ${props => props.south && css`
        transform: rotate(45deg);
        margin: 0 auto;
        bottom: 30%;
    `}
    ${props => props.west && css`
        transform: rotate(135deg);
        left: 30%;
        top: calc(50% - 3px - 0.5vw);
    `}
    ${props => props.north && css`
        transform: rotate(-135deg);
        margin: 0 auto;
        top: 30%;
    `}
`;

export const RoomTitle = styled.div`
    display: flex;
    position: absolute;
    top: -55px;
    width: calc(100px + 20vmin);
    font-weight: 700;
    height: 50px;
    border: 1px solid red;
    background-color: white;
    font-size: calc(0.6rem + 1vmin);
    justify-content: center;
    align-items: center;
`;

export const MyMapGuy = styled.div`
    position: absolute;
    box-sizing: border-box;
    left: calc(50% - 5px - 0.25vw);
    top: calc(50% - 5px - 0.25vw);
    width: calc(10px + 0.5vw);
    height: calc(10px + 0.5vw);
    border-radius: 100vmin;
    background-color: hsl(220, 85%, 50%);
    animation: ${flicker} 2s linear 0s infinite;
`;

export const CreateCharacterPage = styled.div`
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

export const CharacterAspectContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    width: 95vw;
    margin-left: calc(2.5vw - 1rem);
    margin-top: 1rem;
    height: 100px;
    border: 2px solid teal;
`;

export const CharacterIDSelector = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: calc(0.6rem + 1vmin);
    background-color: hsla(110, 60%, 20%, 0.9);
    color: white;
    font-weight: 800;
    height: 80%;
    width: calc(50px + 10vw);
    border-radius: 6px;
    border: 1px solid black;
    ${props => props.selected && css`
        background-color: hsl(130, 90%, 60%);
        color: hsl(310, 5%, 5%);
    `}
`;

export const CharacterClassChoiceContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    width: calc(200px + 40vw);
    margin-left: calc(30vw - 100px - 1rem);
    height: 160px;
    border: 1px solid #111;
    ${props => props.obscured && css`
        display: none;
    `}
`;

export const CharacterClassSelector = styled.div`
    display: flex;
    box-sizing: border-box;
    font-weight: 600;
    height: 80%;
    width: calc(60px + 15vw);
    justify-content: center;
    align-items: center;
    font-size: calc(0.8rem + 1.5vmin);
    border-radius: 12px;
    background-color: hsl(180, 80%, 50%);
    opacity: 0.7;
    ${props => props.dark && css`
        background-color: hsl(320, 70%, 35%);
        color: white;
    `}
    ${props => props.selected && css`
        border: 3px solid black;
        opacity: 1;
        font-weight: 900;
        font-size: calc(0.9rem + 1.5vmin);
    `}
`;

export const CharacterIdentityDescription = styled.p`
    font-size: 1.2rem;
    font-color: colors.blackish || navyblue;
    width: 80vw;
    margin-left: calc(10vw - 1rem);
    line-height: 1.5;
`;

export const CharacterClassDescription = styled.p``;