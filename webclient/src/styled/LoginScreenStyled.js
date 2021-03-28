import styled from 'styled-components';

export const LoginPage = styled.div`
    position: fixed;
    z-index: 6000;
    top: 0;
    left: 0;
    display: flex;
    width: 100vw;
    height: 100vh;
    background-color: white;
    flex-direction: column;
    align-items: center;
`;

export const CredentialsForm = styled.form`
    display: flex;
    width: 100%;
    flex-direction: column;
    align-items: center;
`;

export const CredentialsInput = styled.input`
    width: 40%;
    margin-top: 1rem;
    padding: 0.5rem;
    font-size: 1.2rem;
`;

export const SubmitCredentialsButton = styled.button`
    width: 40%;
    margin-top: 1rem;
    padding: 0.5rem;
    font-size: 1.2rem;
    background: linear-gradient(#0AF, blue);
    color: white;
    font-weight: 600;
`;