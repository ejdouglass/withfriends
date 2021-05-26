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

const fadeIn = keyframes`
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
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

export const Title = styled.h1`
    width: 100%;
    text-align: center;
    font-size: calc(0.8rem + 1vw);
    font-weight: 500;
`;

export const ExpositionText = styled.p`
    width: 80vw;
    padding: 0 10vw 0 10vw;
    margin: 0.5rem 0 0.5rem 0;
    font-size: calc(0.6rem + 0.6vw);
    line-height: 2rem;
    text-align: justify;
    display: none;
    ${props => props.goTime && css`
        animation: ${fadeIn} 1.2s linear;
        display: inline-block;
    `}
`;

export const ExpositionSnippet = styled.span`
    font-size: calc(0.6rem + 0.6vw);
    line-height: 2rem;
    animation: ${fadeIn} 1.2s linear;
`

export const ContinueExpositionButton = styled.button`
    // width: calc(30px + 1vw);
    padding: calc(0.3rem + 0.3vw);
    font-size: calc(0.4rem + 0.4vw);
    margin-left: calc(0.5rem + 0.5vw);
    display: none;
    ${props => props.buttonVisible && css`
        display: inline-block;
    `}
`;

export const Text = styled.p`
    overflow: hidden;
    text-overflow: ellipsis;
`;

export const BackgroundContainer = styled.div`
    box-sizing: border-box;
    justify-content: space-around;
    flex-wrap: wrap;
    align-items: flex-start;
    align-content: flex-start;
    width: 80%;
    margin: 1.5rem 10% 0 10%;
    border-top: 1px solid #225;
    border-left: 1px solid #225;
    border-right: 1px solid #225;
    padding-top: 1rem;
    display: none;
    ${props => props.goTime && css`
        display: flex;
    `}
`;

export const BackgroundSelection = styled.div`
    display: flex;
    box-sizing: border-box;
    width: 10vw;
    height: 5vw;
    margin-top: 10px;
    border: 1px solid red;
    font-size: calc(0.5rem + 0.5vw);
    font-weight: 600;
    justify-content: center;
    align-items: center;
    border-radius: 10px;
    ${props => props.selected && css`
        font-weight: 800;
        font-size: calc(0.6rem + 0.5vw);
        background-color: pink;
    `}
`;

export const BackgroundExplanation = styled.div`
    box-sizing: border-box;
    margin: 0 10% 0 10%;
    width: 80%;
    border-bottom: 1px solid #225;
    border-left: 1px solid #225;
    border-right: 1px solid #225;
    height: 100px;
    justify-content: center;
    align-items: center;
    font-size: calc(0.5rem + 0.4vw);
    font-weight: 400;
    color: #224;
    line-height: 2;
    text-align: center;
    padding: 0 5% 0 5%;
    font-size: calc(0.6rem + 0.1s);
    font-weight: 600;
    display: none;
    ${props => props.goTime && css`
        display: flex;
    `}
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

export const MainScreen = styled.div`
    position: absolute;
    display: flex;
    background-color: white;
    opacity: 1;
    z-index: 1;
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
    position: absolute;
    flex-direction: row;
    position: absolute;
    width: calc(250px + 10vw);
    height: 100px;
    top: -50px;
    left: -50px;
    background-color: hsl(180, 15%, 95%);
    border-radius: 3px;
    border: 1px solid black;
`;

export const CharCondition = styled.div`
    display: flex;
    flex-direction: column;
    width: 25%;
    padding-left: calc(0.5rem + 0.5vw);
`;

export const CharHPMP = styled.div`
    display: flex;
    flex-direction: column;
    font-size: calc(0.5rem + 0.5vw);
    width: 25%;
`;

// export const StanceEQL = styled.div``;

export const CharHPContainer = styled.div`
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    width: 100%;
    height: 50%;
`;

