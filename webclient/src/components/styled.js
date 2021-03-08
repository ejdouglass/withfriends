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
    width: 100vw;
    height: 150px;
    background-color: ${props => props.color};
`;

export const GroundBox = styled.div`
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    margin: 0;
    width: 100vw;
    height: 150px;
    background-color: ${props => props.color};
`;

export const BackpackContainer = styled.div`
    display: flex;
    position: fixed;
    z-index: 20;
    top: 150px;
    left: 10%;
    width: 80vw;
    height: calc(100vh - 300px);
    background-color: brown;
    border: 1px solid black;
    animation: ${animateBackpackOpening} 0.1s linear;
`;