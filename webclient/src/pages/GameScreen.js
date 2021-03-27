import React, { useContext, useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import { Context, actions } from '../context/context';
import { CreateCharacterScreen, CharacterClassSelector, CharacterClassChoiceContainer, CharacterIDSelector, CharacterIdentityDescription, CharacterAspectContainer, CreateCharacterForm, CreateCharacterButton, Title, CharacterNameInput, PWInput } from '../components/styled';

const charId = {
    ROAMER: 'roamer',
    FIGHTER: 'fighter',
    PROVIDER: 'provider',
    THINKER: 'thinker'
};

// Two per... but we're already off in the weeds here :P Actually, 
// I think I'm just being silly having this extra layer. Just... have CLASS be more inclusive. 
// And you can add 'profession' granularity later in-game. Cool? Cool.
// Eh, let's just do an ARRAY for the stats down below, since we're setting them in the API anyway.
const charClass = {
    OUTLAW: {name: 'Outlaw', description: ``, stat: {}}, // thieves, bandits, con artists
    WAYFARER: {name: 'Wayfarer', description: ``, stat: {}}, // explorers, rangers, traders

    MERCENARY: {name: 'Mercenary', description: ``, stat: {}}, // a soldier for hire
    MONK: {name: 'Monk', description: ``, stat: {}}, // some flavor of autonomous martial artist

    CRAFTER: {name: 'Crafter', description: ``, stat: {}}, // blanket class for artisans, landworkers, etc.
    MASTER: {name: 'Master', description: ``, stat: {}}, // due for rename; more like scholar/doctor/etc.

    CATALYST: {name: 'Catalyst', description: ``, stat: {}}, // black mage prototype -- destroy, reveal, alter, know
    SYMPATH: {name: 'Sympath', description: ``, stat: {}} // white mage prototype -- preserve, connect, adjust, sense
};

// Hm, makes sense to attach the classes to these already-extant objects, easier to render than doing a lot of querying down the road.
const identities = [
    {
        name: 'Rogue', 
        description: `Walls? Boundaries? Locks? Laws? These petty obstacles are negotiable in the pursuit of your goals.`,
        class: [charClass.WAYFARER, charClass.OUTLAW]
    },
    {
        name: 'Warrior', 
        description: `Your body is strong and fast, your reflexes honed, your mind alert; ready for any threat.`,
        class: [charClass.MONK, charClass.MERCENARY]
    },
    {
        name: 'Tradesman', 
        description: `Knowing how and working hard -- you are a creator and provider, the heart of any community.`,
        class: [charClass.CRAFTER, charClass.MASTER]
    },
    {
        name: 'Wizard', 
        description: `You've realized a very liberating, basic truth: *any* problem can be solved if you throw enough MP at it.`,
        class: [charClass.SYMPATH, charClass.CATALYST]
    }
];

const GameScreen = () => {
    const [state, dispatch] = useContext(Context);
    const [newChar, setNewChar] = useState({
        name: '',
        password: '',
        feature: {eyes: '', hair: '', height: ''},
        quirks: []
    });
    const [userCredentials, setUserCredentials] = useState({charName: '', password: ''});
    const [selectedIdentityIndex, setSelectedIdentityIndex] = useState(undefined);
    const [selectedClass, setSelectedClass] = useState('');
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
                // HERE: dispatch alert for user feedback
            });
    }

    function login() {
        // THIS: makes sure we have a valid charname and passsword, then throws it along the same /character/login path as above
        axios.post('/character/login', { userCredentials: userCredentials })
            .then(res => {
                console.log(res.data);
                dispatch({type: actions.LOAD_CHAR, payload: {character: res.data.payload.character}});
                localStorage.setItem('withFriendsJWT', res.data.payload.token);
                history.push('/play');                

                // HERE: handle failure of login, including user feedback via dispatch alert
            })
            .catch(err => {
                console.log(err);
                // HERE: user feedback via dispatch alert
            })
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

    function identitySelectionHandler(val) {
        setSelectedIdentityIndex(val);
        setSelectedClass('');
    }

    function saveNewCharacter(e) {
        e.preventDefault();
        // THIS: Passes to API via axios to create a new character.

        // HERE: Validation checks (also will separately be performed on backend)
        let error = ``;
        if (newChar.name.length < 5 || newChar.name.length > 12) error += `Enter a valid character name between 5 and 12 characters long. `;
        if (newChar.password.length < 4) error += `Enter a proper password (4+ characters). `;
        if (selectedIdentityIndex === undefined || !selectedClass) error+= `Please choose an Identity and a Class. `;
        // ADD: identity, class, quirks

        if (error) {
            console.log(error);
            return;
        } else {
            console.log(`Connecting to API to create this new character...`);
            let myChar = {...newChar, identity: identities[selectedIdentityIndex].name, class: selectedClass}
            axios.post('/character/create', { newChar: myChar })
                .then(res => {
                    console.log(res.data);
                    // HERE: load up the received res.data.character into LIVE MEMORY
                    dispatch({type: actions.LOAD_CHAR, payload: {character: res.data.payload.character}});
                    
                    // This sets the header for all subsequent axios requests; might consider using HTTP-only instead?
                    // Also just realized setting axios headers is kinda meaningless to the socket, whoops :P
                    // axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.payload.token}`;
                    localStorage.setItem('withFriendsJWT', res.data.payload.token);
                    history.push('/play');
                })
                .catch(err => console.log(err));
        }
        // HERE: Send newChar to axios; if successful, will receive newChar full data (with location and all!), as well as charToken to localStore.
        // CONSIDER: Hm, instead of localStorage, should I do an HTTP version JS isn't allowed to touch? Maybe.

    }

    useEffect(() => {
        // Ok, anyway. Here we can attempt to load up the character from localStorage, and if no such character loads up, fire up CREATION MODE
        // Which will entail using DISPATCH to change the mode so our keypresses don't, say, open the backpack :P
        const charToken = localStorage.getItem('withFriendsJWT');
        if (charToken) {
            console.log(`Found a token! Attempting to load from it.`);
            loadCharFromToken(charToken);
        }
    }, []);

    // Can add another useEffect down below to monitor changes to state.characterName and adjust accordingly

    return (
        <>
        {state.characterName ? (<></>) : (
            <CreateCharacterScreen>
                <CreateCharacterForm onSubmit={e => saveNewCharacter(e)}>
                    <Title>Welcome to With Friends! New here? Make a character!</Title>
                    <CharacterNameInput autoFocus={true} minLength={5} maxLength={12} type='text' placeholder={`character name`} value={newChar.name} onChange={e => parseCharNameInput(e.target.value)}></CharacterNameInput>
                    <CharacterIdentityDescription>What is your Identity?</CharacterIdentityDescription>
                    <CharacterAspectContainer>
                        {identities.map((identity, index) => (
                            <CharacterIDSelector selected={index === selectedIdentityIndex} key={identity.name} onClick={() => identitySelectionHandler(index)} >{identity.name}</CharacterIDSelector>
                        ))}
                    </CharacterAspectContainer>
                    <CharacterIdentityDescription>{identities[selectedIdentityIndex]?.description}</CharacterIdentityDescription>

                    <CharacterClassChoiceContainer obscured={selectedIdentityIndex === undefined}>
                        {identities[selectedIdentityIndex]?.class.map((characterClass, index) => (
                            <CharacterClassSelector key={characterClass.name} dark={index === 1} selected={characterClass.name === selectedClass} onClick={() => setSelectedClass(characterClass.name)}>{characterClass.name}</CharacterClassSelector>
                        ))}

                    </CharacterClassChoiceContainer>
                    <PWInput type='text' placeholder={`password`} minLength={4} value={newChar.password} onChange={e => parsePasswordInput(e.target.value)}></PWInput>
                    <CreateCharacterButton>Create Character!</CreateCharacterButton>
                </CreateCharacterForm>
            </CreateCharacterScreen>
        )}
        </>
    )
}

export default GameScreen;

/*

    LAYOUT IDEA: Name, ID, Class at the top, pick it all, have it described in text, PASSWORD at the bottom to submit when it's all ready!

    Did some testing and this ONLY appears when you're in the "/" path. Interesting!
    ... all the other compnents just mount on up regardless of whatever nonsense path I put. Whoops? Maybe not whoops? We'll see.. :P
    ... that DOES open up the interesting option to have the characterName be present in the URL, though obviously we can't require that config.

    We can have some other app-wide component check to see if we're in the proper URL and push us around if not?

*/