export const CharHP = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: calc(0.6rem + 0.6vw);
    color: white;
    background-color: ${props => props.healthColor || 'green'};
    height: 50px;
    width: ${props => props.HPpercent + '%' || '100%'};
`;

export const CharMP = styled(CharHP)`
    background-color: ${props => props.manaColor || 'blue'};
    width: ${props => props.MPpercent + '%' || '100%'};
`;

export const CharMPContainer = styled(CharHPContainer)`
`;

export const EQLStance = styled.div`
    display: flex;
`;

export const LogoutButton = styled.button`
    position: fixed;
    top: 0.5rem;
    right: 0.5rem;
    // width: 1.5vw;
`;

export const TopMenu = styled.div`
    position: absolute;
    flex-direction: row;
    align-items: center;
    box-sizing: border-box;
    display: flex;
    width: calc(60vw - 150px);
    height: 100px;
    border: 1px solid pink;
    left: calc(251px + 10vw);
    background-color: hsl(0, 70%, 90%);
`;

export const StructureContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    font-size: calc(0.4rem + 0.3vw);
    font-weight: 800;
    box-sizing: border-box;
    border: 1px solid #111;
    justify-content: center;
    align-items: center;
    height: 100px;
    width: 100px;
    background-color: #ccc;
`;

export const CharProfileContainer = styled.div`
    display: flex;
    flex-direction: column;
    width: calc(100px + 15vw);
    border-right: 1px solid red;
`;

export const CharProfileImg = styled.div`
    display: flex;
    width: 100px;
    height: 100px;
    background-color: blue;
`;

export const CharProfileName = styled.p`
    font-size: calc(0.6rem + 0.6vw);
    font-weight: 700;
    margin: 0.5rem 0;
`;

export const MyCompassView = styled.div`
    display: flex;
    position: absolute;
    right: 0;
    justify-content: center;
    background-color: hsl(40, 65%, 95%);
    width: 100px;
    height: 100px;
    border-left: 1px solid hsl(30, 75%, 45%);
`;

export const CompassArrow = styled.div`
    visibility: hidden;
    position: absolute;
    box-sizing: border-box;
    width: 16px;
    height: 16px;
    border: solid black;
    border-width: 0 4px 4px 0;
    padding: 3px;
    ${props => props.navigable && css`
        visibility: visible;
    `}
    ${props => props.east && css`
        transform: rotate(-45deg);
        top: calc(50% - 8px);
        right: 20%;
    `}
    ${props => props.south && css`
        transform: rotate(45deg);
        margin: 0 auto;
        bottom: 20%;
    `}
    ${props => props.west && css`
        transform: rotate(135deg);
        left: 20%;
        top: calc(50% - 8px);
    `}
    ${props => props.north && css`
        transform: rotate(-135deg);
        margin: 0 auto;
        top: 20%;
    `}
    ${props => props.northeast && css`
        transform: rotate(-90deg);
        right: 20%;
        top: 20%;
    `}
    ${props => props.southeast && css`
        transform: rotate(0deg);
        right: 20%;
        bottom: 20%;
    `}
    ${props => props.southwest && css`
        transform: rotate(90deg);
        left: 20%;
        bottom: 20%;
    `}
    ${props => props.northwest && css`
        transform: rotate(180deg);
        left: 20%;
        top: 20%;
`}
`;

