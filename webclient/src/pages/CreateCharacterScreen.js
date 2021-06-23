import React, { useContext, useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import { Context, actions } from '../context/context';
import { CreateCharacterPage, ChoiceBox, ChoiceButton, CreateCharacterForm, CreateCharacterButton, Title, ExpositionText, CharacterNameInput, PWInput, BackgroundContainer, BackgroundSelection, BackgroundExplanation, ContinueExpositionButton, ExpositionSnippet } from '../components/styled';



const backgrounds1 = ['Gatherer', 'Laborer', 'Healer'];
const backgrounds2 = ['Mercenary', 'Hedgewizard', 'Thief'];
const backgrounds3 = ['Trader', 'Scribe', 'Runner', 'Apprentice'];
const backgroundsText = {
    'Gatherer': `You went out into the wilderness to hunt and forage for food and supplies, and to this day you still keep your trusty outdoors knife at hand.`,
    'Laborer': `You helped build, repair, dig, and tend to the difficult manual labor that kept everything intact.`,
    'Healer': `You studied herbs and medicines, healing the wounded and sick.`,
    'Mercenary': `You got good at staying alive in a scrap, and offering your strong arms and stronger attitude to the right interests.`,
    'Hedgewizard': `You learned that there was no problem that ultimately couldn't be solved by throwing more MP at it.`,
    'Thief': `You learned that you almost nobody remained a threat with an empty purse, a broken reputation, and maybe occasionally a knife to their throat.`,
    'Scribe': `Nerdy!`,
    'Trader': `Wealthy?`,
    'Runner': `Sweaty...`,
    'Apprentice': `Busy!`
};

/*
    OK! Time to execute the Alpha character creation.
    We'll use the scaffolding here to help out.

    Make it a little more interesting, presenting choices that then inform character's attributes and strengths.

    I'd also like to have 'wide' options that you scroll through up/down.
    -- make use of whatDo === character_creation

    CURRENT SKILLS: fighting, gathering, crafting, sneaking, spellcasting, sensing, medicine
    Also, STATS. Stat seed!
    And SWAG. Starting gear!

    ... oh, it'd be really cool if there was a 'window' image in the top of what's being described...
    ... as well as 'seeing' the stat/skill growth as choices are made. A bit of a mini-project, but probably worth.

    We can either store an array of sequential keywords OR an object with each part named with its keyword saved alongside.


    

    PART ONE (NEWCHAR.BACKSTORY.FIRSTPART and NEWCHAR.BACKSTORY.SECONDPART)
    You are ____, a wayfarer on the road to the well-known town of trade and travel called Rivercrossing. As the walls gradually rise into view, you reflect on the
        path that has led you here, and your mind wanders back to your hometown. (...)

    
    [ You were born in a quiet, peaceful place. Growing up there was simple, and your life was stable so long a you plied a trade. ]
    -> (+gathering, crafting)
    -> In your youth, you were taught to skin game, forage for supplies, and create simple goods for day-to-day life.
        [ It was a joyful time, and you lived well by working hard and relaxing with simple pleasures alongside the members of your community. ]
        -> (+constitution, spirit)
        -> However, the land came to yield less and less. You watched the families around you gradually become fewer with every season, until you, too,
            were forced to leave, taking only a handful of essential reminders of the seeds of your old life as you sought anew to make a living.
            
        [ You hated it. It was beyond dull, much like the wits of most of the people around you. ]
        -> (+intelligence, willpower)
        -> As you watched the community elders manage to bring the land to the edge of infertility and ruin, you were only too grateful to leave that life behind.
            Bringing only what useful gear you could wear or carry along with you, you took off. Those that were left behind could fend for themselves.

    
    [ You grew up in a battle-torn remote border community where the machinations of both men and monsters posed constant existential threats. ]
    -> (+fighting, +medicine)
    -> You were forced to quickly learn at a young age how to protect yourself in a fight and treat a wide array of injuries and afflictions to survive.
        [ It was tough but you chose to be even tougher, embracing this conflict-filled life by building a strong mind and body. ]
        -> (+strength, willpower, Mercenary background)
        -> In time, your demeanor and competence were noted by a mercenary on their way through the area. They offered you the means to turn your skills 
            into a life of self-direction. It certainly wasn't a worse outlook than staying here, and so you took to the open roads.

        [ You avoided and outmaneuvered the worst of the turmoil around you, learning to defang problems before they struck. ]
        -> (+agility, intelligence, some disarming/avoiding techs)
        -> One eerily silent night, you found the opportunity to leave without attracting undue negative attention, and you moved swiftly with nothing on you 
            but a pack stuffed hastily with the merest necessities. Come daybreak, your old life was buried under the horizon behind you.
    
    [ You came up in a small roving collective of traveling con artists, wandering between towns making an exciting but morally ambiguous living. ]
    -> (+sneaking, sensing, Pickpocket tech)
    -> Even as a child you found that sharp eyes, quick hands, and quiet feet were oft rewarded, and where those failed, a nimble wit and clever tongue could make do.
        [ You embraced the freedoms offered by your physical and moral flexibility, accepting unintentional donations from almost everyone you met. ]
        -> (+money, Thief perk, )
        -> Your merry band of ne'er-do-wells managed to do quite well for themselves until you ran afoul of a perceptive, humorless, and unfortunately extremely 
            vindictive magistrate. By a hair's margin, you alone return to the open road... at a rather rapid pace, toward anywhere new.

        [ The lifestyle didn't quite fit you right, however, and you instead did your best to apply your dubious skillset to benevolent purposes. ]
        -> (+??)
        -> Despite your band's seeming unlimited good fortune, a small voice in your head urgently warned you that this fortune was due for a sudden and
            violent shift. Your warnings unheeded, you employed a trusted contact to spirit you to the safety of the open road under a fresh identity.


    PART TWO (NEWCHAR.BACKSTORY.THIRDPART)
    You traveled for weeks, following road and river through sprawling countryside. At first, you passed a good number of assorted villages, farms, and the odd town 
        here and there. Your path was never long without at least an errant horseman, trader, or some flavor of wayfarer passing by. The journey is long, but eased by 
        the comforts of companionship and civilization.
    
    One day, you woke to a still world -- no birdsong to greet the morning, no other travelers, a dim sun illuminating a desolate horizon. You couldn't remember which road 
        led you here or which path you intended to take. You noticed an unusual hut, smoke rising from one side, the striking exception to the empty world. You don't 
        recall making the choice to approach it before finding yourself standing before it as an unusual figure turned to regard you.
    [ You stood before a neatly-trimmed dark skinned man wearing an impeccably tailored wizard's outfit. ]
    -> His gaze flickered across you once, up and down, and then he motioned for you to take a seat on the other side of a small fire before disappearing into the hut. 
        You found yourself gazing into the flames, which danced merrily on their own without any fuel, twisting almost playfully in the dirt. The well-dressed man 
        suddenly appeared at your side and wordlessly offered you a large book, which fell open in your hands as you accepted it.
        [ magic1 ]

        [ magic2 ]

        [ magic3 ]

    [ You were staring at a lithe huntress, her expression unreadable beneath layers of dark paint. ]
    -> She silently disappears into the hut and emerges moments later wearing a rugged pack. She snaps and motions for you to follow her. 
        [ combat1 ]

        [ combat2 ]

        [ combat3 ]

    [ You beheld a shockingly slender, bespectacled man with unexpectedly rugged hands wearing a craftsman's apron. ]
    -> He is KINDLY.
        [ craft1 ]
        
        [ craft2 ]

        [ craft3 ]


    PART THREE (RiverCrossing hoooooo)
    

*/

const CreateCharacterScreen = () => {
    const [state, dispatch] = useContext(Context);
    const [step, setStep] = useState(0);
    const [newChar, setNewChar] = useState({
        name: '',
        password: '',
        age: 20,
        feature: {eyes: '', hair: '', height: '', complexion: '', build: ''},
        background: {first: '', second: '', third: ''},
        backstory: {}
    });
    const [backgroundDescription, setBackgroundDescription] = useState('(mouse over to view more details about each background)');
    const [userCredentials, setUserCredentials] = useState({charName: '', password: ''});
    const history = useHistory();
    const stepIndexMax = [0, 2];

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
            case 5: {
                if (newChar.background.third.length > 0) {
                    setStep(6);
                    setTimeout(() => {
                        setStep(7);
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

    function advancePrologue(e) {
        e.preventDefault();

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
            case 5: {
                if (newChar.background.third.length > 0) {
                    setStep(6);
                    setTimeout(() => {
                        setStep(7);
                    }, 2500);
                }
                break;
            }        
        }
        
        
    }

    useEffect(() => {
        // HERE: gotta bound the up/down selections on each choicebox situation
        // stepIndexMax array defined with max viewIndex in each situation
        if (state.viewIndex > stepIndexMax[step]) return dispatch({type: actions.UPDATE_VIEW_INDEX, payload: stepIndexMax[step]});
        if (state.viewIndex < 0) return;
    }, [state.viewIndex]);

    return (
        <>
        {state.characterName ? (<></>) : (
            <CreateCharacterPage>
                <CreateCharacterForm onSubmit={e => progressCreationProcess(e)}>
                    <Title>Character Creation {newChar.name ? `- ${newChar.name}'s Story` : ``}</Title>
                    <ExpositionText goTime={step >= 0}>
                        You are 
                        {/* Consider: disable this input when step > 0 */}
                        <CharacterNameInput autoFocus={true} minLength={5} maxLength={10} type='text' placeholder={`(name)`} value={newChar.name} onChange={e => parseCharNameInput(e.target.value)}></CharacterNameInput>
                        , a wayfarer on the road to the well-known town of trade and travel called Rivercrossing. As the walls gradually rise into view, you reflect on the
                        path that has led you here, and your mind wanders back to your hometown.
                        <ContinueExpositionButton buttonVisible={step === 0} onClick={e => progressCreationProcess(e)}>...</ContinueExpositionButton>
                    </ExpositionText>

                    {/* <ExpositionText goTime={step >= 0}>
                        You are {newChar.name}
                        , a wayfarer on the road to the well-known town of trade and travel called Rivercrossing. As the walls gradually rise into view, you reflect on the
                        path that has led you here, and your mind wanders back to your hometown.
                        <ContinueExpositionButton buttonVisible={step === 0} onClick={e => progressCreationProcess(e)}>...</ContinueExpositionButton>
                    </ExpositionText> */}

                    {/* Need onClick to fire a handler function; 'Enter' key should do the same thing */}
                    {/* Change hover behavior to fire a fxn that sets viewIndex */}
                    <ChoiceBox goTime={step >= 1}>
                        <ChoiceButton viewed={state.viewIndex === 0} onClick={e => e} >You were born in a quiet, peaceful place. Growing up there was simple, and your life was stable so long a you plied a trade.</ChoiceButton>
                        <ChoiceButton viewed={state.viewIndex === 1}  >You grew up in a battle-torn remote border community where the machinations of both men and monsters posed constant existential threats.</ChoiceButton>
                        <ChoiceButton viewed={state.viewIndex === 2}  >You came up in a small roving collective of traveling con artists, wandering between towns making an exciting but morally ambiguous living.</ChoiceButton>
                    </ChoiceBox>

                    {/* <ExpositionText goTime={step >= 1}>
                        
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
                    </ExpositionText> */}

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

                    <ExpositionText goTime={step >= 5}>
                        Then you made it to the Big Town. Time to get a respectable profession! Naturally, you earned your keep as a 
                        {newChar.background.third.length > 0 ? ` ${newChar.background.third}` : '...'}.
                        <ContinueExpositionButton buttonVisible={step === 5} onClick={e => progressCreationProcess(e)}>...</ContinueExpositionButton>
                        {step >= 6 && 
                            <ExpositionSnippet>{` ${backgroundsText[newChar.background.third]}`}</ExpositionSnippet>
                        }
                        <BackgroundContainer goTime={step === 5}>
                            {backgrounds3.map((thisBackground, index) => (
                                <BackgroundSelection key={index} onMouseEnter={() => tellMeMore(thisBackground)} onMouseLeave={tellMeNothing} selected={(newChar.background.third === thisBackground)} onClick={() => setNewChar({...newChar, background: {...newChar.background, third: thisBackground}})}>{thisBackground}</BackgroundSelection>
                            ))}
                        </BackgroundContainer>
                        <BackgroundExplanation goTime={step === 5}>
                            {backgroundDescription}
                        </BackgroundExplanation>
                    </ExpositionText>                                       
                    



                    <ExpositionText goTime={step >= 7}>
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