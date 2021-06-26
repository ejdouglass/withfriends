import React, { useContext, useState, useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import { Context, actions } from '../context/context';
import { CreateCharacterPage, ChoiceBox, ChoiceButton, CreateCharacterForm, PrologueProgressPrompt, Title, ExpositionText, CharacterNameInput, PWInput, BackgroundContainer, BackgroundSelection, BackgroundExplanation, ContinueExpositionButton, ExpositionSnippet } from '../components/styled';



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

const dependentExposition = {
    'caster': `You, too, proved naturally adept at weaving simple spells from a young age, and life was a gentle affair, living communally with the magic of the land.`,
    'fighter': `You were forced to quickly learn at a young age how to protect yourself in a fight and treat a wide array of injuries and afflictions to survive.`,
    'thief': `Even as a child you found that sharp eyes, quick hands, and quiet feet were oft rewarded, and where those failed, a nimble wit and clever tongue could make do.`,
    'casteraccept': `However, the land came to yield less and less. You watched the families around you gradually become fewer with every season, until you, too, were forced to leave, taking only a handful of essential reminders of the seeds of your old life as you sought anew to make a living.`,
    'casterreject': `As you watched the community elders manage to bring the land to the edge of infertility and ruin, you were only too grateful to leave that life behind. Bringing only what useful gear you could wear or carry along with you, you took off. Those that were left behind could fend for themselves.`,
    'fighteraccept': `In time, your demeanor and competence were noted by a mercenary on their way through the area. They offered you the means to turn your skills into a life of self-direction. It certainly wasn't a worse outlook than staying here, and so you took to the open roads.`,
    'fighterreject': `One eerily silent night, you found the opportunity to leave without attracting undue negative attention, and you moved swiftly with nothing on you but a pack stuffed hastily with the merest necessities. Come daybreak, your old life was buried under the horizon behind you.`,
    'thiefaccept': `Your merry band of ne'er-do-wells managed to do quite well for themselves until you ran afoul of a perceptive, humorless, and unfortunately extremely vindictive magistrate. By a hair's margin, you alone returned to the open road, at a rather rapid pace, toward anywhere new.`,
    'thiefreject': `Despite your band's seeming unlimited good fortune, a small voice in your head urgently warned you that this fortune was due for a sudden and violent shift. Your warnings unheeded, you employed a trusted contact to spirit you to the safety of the open road under a fresh identity.`
}

const dependentChoice = {
    'caster': [`It was a joyful time, and you lived well by working hard and relaxing with simple pleasures alongside the members of your community.`, `You hated it. Your gifts were clearly beyond your peers, and your desire to move beyond the confines of these simple people and their simple magic chafed at every turn.`],
    'fighter': [`It was tough but you chose to be even tougher, embracing this conflict-filled life by building a strong mind and body.`, `You avoided and outmaneuvered the worst of the turmoil around you, learning to defang problems before they struck.`],
    'thief': [`You embraced the freedoms offered by your physical and moral flexibility, accepting unintentional donations from almost everyone you met.`, `The lifestyle didn't quite fit you right, however, and you instead did your best to apply your dubious skillset to benevolent purposes.`],
    'sorcerer': [`FIREMAGIC!`],
    'huntress': [],
    'artisan': []
}

/*

    ... ok, rethinking, because this is a bit much.
    The character you meet is based on the choices you made earlier. Cool? Cool. They're a 'mirror' of your choices.
    That character can then drift you ATTACK or DEFENSE. 
    We have six options. You get your accessory here? And your 'main' perks/techs.

    CASTER-ACCEPT: `You stood before a neatly-trimmed dark-skinned man wearing impeccably tailored robes of blue and white, a simple mahogany magus's staff resting in one hand.`
        YANG: buffs, some attack, mostly ST = __ -- ``
        YIN: defensive, debuff, restoration heavy = __  -- ``
    CASTER-REJECT: `You stood before a wild-haired dark-skinned man wearing gold-threaded robes of red and black, an ornage golden sorcerer's staff grasped in one hand.`
        YANG: pure explosive madness, AoE, DPS heavy = __  -- ``
        YIN: misdirection, illusion, control = __  -- ``
    FIGHTER-ACCEPT: `You were staring at a massive monolith of a man, scars like country roads wandering his body. Aside from scraps of leather and bone, his only apparel seemed to be the small arsenal of weapons strapped to him.`
        YANG: melee damage, AoE/barrage, burst/finisher w/stance debuffs = __  -- 
        YIN: 'voke, heavy armor spec, counter = __  -- 
    FIGHTER-REJECT: `You were staring at a lithe man with a hawk-like countenance. He wore form-fitting armor from head to toe, his only other adornment a pair of blades, one long across his back, one short at his hip.`
        YANG: melee damage, ST, sustained DPS w/ debuffs = __   -- 
        YIN: evade, light armor spec, stance mastery, ATK/ACC debuffs = __  -- 
    THIEF-ACCEPT: `You beheld a pale man dressed in flashy clothing, jewels at every turn, ___. His merry eyes met yours with a bright and inviting smile.`
        YANG: mug-master, force of personality, crits, wealth boost = __  -- 
        YIN: stalk/sneak-master, misdirection, chaos, wealth boost2 = __  -- 
    THIEF-REJECT: `You beheld a slim man garbed in simple clothing, unassumingly accented with a few traveler's pouches. His steady gaze met yours with a sincere smile.`
        YANG: steal and share buffs, twist of fate, frugality = __  -- 
        YIN: hide & steal mastery, undermine, frugality2 = __  -- 
*/


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
    -> (+spellcasting, gathering)
    -> In your youth, you were taught to skin game, forage for supplies, and create simple goods for day-to-day life.
        [ It was a joyful time, and you lived well by working hard and relaxing with simple pleasures alongside the members of your community. ]
        -> (+constitution, spirit)
        -> However, the land came to yield less and less. You watched the families around you gradually become fewer with every season, until you, too, were forced to leave, taking only a handful of essential reminders of the seeds of your old life as you sought anew to make a living.
            
        [ You hated it. It was beyond dull, much like the wits of most of the people around you. ]
        -> (+intelligence, willpower)
        -> As you watched the community elders manage to bring the land to the edge of infertility and ruin, you were only too grateful to leave that life behind. Bringing only what useful gear you could wear or carry along with you, you took off. Those that were left behind could fend for themselves.

    
    [ You grew up in a battle-torn remote border community where the machinations of both men and monsters posed constant existential threats. ]
    -> (+fighting, +medicine)
    -> You were forced to quickly learn at a young age how to protect yourself in a fight and treat a wide array of injuries and afflictions to survive.
        [ It was tough but you chose to be even tougher, embracing this conflict-filled life by building a strong mind and body. ]
        -> (+strength, willpower, Mercenary background)
        -> In time, your demeanor and competence were noted by a mercenary on their way through the area. They offered you the means to turn your skills into a life of self-direction. It certainly wasn't a worse outlook than staying here, and so you took to the open roads.

        [ You avoided and outmaneuvered the worst of the turmoil around you, learning to defang problems before they struck. ]
        -> (+agility, intelligence, some disarming/avoiding techs)
        -> One eerily silent night, you found the opportunity to leave without attracting undue negative attention, and you moved swiftly with nothing on you but a pack stuffed hastily with the merest necessities. Come daybreak, your old life was buried under the horizon behind you.
    
    [ You came up in a small roving collective of traveling con artists, wandering between towns making an exciting but morally ambiguous living. ]
    -> (+sneaking, sensing, Pickpocket tech)
    -> Even as a child you found that sharp eyes, quick hands, and quiet feet were oft rewarded, and where those failed, a nimble wit and clever tongue could make do.
        [ You embraced the freedoms offered by your physical and moral flexibility, accepting unintentional donations from almost everyone you met. ]
        -> (+money, Thief perk, )
        -> Your merry band of ne'er-do-wells managed to do quite well for themselves until you ran afoul of a perceptive, humorless, and unfortunately extremely vindictive magistrate. By a hair's margin, you alone return to the open road... at a rather rapid pace, toward anywhere new.

        [ The lifestyle didn't quite fit you right, however, and you instead did your best to apply your dubious skillset to benevolent purposes. ]
        -> (+??)
        -> Despite your band's seeming unlimited good fortune, a small voice in your head urgently warned you that this fortune was due for a sudden and violent shift. Your warnings unheeded, you employed a trusted contact to spirit you to the safety of the open road under a fresh identity.


    PART TWO (NEWCHAR.BACKSTORY.THIRDPART)
    You traveled for weeks, following road and river through sprawling countryside. At first, you passed a good number of assorted villages, farms, and the odd town here and there. Your path was never long without at least an errant horseman, trader, or some flavor of wayfarer passing by. The journey is long, but eased by the comforts of companionship and civilization.
    
    One day, you woke to a still world -- no birdsong to greet the morning, no other travelers, a dim sun illuminating a desolate horizon. You couldn't remember which road led you here or which path you intended to take. You noticed an unusual hut, smoke rising from one side, the striking exception to the empty world. You don't recall making the choice to approach it before finding yourself standing before it as an unusual figure turned to regard you.

    [ You stood before a neatly-trimmed dark skinned man wearing an impeccably tailored wizard's outfit. ]
    -> His gaze flickered across you once, up and down, and then he motioned for you to take a seat on the other side of a small fire before disappearing into the hut. You found yourself gazing into the flames, which danced merrily on their own without any fuel, twisting almost playfully in the dirt. The well-dressed man suddenly appeared at your side and wordlessly offered you a large book, which fell open in your hands as you accepted it.
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
    const history = useHistory();
    const stepIndexMax = [0, 2, 0, 1, 0, 0, 0, 2, 2];

    function parseCharNameInput(nameString) {
        // Capitalizes the character name and prevents spaces as user types
        if (nameString.length > 0) nameString = nameString[0].toUpperCase() + nameString.slice(1);
        nameString = nameString.split(' ').join('');
        setNewChar({...newChar, name: nameString});
    }

    // function parsePasswordInput(pwString) {
    //     pwString = pwString.split(' ').join('');
    //     setNewChar({...newChar, password: pwString});
    // }

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
        if (e) e.preventDefault();
        // if (stepIndexMax[step] === 0) {
        //     console.log(`Your current step #${step} is dialogue-only. Beepity.`);
        //     setStep(step + 1);
        //     return dispatch({type: actions.UPDATE_VIEW_INDEX});
        // }
        const selectedIndex = state.viewIndex < 0 ? (state.viewIndex * -1) - 1 : state.viewIndex;


        // We'll set up stats down below, as well, as we go
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
                if (selectedIndex === 0) setNewChar({...newChar, backstory: {first: 'caster'}});
                if (selectedIndex === 1) setNewChar({...newChar, backstory: {first: 'fighter'}});
                if (selectedIndex === 2) setNewChar({...newChar, backstory: {first: 'thief'}});
                setStep(2);
                break;
            }
            case 3: {
                if (selectedIndex === 0) setNewChar({...newChar, backstory: {...newChar.backstory, second: 'accept'}});
                if (selectedIndex === 1) setNewChar({...newChar, backstory: {...newChar.backstory, second: 'reject'}});
                setStep(4);
                break;
            }
            case 7: {
                if (selectedIndex === 0) setNewChar({...newChar, backstory: {...newChar.backstory, third: 'sorcerer'}});
                if (selectedIndex === 1) setNewChar({...newChar, backstory: {...newChar.backstory, third: 'huntress'}});
                if (selectedIndex === 2) setNewChar({...newChar, backstory: {...newChar.backstory, third: 'artisan'}});
                setStep(8);
                break;
            }
            case 9: {
                // Three choices: power, control, ???
                break;
            }
            default: {
                setStep(step + 1);
            }
        }
        
        dispatch({type: actions.UPDATE_VIEW_INDEX});
        
    }

    function updateViewIndex(index) {
        return dispatch({type: actions.UPDATE_VIEW_INDEX, payload: index});
    }

    useEffect(() => {
        // HERE: gotta bound the up/down selections on each choicebox situation
        // stepIndexMax array defined with max viewIndex in each situation
        if (state.viewIndex > stepIndexMax[step] && stepIndexMax[step] !== 0) return dispatch({type: actions.UPDATE_VIEW_INDEX, payload: stepIndexMax[step]});
        if (state.viewIndex < 0) {
            return advancePrologue();
        }
    }, [state.viewIndex]);

    // ADD: image box; stat/skill grid; user-directed text-advancement
    return (
        <>
        {state.characterName ? (<></>) : (
            <CreateCharacterPage>
                <CreateCharacterForm>
                    <Title>Character Creation {newChar.name ? `- ${newChar.name}'s Prologue` : ``}</Title>
                    <ExpositionText goTime={step >= 0} stepBack={step > 0}>
                        You are 
                        {/* Blur when step !== 0 */}
                        <CharacterNameInput autoFocus={step === 0} minLength={5} maxLength={10} type='text' placeholder={`(name)`} value={newChar.name} onChange={e => parseCharNameInput(e.target.value)}></CharacterNameInput>
                        , a wayfarer on the road to the well-known town of trade and travel called Rivercrossing. As its high walls slowly rise above the horizon, you reflect on the
                        path that has led you here, and your mind wanders back to your hometown.
                        <PrologueProgressPrompt type='button' isVisible={step === 0 && newChar.name.length >= 5} onClick={e => advancePrologue(e)}>continue</PrologueProgressPrompt>
                    </ExpositionText>



                    <ChoiceBox goTime={step === 1}>
                        <ChoiceButton viewed={state.viewIndex === 0} onClick={e => advancePrologue(e)} onMouseEnter={() => updateViewIndex(0)} >You were born in a quiet, peaceful place among a small group of natural spellcasters who gently and harmoniously plied the land with their gifts.</ChoiceButton>
                        <ChoiceButton viewed={state.viewIndex === 1} onClick={e => advancePrologue(e)} onMouseEnter={() => updateViewIndex(1)} >You grew up in a battle-torn remote border community where the machinations of both men and monsters posed constant existential threats.</ChoiceButton>
                        <ChoiceButton viewed={state.viewIndex === 2} onClick={e => advancePrologue(e)} onMouseEnter={() => updateViewIndex(2)} >You came up in a small roving collective of traveling con artists, wandering between towns making an exciting but morally ambiguous living.</ChoiceButton>
                    </ChoiceBox>

                    <ExpositionText goTime={step >= 2} stepBack={step > 2}>
                        {newChar.backstory.first === 'caster' && `You were born in a quiet, peaceful place among a small group of natural spellcasters who gently and harmoniously plied the land with their gifts. `}
                        {newChar.backstory.first === 'fighter' && `You grew up in a battle-torn remote border community where the machinations of both men and monsters posed constant existential threats. `}
                        {newChar.backstory.first === 'thief' && `You came up in a small roving collective of traveling con artists, wandering between towns making an exciting but morally ambiguous living. `}
                        {dependentExposition[newChar.backstory.first]}
                        <PrologueProgressPrompt isVisible={step === 2} onClick={e => advancePrologue(e)}>continue</PrologueProgressPrompt>
                    </ExpositionText>

                    <ChoiceBox goTime={step === 3}>
                        {newChar.backstory.first && dependentChoice[newChar.backstory.first].map((choice, index) => (
                            <ChoiceButton key={index} viewed={state.viewIndex === index} onClick={e => advancePrologue(e)} onMouseEnter={() => updateViewIndex(index)} >{choice}</ChoiceButton>
                        ))}
                    </ChoiceBox>

                    {/* <ExpositionText goTime={step >= 3}>
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
                    </ExpositionText>     */}


                    <ExpositionText goTime={step >= 4} stepBack={step > 4}>
                        {(newChar.backstory.first === 'caster' && newChar.backstory.second === 'accept') && `It was a joyful time, and you lived well by working hard and relaxing with simple pleasures alongside the members of your community. `}
                        {(newChar.backstory.first === 'caster' && newChar.backstory.second === 'reject') && `You hated it. Your gifts were clearly beyond your peers, and your desire to move beyond the confines of these simple people and their simple magic chafed at every turn. `}
                        {(newChar.backstory.first === 'fighter' && newChar.backstory.second === 'accept')  && `It was tough but you chose to be even tougher, embracing this conflict-filled life by building a strong mind and body. `}
                        {(newChar.backstory.first === 'fighter' && newChar.backstory.second === 'reject') && `You avoided and outmaneuvered the worst of the turmoil around you, learning to defang problems before they struck. `}
                        {(newChar.backstory.first === 'thief' && newChar.backstory.second === 'accept') && `You embraced the freedoms offered by your physical and moral flexibility, accepting unintentional donations from almost everyone you met. `}
                        {(newChar.backstory.first === 'thief' && newChar.backstory.second === 'reject') && `The lifestyle didn't quite fit you right, however, and you instead did your best to apply your dubious skillset to benevolent purposes. `}
                        {dependentExposition[`${newChar.backstory.first}${newChar.backstory.second}`]}
                        <PrologueProgressPrompt isVisible={step === 4} onClick={e => advancePrologue(e)}>continue</PrologueProgressPrompt>
                    </ExpositionText>

                    <ExpositionText goTime={step >= 5} stepBack={step > 5}>
                        You traveled for weeks, following road and river through sprawling countryside. At first, you passed a good number of assorted villages, farms, and the odd town here and there. Your path was never long without a trading caravan, troupe, or errant wayfarer passing by. The journey was long, but eased by the comforts of companionship and civilization.
                        <PrologueProgressPrompt isVisible={step === 5} onClick={e => advancePrologue(e)}>continue</PrologueProgressPrompt>
                    </ExpositionText>

                    <ExpositionText goTime={step >= 6} stepBack={step > 6}>
                        One day, you woke to a still world -- no birdsong to greet the morning, no other travelers, a dim sun illuminating a desolate horizon. You couldn't remember which road led you here or which path you intended to take. You noticed an unusual hut, smoke rising from one side, a striking exception to an otherwise empty world. You don't recall making the choice to approach it, yet the next memory you recall is of your standing next to a small roaring fire, near the hut's entrance, as an unusual figure emerged to regard you.
                        <PrologueProgressPrompt isVisible={step === 6} onClick={e => advancePrologue(e)}>continue</PrologueProgressPrompt>
                    </ExpositionText>

                    <ChoiceBox goTime={step === 7} stepBack={step > 7}>
                        <ChoiceButton viewed={state.viewIndex === 0} onClick={e => advancePrologue(e)} onMouseEnter={() => updateViewIndex(0)} >You stood before a neatly-trimmed dark-skinned man wearing an impeccably tailored outfit, an ornate golden sorcerer's staff resting in one hand.</ChoiceButton>
                        <ChoiceButton viewed={state.viewIndex === 1} onClick={e => advancePrologue(e)} onMouseEnter={() => updateViewIndex(1)} >You were staring at a lithe woman clad in makeshift armor of rugged animal hides, her expression unreadable beneath layers of dark paint.</ChoiceButton>
                        <ChoiceButton viewed={state.viewIndex === 2} onClick={e => advancePrologue(e)} onMouseEnter={() => updateViewIndex(2)} >You beheld a shockingly slender, bespectacled man wearing a craftsman's apron, his hands unexpectedly rugged. His eyes met yours with a warm smile.</ChoiceButton>                     
                    </ChoiceBox>

                    <ExpositionText goTime={step >= 8} stepBack={step > 8}>
                        {newChar.backstory.third === 'sorcerer' && `You stood before a neatly-trimmed dark-skinned man wearing an impeccably tailored outfit, an ornate golden sorcerer's staff resting in one hand. His gaze flickered across you once, up and down, and then he motioned for you to take a seat on the other side of a small fire before disappearing into the hut. You found yourself gazing into the flames, which danced merrily on their own without any fuel, twisting almost playfully in the dirt. The well-dressed man suddenly appeared at your side and wordlessly offered you a large book, which fell open in your hands as you accepted it.`}
                        {newChar.backstory.third === 'huntress' && `You were staring at a lithe woman clad in makeshift armor of rugged animal hides, her expression unreadable beneath layers of dark paint. She silently disappeared into the hut and emerged moments later carrying a rough leather sack, which she tossed unceremoniously at your feet, causing it to fall open.`}
                        {newChar.backstory.third === 'artisan' && `You beheld a shockingly slender, bespectacled man wearing a craftsman's apron, his hands unexpectedly rugged. His eyes met yours with a warm smile. Struck by a sudden thought and a mischievous smile, he held a finger up to you as he vanished into the hut. An absurd torrent of assorted tools came flying out, one after another. After a pause, one last tool sailed out gracefully, nearly crushing your foot.`}
                    </ExpositionText>

                    <ChoiceBox goTime={step === 9}>
                        {newChar.backstory.third && dependentChoice[newChar.backstory.third].map((choice, index) => (
                            <ChoiceButton key={index} viewed={state.viewIndex === index} onClick={e => advancePrologue(e)} onMouseEnter={() => updateViewIndex(index)} >{choice}</ChoiceButton>
                        ))}                        
                    </ChoiceBox>

                    {/* <ExpositionText goTime={step >= 7}>
                        <PWInput type='text' placeholder={`(password)`} minLength={4} value={newChar.password} onChange={e => parsePasswordInput(e.target.value)}></PWInput>
                        <CreateCharacterButton>Create Character!</CreateCharacterButton>
                    </ExpositionText> */}


                </CreateCharacterForm>
            </CreateCharacterPage>
        )}
        </>
    )
}

export default CreateCharacterScreen;

/*

    IDEA: shrinkytext, separate animation that lowers contrast and size somewhat for non-current texposition


    You stood before a neatly-trimmed dark-skinned man wearing an impeccably tailored outfit, an ornate golden sorcerer's staff resting in one hand.


    You were staring at a lithe woman clad in makeshift armor of rugged animal hides, her expression unreadable beneath layers of dark paint.


    You beheld a shockingly slender, bespectacled man wearing a craftsman's apron, his hands unexpectedly rugged. His eyes met yours with a warm smile.



*/