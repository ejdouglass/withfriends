import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { Context } from '../context/context';
import { CreateCharacterScreen, CharacterIDSelector, CharacterAspectContainer, CreateCharacterForm, CreateCharacterButton, Title, CharacterNameInput, PWInput } from '../components/styled';

const charId = {
    ROAMER: 'roamer',
    FIGHTER: 'fighter',
    PROVIDER: 'provider',
    THINKER: 'thinker'
};

const identities = [
    {name: 'Roamer', description: ``},
    {name: 'Fighter', description: ``},
    {name: 'Provider', description: ``},
    {name: 'Thinker', description: ``}
];

const charClass = {
    SNEAK: 'sneak',
    RANGER: 'ranger',
    EXPLORER: 'explorer',

    SOLDIER: 'soldier',
    MONK: 'monk',
    MERCENARY: 'mercenary',

    VILLAGER: 'villager',
    TRADESMAN: 'tradesman',
    HEALER: 'healer',

    MYSTIC: 'mystic',
    CATALYST: 'catalyst',
    SYMPATH: 'sympath'
};

const GameScreen = () => {
    const [state, dispatch] = useContext(Context);
    const [newChar, setNewChar] = useState({
        name: '',
        password: '',
        identity: '',
        class: '',
        feature: {eyes: '', hair: '', height: ''},
        quirks: []
    });
    // New concept: identity and class determine bulk of base stats, quirk choices round out the rest
    // ... so, we'll be adding some SWEET SWEET 

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

    function parsePasswordInput(pwString) {
        pwString = pwString.split(' ').join('');
        setNewChar({...newChar, password: pwString});
    }

    function saveNewCharacter(e) {
        e.preventDefault();
        // THIS: Passes to API via axios to create a new character.

        // HERE: Validation checks (also will separately be performed on backend)
        let error = ``;
        if (newChar.name.length < 5 || newChar.name.length > 12) error += `Enter a valid character name between 5 and 12 characters long. `;
        if (newChar.password.length < 4) error += `Enter a proper password (4+ characters). `;
        // ADD: identity, class, quirks

        if (error) {
            return;
        } else {
            console.log(`Connecting to API to create this new character...`);
            axios.post('/character/create', { newChar: newChar })
                .then(res => console.log(res.data))
                .catch(err => console.log(err));
        }
        // HERE: Send newChar to axios; if successful, will receive newChar full data (with location and all!), as well as charToken to localStore.
        // CONSIDER: Hm, instead of localStorage, should I do an HTTP version JS isn't allowed to touch? Maybe.

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
                    <CharacterNameInput autoFocus={true} minLength={5} maxLength={12} type='text' placeholder={`character name`} value={newChar.name} onChange={e => parseCharNameInput(e.target.value)}></CharacterNameInput>
                    <PWInput type='text' placeholder={`password`} minLength={4} value={newChar.password} onChange={e => parsePasswordInput(e.target.value)}></PWInput>
                    <CharacterAspectContainer>
                        {/* HERE: some styled divs that click to select identity, exclusively */}
                        {identities.map((identity, index) => (
                            <CharacterIDSelector key={identity.name}>{identity.name}</CharacterIDSelector>
                        ))}
                    </CharacterAspectContainer>
                    <CharacterAspectContainer>
                        {/* HERE: some styled divs that click to select class, exclusively */}

                    </CharacterAspectContainer>
                    <CreateCharacterButton>Create Character!</CreateCharacterButton>
                </CreateCharacterForm>
            </CreateCharacterScreen>
        )}
        </>
    )
}

export default GameScreen;

/*

    Just scruffgawing over here:
    Identity and Classes:
    * Note: may change from single-name identifiers for user to short descriptions, i.e., "I provide and protect...", "I range outside the walls and laws..."
    ROAMER
        Sneak
        Ranger
        Explorer
    FIGHTER
        Soldier
        Monk
        Mercenary
    PROVIDER
        Villager (farmer, fisher, etc.)
        Tradesman
        Healer
    THINKER
        Mystic
        Blast Mage
        Bend Mage
    
    

    Did some testing and this ONLY appears when you're in the "/" path. Interesting!
    ... all the other compnents just mount on up regardless of whatever nonsense path I put. Whoops? Maybe not whoops? We'll see.. :P
    ... that DOES open up the interesting option to have the characterName be present in the URL, though obviously we can't require that config.

    We can have some other app-wide component check to see if we're in the proper URL and push us around if not?

*/