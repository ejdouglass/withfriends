import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { Context } from '../context/context';
import { CreateCharacterScreen, CreateCharacterForm, CreateCharacterButton, Title, CharacterNameInput } from '../components/styled';

const GameScreen = () => {
    const [state, dispatch] = useContext(Context);
    const [newChar, setNewChar] = useState({
        name: '',
        class: '',
        feature: {eyes: '', hair: '', height: ''},
        stat: {strength: 20, agility: 20, constitution: 20, willpower: 20, intelligence: 20, wisdom: 20, charisma: 20, available: 0}
    })

    function loadCharFromToken(charToken) {
        // THIS: axios passes the charToken to the API in an attempt to load up the character in question
        axios.post('/character/login', { charToken: charToken })
            .then(res => console.log(res.data))
            .catch(err => console.log(err));
    }

    function parseCharNameInput(nameString) {
        // Capitalizes the character name and prevents spaces as user types
        if (nameString.length > 0) nameString = nameString[0].toUpperCase() + nameString.slice(1);
        nameString = nameString.split(' ').join('');
        setNewChar({...newChar, name: nameString});
    }

    function saveNewCharacter(e) {
        e.preventDefault();
        console.log(`Connecting to API to create this new character...`);
        // THIS: Passes to API via axios to create a new character.

        // HERE: Validation checks (also perform on backend)

        // HERE: Send newChar to axios; if successful, will receive newChar full data (with location and all!), as well as charToken to localStore.
        // CONSIDER: Hm, instead of localStorage, should I do an HTTP version JS isn't allowed to touch? Maybe.
        axios.post('/character/create', { newChar: newChar })
            .then(res => console.log(res.data))
            .catch(err => console.log(err));
    }

    useEffect(() => {
        // Ok, anyway. Here we can attempt to load up the character from localStorage, and if no such character loads up, fire up CREATION MODE
        // Which will entail using DISPATCH to change the mode so our keypresses don't, say, open the backpack :P
        const charToken = localStorage.getItem('charToken');
        if (charToken) {
            loadCharFromToken(charToken);
        }
    }, []);

    // Can add another useEffect down below to monitor changes to state.characterName and adjust accordingly

    return (
        <>
        {state.characterName ? (<></>) : (
            <CreateCharacterScreen>
                <CreateCharacterForm onSubmit={e => saveNewCharacter(e)}>
                    <Title>Welcome to With Friends! New here? Make a new character!</Title>
                    <CharacterNameInput autoFocus={true} minLength={5} maxLength={12} type='text' value={newChar.name} onChange={e => parseCharNameInput(e.target.value)}></CharacterNameInput>
                    <CreateCharacterButton>Create Character!</CreateCharacterButton>
                </CreateCharacterForm>
            </CreateCharacterScreen>
        )}
        </>
    )
}

export default GameScreen;

/*

    Did some testing and this ONLY appears when you're in the "/" path. Interesting!
    ... all the other compnents just mount on up regardless of whatever nonsense path I put. Whoops? Maybe not whoops? We'll see.. :P
    ... that DOES open up the interesting option to have the characterName be present in the URL, though obviously we can't require that config.

    We can have some other app-wide component check to see if we're in the proper URL and push us around if not?

*/