export const ZoneTitle = styled.div`
    display: flex;
    justify-content: flex-end;
    position: absolute;
    box-sizing: border-box;
    font-weight: 600;
    height: 20px;
    top: 101px;
    right: calc(200px + 1.75vw);
    width: calc(140px + 5vw);
    background-color: white;
    font-size: calc(0.5rem + 0.5vw);
    align-items: center;
    text-align: center;
    ${props => props.room && css`
        font-size: calc(0.5rem + 0.4vw);
        font-weight: 500;
        top: 121px;
    `}
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
    z-index: 5000;
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
    box-sizing: border-box;
    height: calc(0.8rem + 0.8vw);
    font-size: calc(0.6rem + 0.5vw);
    width: calc(50px + 6vw);
    padding: 0.3rem 0.5rem 0.3rem 0.5rem;
    font-weight: 600;
    margin: 0 0.5rem 0 0.5rem;
    ${props => props.background && css`
        border: none;
        border-bottom: 1px solid black;
        width: calc(50px + 5vw);
        padding-bottom: 0;
        width: 6vw;
        text-align: center;
    `}
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

export const MainViewContainer = styled.div`
    position: absolute;
    display: flex;
    flex-direction: column;
    overflow-y: scroll;
    box-sizing: border-box;
    width: 80%;
    height: 80%;
    font-weight: 500;
    font-size: 1.2rem;
    border: 2px solid red;
    top: 50px;
    left: 10%;
`;

export const EyeView = styled.div`
    position: absolute;
    display: flex;
    flex-direction: column;
    top: 20%;
    height: 80%;
    width: 100%;
    overflow-y: scroll;
    box-sizing: border-box;
    border: 1px solid yellow;
`;

export const RoomView = styled.div`
    position: absolute;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 20%;
    border: 2px solid blue;
    background-color: white;
`;

export const RoomName = styled.div`
    width: 100%;
    border: 3px solid green;
    font-size: calc(0.6rem + 0.5vw);
    padding-left: calc(0.5rem + 0.5vw);
    height: calc(1rem + 0.6vw);
    box-sizing: border-box;
`;

export const RoomDetails = styled.div`
    display: flex;
    flex-direction: row;
    height: 100%;
