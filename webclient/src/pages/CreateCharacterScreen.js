import React, { useContext, useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import { Context, actions } from '../context/context';
import { CreateCharacterPage, CharacterClassSelector, CharacterClassChoiceContainer, CharacterIDSelector, CharacterIdentityDescription, CharacterAspectContainer, CreateCharacterForm, CreateCharacterButton, Title, ExpositionText, CharacterNameInput, PWInput, BackgroundContainer, BackgroundSelection, BackgroundExplanation, ContinueExpositionButton, ExpositionSnippet } from '../components/styled';

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

const backgrounds = ['Gatherer', 'Thief', 'Mercenary', 'Runner', 'Apprentice', 'Hedgewizard', 'Scribe', 'Trader', 'Laborer', 'Healer'];

const backgrounds1 = ['Gatherer', 'Laborer', 'Healer'];
const backgrounds2 = ['Mercenary', 'Hedgewizard', 'Thief'];
const backgrounds3 = ['Trader', 'Scribe', 'Runner', 'Apprentice'];
const backgroundsText = {
    'Gatherer': `Your hands were very dirty!`,
    'Laborer': `So sweaty.`,
    'Healer': `Very wise and empathetic.`,
    'Mercenary': `Rawr`,
    'Hedgewizard': `Sizzle!`,
    'Thief': `Sneaksneaksneak...`
};

const CreateCharacterScreen = () => {
    const [state, dispatch] = useContext(Context);
    const [step, setStep] = useState(0);
    const [newChar, setNewChar] = useState({
        name: '',
        password: '',
        age: 20,
        feature: {eyes: '', hair: '', height: '', complexion: '', build: ''},
        background: {first: '', second: '', third: ''}
    });
    const [backgroundDescription, setBackgroundDescription] = useState('(mouse over to view more details about each background)');
    const [userCredentials, setUserCredentials] = useState({charName: '', password: ''});
    const [selectedIdentityIndex, setSelectedIdentityIndex] = useState(undefined);
    const [selectedClass, setSelectedClass] = useState('');
    const history = useHistory();

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

    function handleBackgroundSelection(newBackground) {
        if (newChar.background.first === newBackground) return setNewChar({...newChar, background: {...newChar.background, first: ''}});
        if (newChar.background.second === newBackground) return setNewChar({...newChar, background: {...newChar.background, second: ''}});
        if (newChar.background.third === newBackground) return setNewChar({...newChar, background: {...newChar.background, third: ''}});

        if (newChar.background.first === '') return setNewChar({...newChar, background: {...newChar.background, first: newBackground}});
        if (newChar.background.second === '') return setNewChar({...newChar, background: {...newChar.background, second: newBackground}});
        if (newChar.background.third === '') return setNewChar({...newChar, background: {...newChar.background, third: newBackground}});
        
    }

    function parsePasswordInput(pwString) {
        pwString = pwString.split(' ').join('');
        setNewChar({...newChar, password: pwString});
    }

    function identitySelectionHandler(val) {
        setSelectedIdentityIndex(val);
        setSelectedClass('');
    }

    function tellMeMore(hoveredBackground) {
        // const backgrounds = ['Gatherer', 'Thief', 'Mercenary', 'Runner', 'Apprentice', 'Hedgewizard', 'Scribe', 'Trader', 'Laborer', 'Healer'];
        switch (hoveredBackground) {
            case 'Gatherer': {
                setBackgroundDescription(`You've become proficient at going into the local wilderness 
                and bringing back lumber and various herbal supplies. You've got the axe to prove it! (begin with +10 gathering skill, begin with woodcutter's axe)`);
                break;
            }
            case 'Thief': {
                setBackgroundDescription(`You learned to get by with a little help from your friends... and complete strangers, who have graciously 
                donated coins here and there to your livelihood. (begin with +10 sneaking skill)`);
                break;
            }
            case 'Mercenary': {
                setBackgroundDescription(`In a world with monsters, jerks, and giant rats, there's always a need for some extra peacekeeping, and you've 
                grown somewhat skilled in combat lending your arms to various local causes. (begin with +10 fighting skill, begin with improved armors)`);
                break;
            }
            case 'Runner': {
                setBackgroundDescription(`Running messages between interested parties between villages and towns is a good way to stay quick on your feet, 
                and you've become practiced in swimming, climbing, and generally getting around effectively. (begin with +10 traversal skill)`);
                break;
            }
            case 'Apprentice': {
                setBackgroundDescription(`Lending a pair of hands, eyes, and attentive mind to a variety of local craftsfolk in your travels has paid off, 
                and you've picked up a trick or two in the basics of creating, repairing, and customizing items and gear. (begin with +10 crafting skill)`);
                break;
            }
            case 'Hedgewizard': {
                setBackgroundDescription(`There's no problem that can't be solved by throwing more MP at it, and in that spirit, you've picked up 
                some spells here and there, easing your travels with some practical spellcraft. (begin with +10 spellcasting skill, begin with staff)`);
                break;
            }
            case 'Scribe': {
                setBackgroundDescription(`You've learnt your letters, poring over tomes and transcribing clever texts for various high-minded professionals 
                in robe-collared trades. In the process, you've sharpened your mind and knowledge base. (begin with +10 scholarship skill)`);
                break;
            }
            case 'Trader': {
                setBackgroundDescription(`In a world with monsters, jerks, and giant rats, there's always a need for somebody paying really close attention, 
                and you've lent your eyes and vigilance to various causes. Along the way, you've become quite perceptive. (begin with +10 sensing skill)`);
                break;
            }
            case 'Laborer': {
                setBackgroundDescription(`You've build strong arms and precise hands helping various towns and villages put up buildings, dig ditches, work the 
                fields, and generally see to the practical side of sheltering a community. (begin with +10 building skill)`);
                break;
            }
            case 'Healer': {
                setBackgroundDescription(`In a world with monsters, jerks, and giant rats, it's common to have to put bodies back together and remedy various ills, 
                and you've developed a practical knowledge of medicine and first aid techniques for that purpose. (begin with +10 medicine skill)`);
                break;
            }
            default:
                break;
        }
    }

    function tellMeNothing() {
        setBackgroundDescription('(mouse over to view more details about each background)');
    }

    function progressCreationProcess(e) {
        e.preventDefault();
        // THIS: Steps user through the character creation story until ultimately passing to API via axios to create a new character

        switch (step) {
            case 0: {
                if (newChar.name.length >= 5 && newChar.name.length <= 12) {
                    setStep(1);
                    break;
                } else {
                    console.log(`Name is too short. Or too long! Yeah.`);
                    break;
                }
            }
            case 1: {
                if (newChar.background.first.length > 0) {
                    setStep(2);
                    setTimeout(() => {
                        setStep(3);
                    }, 2500);
                }
                break;
            }
            case 3: {
                if (newChar.background.second.length > 0) {
                    setStep(4);
                    setTimeout(() => {
                        setStep(5);
                    }, 2500);
                }
                break;
            }
        }

        // HERE: Validation checks (also will separately be performed on backend)
        let error = ``;
        if (newChar.name.length < 5 || newChar.name.length > 12) error += `Enter a valid character name between 5 and 12 characters long. `;
        if (newChar.password.length < 4) error += `Enter a proper password (4+ characters). `;
        if (newChar.background.first === '' || newChar.background.second === '' || newChar.background.third === '') error+= `Please choose three backgrounds for your character. `;
        // ADD: identity, class, quirks

        if (error) {
            console.log(error);
            return;
        } else {
            console.log(`Connecting to API to create this new character...`);
            let myChar = {...newChar}
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

    // Can add another useEffect down below to monitor changes to state.characterName and adjust accordingly

    return (
        <>
        {state.characterName ? (<></>) : (
            <CreateCharacterPage>
                <CreateCharacterForm onSubmit={e => progressCreationProcess(e)}>
                    <Title>Welcome to Fantastically With Friends!</Title>
                    <ExpositionText goTime={step >= 0}>
                        You are 
                        {/* Consider: disable this input when step > 0 */}
                        <CharacterNameInput autoFocus={true} minLength={5} maxLength={10} type='text' placeholder={`(enter name)`} value={newChar.name} onChange={e => parseCharNameInput(e.target.value)}></CharacterNameInput>
                        , a traveler who is doing some traveling, as one might expect.
                        <ContinueExpositionButton buttonVisible={step === 0} onClick={e => progressCreationProcess(e)}>...</ContinueExpositionButton>
                    </ExpositionText>
                    <ExpositionText goTime={step >= 1}>
                        {/* SUGGESTION: change to personal experience rather than lofty description */}
                        You recall your first contribution to your community was as a 
                        {newChar.background.first.length > 0 ? ` ${newChar.background.first}` : '...'}.
                        <ContinueExpositionButton buttonVisible={step === 1} onClick={e => progressCreationProcess(e)}>...</ContinueExpositionButton>
                        {step >= 2 && 
                            <ExpositionSnippet>{` ${backgroundsText[newChar.background.first]}`}</ExpositionSnippet>
                        }
                        <BackgroundContainer goTime={step === 1}>
                            {backgrounds1.map((thisBackground, index) => (
                                <BackgroundSelection key={index} onMouseEnter={() => tellMeMore(thisBackground)} onMouseLeave={tellMeNothing} selected={(newChar.background.first === thisBackground)} onClick={() => setNewChar({...newChar, background: {...newChar.background, first: thisBackground}})}>{thisBackground}</BackgroundSelection>
                            ))}
                        </BackgroundContainer>
                        <BackgroundExplanation goTime={step === 1}>
                            {backgroundDescription}
                        </BackgroundExplanation>
                    </ExpositionText>

                    <ExpositionText goTime={step >= 3}>
                        As you grew older, you faced conflict, oh no! But you got by as a 
                        {newChar.background.second.length > 0 ? ` ${newChar.background.second}` : '...'}.
                        <ContinueExpositionButton buttonVisible={step === 3} onClick={e => progressCreationProcess(e)}>...</ContinueExpositionButton>
                        {step >= 4 && 
                            <ExpositionSnippet>{` ${backgroundsText[newChar.background.second]}`}</ExpositionSnippet>
                        }
                        <BackgroundContainer goTime={step === 3}>
                            {backgrounds2.map((thisBackground, index) => (
                                <BackgroundSelection key={index} onMouseEnter={() => tellMeMore(thisBackground)} onMouseLeave={tellMeNothing} selected={(newChar.background.second === thisBackground)} onClick={() => setNewChar({...newChar, background: {...newChar.background, second: thisBackground}})}>{thisBackground}</BackgroundSelection>
                            ))}
                        </BackgroundContainer>
                        <BackgroundExplanation goTime={step === 3}>
                            {backgroundDescription}
                        </BackgroundExplanation>
                    </ExpositionText>                    
                    



                    <ExpositionText goTime={step === 5}>
                        <PWInput type='text' placeholder={`(password)`} minLength={4} value={newChar.password} onChange={e => parsePasswordInput(e.target.value)}></PWInput>
                        <CreateCharacterButton>Create Character!</CreateCharacterButton>
                    </ExpositionText>


                </CreateCharacterForm>
            </CreateCharacterPage>
        )}
        </>
    )
}

export default CreateCharacterScreen;

/*

    LAYOUT IDEA: Name, ID, Class at the top, pick it all, have it described in text, PASSWORD at the bottom to submit when it's all ready!

    Did some testing and this ONLY appears when you're in the "/" path. Interesting!
    ... all the other compnents just mount on up regardless of whatever nonsense path I put. Whoops? Maybe not whoops? We'll see.. :P
    ... that DOES open up the interesting option to have the characterName be present in the URL, though obviously we can't require that config.

    We can have some other app-wide component check to see if we're in the proper URL and push us around if not?

*/