`;

export const RoomImg = styled.div`
    background: linear-gradient(#17F, #03D);
    height: 100%;
    width: 100px;
`;

export const RoomDesc = styled.div`
    height: 100%;
    font-size: calc(0.5rem + 0.5vw);
    width: calc(100% - 100px);
    padding: 0.5rem;
`;

export const ChatWrapper = styled.form`
    display: none;
    position: absolute;
    box-sizing: border-box;
    flex-direction: row;
    height: 2rem;
    top: calc(50px + 80%);
    left: 10%;
    width: 80%;
    ${props => props.chatting && css`
        display: flex;
    `}
`;

export const ChatPrompt = styled.div`
    position: absolute;
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    height: 2rem;
    top: calc(50px + 80%);
    border: 1px solid black;
    left: calc(10% - 20px - 2vw);
    width: calc(20px + 2vw);
    ${props => props.chatting && css`
        display: none;
    `}
`;

export const ChatInput = styled.input`
    display: flex;
    box-sizing: border-box;
    width: calc(100% - 2rem);
    height: 2rem;
    border: 1px solid blue;
    top: calc(50px + 80%);
    left: 10%;
    padding-left: 1rem;
    font-size: 1.2rem;
`;

export const ChatSubmit = styled.button`
    width: 2rem;
    height: 2rem;
    box-sizing: border-box;
    border: 1px solid black;
    font-size: 1.5rem;
    display: flex;
    justify-content: center;
    align-items: center;
`;

export const CurrentFocus = styled.div`
    position: absolute;
    display: flex;
    z-index: 700;
    box-sizing: border-box;
    width: 80%;
    height: 40%;
    top: 50px;
    left: 10%;
    font-size: 1.2rem;
    font-weight: 500;
    border: 1px solid blue;
`;

export const NPCInteractionContainer = styled.div`
    position: absolute;
    background-color: white;
    padding-left: calc(0.5rem + 0.5vw);
    font-size: calc(0.5rem + 0.5vw);
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    border: 1px solid black;
    z-index: 700;
    width: 80%;
    height: calc(100px + 10vh);
    top: 175px;
    left: 10%;
`;

export const Fader = styled.div`
    position: absolute;
    // border: 3px solid red;
    top: calc(100% + 3px);
    left: calc(-0.2rem);
    width: 100%;
    height: 200px;
    background-image: linear-gradient(hsla(130, 100%, 100%, 0.7), hsla(110, 100%, 100%, 0.5));
`;

export const NPCInteractionOptions = styled.div`
    position: absolute;
    box-sizing: border-box;
    bottom: calc(0.5rem + 0.5vw);
    width: 100%;
    // border: 3px solid green;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
`;

export const NPCInteractionButton = styled.button`
    display: flex;
    justify-content: center;
    box-sizing: border-box;
    align-items: center;
    padding: calc(0.5rem + 0.5vw);
    font-size: calc(0.5rem + 0.4vw);
    width: calc(50px + 3vw);
    border: 1px solid #333;
    font-weight: 600;
    margin: 0 calc(0.3rem + 0.3vw) 0 calc(0.3rem + 0.3vw);
    ${props => props.viewed && css`
        border: 2px solid black;
        border-radius: 6px;
        font-weight: 700;
        background-color: white;
    `}
`;

export const InventoryContainer = styled(NPCInteractionContainer)`
    top: 50px;
    height: calc(225px + 10vh);
    flex-direction: row;
    padding: 0;
`;

export const EquippedContainer = styled.div`
    display: flex;
    flex-direction: column;
    width: 30%;
    box-sizing: border-box;
    border: 3px solid red;
`;

export const EquippedItem = styled.div`
    display: flex;
    box-sizing: border-box;
    border-top: 1px solid black;
    justify-content: flex-start;
    align-items: center;
    padding: calc(0.3rem + 0.3vw) 0;
    ${props => props.viewed && css`
        background-color: #0AF;
        color: white;
        font-weight: 600;
    `}
`;

export const BackpackContainer = styled.div`
    display: flex;
    flex-direction: row;
    width: 70%;
    box-sizing: border-box:
    border: 3px solid green;
    // animation: ${animateBackpackOpening} 0.1s linear;
`;

export const BackpackColumn = styled.div`
    display: flex;
    flex-direction: column;
    width: calc(70% / 2);
    box-sizing: border-box;
    border-right: 1px solid black;
    ${props => props.locked && css`
        background-color: #777;
        border-right: 0;
    `}
`;

export const BackpackItem = styled.div`
    display: flex;
    border-top: 1px solid black;
    justify-content: flex-start;
    align-items: center;
    height: 30px;
    padding-left: calc(0.3rem + 0.3vw);
    text-overflow: ellipsis;
    ${props => props.viewed && css`
        background-color: #0AF;
        color: white;
        font-weight: 600;
    `}
`;

export const InventoryItemDetails = styled.div`
    display: flex;
    position: absolute;
    box-sizing: border-box;
    background-color: white;
    font-size: (0.5rem + 0.5vw);
    width: 100%;
    height: 100px;
    border: 3px solid orange;
    top: 100%;
`;

export const StatusScreenContainer = styled(NPCInteractionContainer)`
    top: 50px;
    border: 4px solid green;
    height: 100%;
    flex-direction: column;
`;

export const CombatScreenContainer = styled(NPCInteractionContainer)`
    top: 50px;
    box-sizing: border-box;
    border: 4px solid red;
    flex-direction: column;
    background-color: white;
    height: 400px;
    // HM. Let's brainstorm how this one'll look. Use iSpy for all feedback and risk interference, or have a separate full combat window with feedback screen?
`;

export const ThreatsContainer = styled.div`
    width: 100%;

`;

export const CombatFeedBack = styled.div`
    display: flex;
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 60%;
    padding: 0.5rem 1rem;
    left: 0;
    flex-direction: column;
    box-sizing: border-box;
    border: 1px solid green;
    font-size: calc(0.5rem + 0.5vw);
    font-weight: 400;
    overflow-y: scroll;
`;

export const StatusScreenTitleContainer = styled.div``;

export const StatusScreenCharacterContainer = styled.div``;

export const StatusScreenHealthContainer = styled.div`
    display: flex;
    flex-direction: row;
`;

export const HealthItem = styled.div`
    display: flex;
    justify-content: flex-start;
    align-items: center;
    box-sizing: border-box;
    padding: calc(0.4rem + 0.4vw);
    margin-right: calc(0.5rem + 0.5vw);
    border: 1px solid #777;
`;

export const StatusScreenCoreStatsContainer = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    background-color: pink;
    justify-content: space-around;
    padding: 2rem 0 2rem 0;
`;

export const CoreStatItem = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: calc(0.5rem + 0.5vw);
    font-weight: 500;
    border: 1px solid red;
    border-radius: 10%;
    padding: 0.5rem 0.25rem;
`;

export const StatusScreenDerivedStatsContainer = styled.div`
    display: flex;
    flex-direction: column;
    background-color: hsl(30, 60%, 70%);
    padding-bottom: 0.5rem;
`;

export const DerivedStatsRow = styled.div`
    display: flex;
    justify-content: space-around;
    width: 100%;
    margin: 0.5rem 0 0 0;
`;

export const DerivedStatItem = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: 500;
    font-size: calc(0.5rem + 0.5vw);
`;

export const StatusScreenSkillsContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
`;

export const SkillItem = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: 500;
    width: 20%;
    box-sizing: border-box;
    height: 3rem;
    font-size: calc(0.5rem + 0.5vw);
`;

export const CombatContainer = styled(NPCInteractionContainer)`
    // moar here
`;

export const MagicContainer = styled(NPCInteractionContainer)`
    // moar here
`;

export const EyeSpyLine = styled.p`
    font-size: calc(0.5rem + 0.5vw);
    padding-left: 1rem;
`;

export const EntityGlancer = styled.div`
    display: flex;
    width: 100%;
    justify-content: center;
    box-sizing: border-box;
    align-items: center;
    padding-top: 0.3rem;
    padding-bottom: 0.3rem;
    ${props => props.mob && css`
        background-color: hsl(300, 70%, 70%);
    `}
    ${props => props.npc && css`
        background-color: hsl(140, 70%, 70%);
    `}
    ${props => props.player && css`
        background-color: hsl(220, 70%, 70%);
    `}
    ${props => props.viewed && css`
        // HERE: set up looking at/selecting with cursor
        border: 3px solid black;
        font-weight: 600;
    `}
`

export const LeftMenu = styled.div`
    position: absolute;
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    align-items: center;
    padding-top: 30px;
    box-sizing: border-box;
    border-left: 1px solid red;
    border-bottom: 1px solid red;
    width: calc(40px + 10vw);
    height: calc(80% - 40px);
    top: 90px;
    right: 90%;
    background-color: white;
`;

export const ActionButton = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #DDD;
    box-sizing: border-box;
    font-weight: 600;
    width: 80%;
    height: 50px;
    margin-bottom: 20px;
    border: 1px solid hsl(240, 70%, 5%);
    border-radius: 10px;
    &:hover {
        border: 2px solid hsl(240, 80%, 10%);
        background-color: #EEF;
    }
    ${props => props.selected && css`
        width: 90%;
        border: 3px solid hsl(240, 80%, 10%);
        background-color: white;
    `}
    ${props => props.viewed && css`
        border: 2px solid hsl(240, 80%, 10%);
        background-color: #EEF;
    `}
`;

export const RightMenu = styled.div`
    position: absolute;
    box-sizing: border-box;
    width: calc(40px + 10vw);
    top: 50px;
    height: 80%;
    background-color: white;
    right: calc(10% - 40px - 10vw);
`;

export const RightMenuLabel = styled.h1`
    font-size: calc(0.6rem + 0.5vw);
    font-weight: 600;
    width: calc(100% - 2rem);
    background-color: #0AF;
    padding: 1rem;
    text-align: center;
`;

export const EntityList = styled.div`
    font-size: calc(0.5rem + 0.5vw);
    font-weight: 400;
`;