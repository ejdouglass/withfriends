import React, { useState, useEffect, useContext, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { actions, Context } from '../context/context';
import { LeftMenu, ActionButton, ChatPrompt, Fader, RightMenuLabel, EntityList, RoomName, RoomDetails, RoomImg, RoomDesc, EyeView, RightMenu, TopMenu, StructureContainer, MainScreen, RoomView, CharCard, MainViewContainer, ChatWrapper, ChatInput, ChatSubmit, CharProfileImg, CharProfileName, MyCompassView, CompassArrow, ZoneTitle, MyMapGuy, CurrentFocus, EyeSpyLine, NPCInteractionContainer, EntityGlancer, NPCInteractionOptions, NPCInteractionButton, InventoryContainer, EquippedContainer, EquippedItem, BackpackContainer, BackpackItem, BackpackColumn, InventoryItemDetails, StatusScreenContainer, MagicContainer, StatusScreenTitleContainer, StatusScreenCharacterContainer, StatusScreenHealthContainer, StatusScreenCoreStatsContainer, StatusScreenDerivedStatsContainer, StatusScreenSkillsContainer, HealthItem, CoreStatItem, DerivedStatsRow, DerivedStatItem, SkillItem, CombatScreenContainer, CombatFeedBack, CharCondition, LogoutButton, CharHPMP, CharMPContainer, CharHPContainer, CharHP, CharMP } from './styled';

const MainView = () => {
    const [state, dispatch] = useContext(Context);
    const history = useHistory();

    function logout() {
        localStorage.removeItem('withFriendsJWT');
        dispatch({type: actions.LOGOUT_CHAR});
        history.push('/');
    }

    return (
        <MainScreen>
            <CurrentFocusBox state={state} dispatch={dispatch} />
            <ViewBox state={state} dispatch={dispatch} />
            <MyChar state={state} dispatch={dispatch} />
            <MyMap state={state} />
            <LeftMenuBox state={state} dispatch={dispatch} />
            <RightMenuBox state={state} dispatch={dispatch} />
            <LogoutButton onClick={logout}>Log Out</LogoutButton>
        </MainScreen>
    )
}

export default MainView;


const LeftMenuBox = ({ state, dispatch }) => {
    // What action bar items are we missing? Hm...

    function handleActionSelection(actionName) {
        actionName = actionName.toLowerCase();
        
        dispatch({type: actions.UPDATE_WHATDO, payload: `${actionName}`});
    }

    return (
        <LeftMenu>
            {state.currentActionBar.map((actButton, index) => (
                <ActionButton key={index} viewed={(state.currentBarSelected === 'action' && index === state.viewIndex) ? true : false} selected={state.whatDo === actButton.toLowerCase() ? true : false} onClick={() => handleActionSelection(actButton)}>{actButton}</ActionButton>
            ))}
        </LeftMenu>
    );
}

const RightMenuBox = ({ state, dispatch }) => {
    // Entities! -- NPCs, mobs, players
    // Probably in the order PLAYERS, MOBS, NPCS... but only two sections is fine, NPCs and MOBs are pretty interchangeable
    const [entityList, setEntityList] = useState([]);

    // HM. Might have to do a dispatch in here if we exceed the current list of things on the right side;
    //  that is to say, listen for updates to state.viewIndex, adjust here and modify if it falls out of bounds.
    // That sounds a little sloppy, but for now, if it works, brava!

    useEffect(() => {
        // ...state.location?.room?.mobs, ...state.location?.room?.npcs, ...state.location?.room?.players
        let fullList = [];
        if (state.location?.room?.mobs?.length > 0) fullList = [...state.location.room.mobs];
        if (state.location?.room?.npcs?.length > 0) fullList = [...fullList, ...state.location.room.npcs];
        if (state.location?.room?.players?.length > 0) {
            let playerList = state.location.room.players.filter(playa => playa.name !== state.name);
            fullList = [...fullList, ...playerList];
        }
        setEntityList(fullList);
    }, [state]);
    
    useEffect(() => {
        if (state.currentBarSelected === 'entity' && state.whatDo === 'explore') {
            if (state.viewIndex >= entityList.length) {
                return dispatch({type: actions.UPDATE_VIEW_INDEX, payload: 0});
            }
            if (state.viewIndex < 0) {
                return dispatch({type: actions.UPDATE_VIEW_INDEX, payload: entityList.length - 1});
            }
            return dispatch({type: actions.UPDATE_VIEW_TARGET, payload: {type: entityList[state.viewIndex]?.type, id: entityList[state.viewIndex]?.id, glance: entityList[state.viewIndex]?.glance, description: entityList[state.viewIndex]?.description}});
            
        }
    }, [state.viewIndex, state.currentBarSelected]);

    return (
        <RightMenu>
            <RightMenuLabel>Also Here:</RightMenuLabel>
            <EntityList>
                {entityList.length > 0 ? (
                    <>
                        {entityList.map((entity, index) => (
                            <EntityBox key={index} index={index} type={entity.type} entity={entity} />
                        ))}
                    </>
                ) : (
                    <p>Nobody but yourself.</p>
                )}
                {/* {state.location?.room?.players?.length + state.location?.room?.npcs?.length + state.location?.room?.mobs?.length > 1 ? (
                        <>
                        {state.location?.room?.mobs?.map((mob, index) => (
                            <p key={index} entity={mob} type={'mob'}>{mob.glance}</p>
                        ))}
                        {state.location?.room?.npcs?.map(npc => (
                            <EntityBox key={npc.id} type={'npc'} entity={npc} /> 
                        ))}                    
                        {state.location?.room?.players?.map((player, index) => (
                            <p key={index} entity={player} type={'player'}>{player.name === state.name ? null : player.name}</p>
                        ))}
                        </>
                    ) : (
                        <p>Nobody but you.</p>
                    )
                } */}
            </EntityList>
        </RightMenu>
    );
}

const EntityBox = ({ type, entity, index }) => {
    const [state, dispatch] = useContext(Context);

    function targetEntity(tgEntity) {
        if (state.target?.id !== tgEntity.id) return dispatch({type: actions.TARGET_ENTITY, payload: {targetType: 'view', target: {...tgEntity}}});
        return dispatch({type: actions.TARGET_ENTITY, payload: {}});
    }

    // useEffect(() => {
    //     if (index === state.viewIndex && state.viewTarget?.id !== entity.id) {
    //         dispatch({type: actions.TARGET_ENTITY, payload: {targetType: 'view', target: {...entity}}})
    //     }
    // }, [state]);

    switch (type) {
        case 'mob': {
            return (
                <EntityGlancer mob viewed={(state.viewTarget?.id === entity?.id && state.whatDo === 'explore' && state.currentBarSelected === 'entity') || state.target?.id === entity?.id || (state.currentBarSelected === 'entity' && state.whatDo === 'explore' && state.viewIndex === index)}>{entity?.glance}</EntityGlancer>
            )
        }
        case 'npc': {
            return (
                <EntityGlancer npc viewed={(state.viewTarget?.id === entity?.id && state.whatDo === 'explore' && state.currentBarSelected === 'entity') || state.target?.id === entity?.id || (state.currentBarSelected === 'entity' && state.whatDo === 'explore' && state.viewIndex === index)} onClick={() => targetEntity(entity)}>{entity?.glance}</EntityGlancer>
            )
        }
        case 'player': {
            return (
                <EntityGlancer player viewed={(state.viewTarget?.id === entity?.id && state.whatDo === 'explore' && state.currentBarSelected === 'entity') || state.target?.id === entity?.id || (state.currentBarSelected === 'entity' && state.whatDo === 'explore' && state.viewIndex === index)}>{entity?.name === state.name ? null : entity?.name}</EntityGlancer>
            )
        }
        default: {
            return <EntityGlancer>a spooky entity</EntityGlancer>
        }
    }
}

const TopMenuBox = ({ state, dispatch }) => {

    // Idly pondering setting up multiple states this can hold. It's valuable real estate!
    // Regardless, I want to set up keybinding here. I want to be able to tap the number button while 'Exploring' to interact with a structure.
    // So, how to set that up...

    function handleStructureInteraction(structIndex) {
        return dispatch({type: actions.PACKAGE_FOR_SERVER, payload: {action: 'interact_with_structure', index: structIndex}});
    //     console.log(`You interact with ${structure.name}! Good for you.`);
    //     // For real, though. What happens when you BOOP a structure? What kind of structures we talkin'?
    //     /*
    //         HERE: parse the structure type. We'll do our now-usual split for '/', index 0 will be the core 'type.

    //         TYPES:
    //         -- portal
    //         -- shop
    //         -- crafting
    //     */
    //    switch (structure.type) {
    //        case 'portal': {
    //            // Gotta figure out how this'll parse on the backend. Well, we have scaffolding for it, so let's find out together!
    //            // actions.PACKAGE_FOR_SERVER
    //            // structures can have IDs eventually, replace name with ID at that point
    //            dispatch({type: actions.PACKAGE_FOR_SERVER, payload: {action: 'enter_portal', target: structure.name}})
    //        }
    //    }
    }
    
    return (
        <TopMenu>
            {state.location.room?.structures?.map((structure, index) => (
                <StructureContainer key={index} onClick={() => handleStructureInteraction(index)}>{index + 1} : {structure.name}</StructureContainer>
            ))}
        </TopMenu>
    );
}


const CurrentFocusBox = ({ state, dispatch }) => {
    // const [mode, setMode] = useState({focused: false, type: undefined});
    const [focusObj, setFocusObj] = useState({});
    const [localViewIndex, setLocalViewIndex] = useState(0);
    const [contextualArray, setContextualArray] = useState([]);
    const [combatFeedback, setCombatFeedback] = useState(['You ready yourself for combat!']);

    // function doneFocusing() {
    //     console.log(`Done focusing, probably`);
    //     dispatch({type: actions.UPDATE_WHATDO, payload: 'explore'});
    // }

    function handleInteractionSelection(interaction) {
        console.log(`You wish to ${interaction}? With ${focusObj?.name}?`);
        // Technically, we already have all the stuff from the server for answering any questions. :P
        // May be moving to a more server-interactive version; stand by
        switch (interaction.toLowerCase()) {
            case 'talk': {
                let newTalkIndex = focusObj.lastTalkIndex;
                let talkObj = focusObj.interactions['Talk'];
                if (newTalkIndex < 0 || (talkObj[newTalkIndex + 1] === undefined)) newTalkIndex = 0;
                return setFocusObj({...focusObj, lastTalkIndex: newTalkIndex + 1, echo: `${focusObj?.name}: "${focusObj.interactions['Talk'][newTalkIndex]}"`});
            }
            case 'ask': {
                setFocusObj({...focusObj, echo: `${focusObj?.name}: "${focusObj.interactions['Ask'].prompt}"`, depth: 1});
                let askMenu = [...Object.keys(focusObj.interactions['Ask'])];
                delete askMenu.prompt;
                return setContextualArray(['Back', ...askMenu]);
            }
            case 'buy': {
                return;
            }
            case 'sell': {
                return;
            }
            case 'leave': {
                setFocusObj({});
                return dispatch({type: actions.RESET_VIEW});
            }
        }
    }

    // useEffect(() => {
    //     let amIFocused = state.whatDo.split('/');
    //     if (amIFocused[0] === 'focus') {
    //         console.log(`Focusing on ${amIFocused[1]} now.`);
    //         return setMode({focused: true, type: amIFocused[1]});
    //     }
    //     return setMode({focused: false, type: undefined});
    // }, [state.whatDo]);

    useEffect(() => {
        if (state.received) {
            // ... hm, do I really want/need the back-and-forth to do separate server calls? Maybe not.
            // Ok, since we get the whole NPC and its interactions when we fire up the interaction, why not make use of that?
            // And just navigate through that in this component, passing to the server only for specific instances

            // Either way! Let's finish this up: 
            // How to handle the built-in 'Back' button, navigating through 'layers' of interaction and setting up an appropriate view

            // Likely beyond the scope of this useEffect hook, but it does involve trimming off NPCRESPONSE.
            
            // aha! here's where the magic happens... so! we can have state.received.type === 'npcresponse' and update the interactionArray?
            if (state.received.type === 'npcdata') {
                // so focusObj is essentially the entire NPC right now, and we can keep it always inclusive of interactions at minimum
                // given that, it has the entire interactions tree in there, and this section does a good job laying out the basics for us to 'consume'
                // so this is fine for the FIRST/initial layer of all NPC interactions
                // useEffect would be fine to trigger on "choices" made to drill down or send to server, if applicable
                setFocusObj({...state.received.data, lastTalkIndex: -1, echo: `${state.received.data.interactions['Talk'].prompt.echo}`});
                // Hm, it might be better to redo this to JUST be the keys.  
                dispatch({type: actions.UPDATE_SELECTED_BAR, payload: 'npcbase'});
            }

            if (state.received.type === 'npcresponse') {
                // dispatch({type: actions.UPDATE_VIEW_INDEX, payload: 0}); // conditional; may refactor later, but easy way to reset to 'first option'
                console.log(`NPC RESPONSE DATA RECEIVED: ${JSON.stringify(state.received.data)}`)
                let newInteractionArray = ['Back', ...Object.keys(state.received?.data)];
                setContextualArray(newInteractionArray);
                // Neat! The above "works"... in a very limited way. :P 
            }

            if (state.received?.type === 'combatinit') {
                dispatch({type: actions.START_COMBAT, payload: state.received.fightingObj});
            }

            if (state.received?.type === 'combat_msg') {
                // console.log(`You receive this data about your current battle: ${state.received?.echo}.`);
                setCombatFeedback([...combatFeedback, state.received?.echo]);
            }
        }
    }, [state.received]);

    useEffect(() => {
        if (contextualArray.length > 0)
        {
            let correctedIndex = state.viewIndex;
            if (state.viewIndex < 0) correctedIndex = 0;
            if (state.viewIndex > contextualArray.length - 1) correctedIndex = contextualArray.length - 1;
            setLocalViewIndex(correctedIndex);
            // HERE: dispatch new viewTarget; contents: {type: '', id: thingToDo} ... so how to set ID in a way that hits the right result?
            //  I guess ID can be an object, such as {menu: 'Talk', target: index#} or {menu: 'Ask', target: 'keyvalue'}
                //  for latter, if keyvalue === 'prompt', should receive submenu data as well as the prompt text, yes?
            dispatch({type: actions.UPDATE_VIEW_TARGET, payload: {type: 'npcinteraction', target: state.target.id, id: 0, menu: contextualArray[correctedIndex], submenu: 'prompt'}});
        }

    }, [state.viewIndex]);

    useEffect(() => {
        // Just a hacky way to avoid an error during inventory -- forgot that I have this all set up for NPCINTERACT and nothing else :P
        // Refactor later to properly handle different modes that go here
        if (state.whatDo !== 'npcinteract') return;

        // THIS: rig it up to respond to choices made by user and drill down in menus; scoot contextualarray definition down here
        // Can use state.currentBarSelected for this? MEBBE.
        // Ok! This might work just fine if VIEW_TARGET is updated with something that can let us change currentBarSelected to 'npcmenu/Ask' or somesuch
        if (state.currentBarSelected === 'npcbase') {
            let interactionArray = ['Leave', ...Object.keys(focusObj.interactions)];
            setContextualArray(interactionArray);
            return dispatch({type: actions.UPDATE_VIEW_TARGET, payload: {type: 'npcinteraction', target: state.target.id, id: 0, menu: interactionArray[localViewIndex], submenu: 'prompt'}});
        }
        let npcMode = state.currentBarSelected.split('/');
        if (npcMode[1] === undefined || npcMode[1] === 'refresh') return;

        if (npcMode[1] === 'Talk') {
            let newTalkIndex = focusObj.lastTalkIndex;
            let talkObj = focusObj.interactions['Talk'];
            if (newTalkIndex < 0 || (talkObj[newTalkIndex] === undefined)) newTalkIndex = 0;
            setFocusObj({...focusObj, lastTalkIndex: newTalkIndex + 1, echo: `${focusObj?.name}: "${focusObj.interactions['Talk'][newTalkIndex].echo}"`});
            return dispatch({type: actions.UPDATE_SELECTED_BAR, payload: 'npcmenu/refresh'});
        }

        // Random thought: if META changes to something in particular, can we have an effect scoop it up and package it for server? Mmmmmaybe...
        // That might be a 'better' way to handle a lot of the spaghetti that's fallen around here, but for now we can still reasonably build off this base.

        // Just grabbing the specific mode here, but can add extra 'npcmenu' check from npcMode[0] if found to be necessary later
        switch (npcMode[1]) {
            case 'Back': {
                setFocusObj({...focusObj, echo: `${focusObj.interactions['Talk'].prompt.echo}`, meta: 'Main'});
                setContextualArray(['Leave', ...Object.keys(focusObj.interactions)]);
                dispatch({type: actions.UPDATE_VIEW_TARGET, payload: {type: 'npcinteraction', target: state.target.id, id: 0, menu: 'Leave', submenu: 'prompt'}});
                return dispatch({type: actions.UPDATE_VIEW_INDEX, payload: 0});
            }
            case 'Ask':
            case 'Buy':
            case 'Sell':
            case 'Train':
            case 'Study': 
                setFocusObj({...focusObj, echo: `${focusObj?.name}: "${focusObj?.interactions[npcMode[1]]?.prompt?.echo}"`, meta: npcMode[1]});
                let newMenu = {...focusObj.interactions[npcMode[1]]};
                delete newMenu.prompt;
                newMenu = [...Object.keys(newMenu)];
                setContextualArray(['Back', ...newMenu]);
                dispatch({type: actions.UPDATE_VIEW_INDEX, payload: 0});
                // Idle thought: can have a useEffect catching changes to focusObj instead of this 'npcmenu/refresh' silliness, ultimately
                return dispatch({type: actions.UPDATE_SELECTED_BAR, payload: 'npcmenu/refresh'});
            default: {
                // This trickle-down default 'catches' all second-tier interactions. 
                // Now, how to handle sending specific requests to backend for assessment?
                // Well, we'll know from META what menu we're in, so we can parse from there.
                if (focusObj.meta === 'Buy') {
                    console.log(`It appears you wish to purchase this ${focusObj.interactions[focusObj.meta][npcMode[1]].name}?`);
                    // Now, IDEALLY, we'd make a new confirm menu with cost when this happens.
                    // meta set to BuyConfirm? :P
                    // Double ideally, we'd have a prettier format for the inventory showing stats 'n such, our money, the cost, etc.
                }
                if (focusObj.meta === 'Train') {
                    console.log(`It appears you wish to learn the ${focusObj.interactions[focusObj.meta][npcMode[1]].name} technique?`);
                }
                return setFocusObj({...focusObj, echo: `${focusObj?.name}: "${focusObj?.interactions[focusObj.meta][npcMode[1]]?.echo}"`});
                // return console.log(`NPC would respond with ${focusObj.interactions[focusObj.meta][npcMode[1]]}...?`);
            }
        }
    }, [state.currentBarSelected]);

    useEffect(() => {
        let combatViewElement = document.getElementById('combatview');
        if (combatViewElement) combatViewElement.scrollTop = combatViewElement.scrollHeight;
    }, [combatFeedback]);

    useEffect(() => {
        if (state.whatDo === 'combat') return setCombatFeedback([`You ready yourself for battle!`]);
        return setCombatFeedback([]);
        
    }, [state.whatDo]);

    useEffect(() => {
        if (state.whatDo === 'combat' && state.fighting.main === undefined && state.fighting?.others.length === 0) {
            console.log(`No more fighting!`);
            return dispatch({type: actions.UPDATE_WHATDO, payload: 'explore'});
        }
    }, [state.fighting]);

    /*
        Some FOCUS modes, which would correspond to whatDo situations (for key responses):
            -- NPC interaction, including shopping
            -- Combat
            -- Gathering
            -- Crafting
            -- Magic
            -- Inventory/equipment
            
        Gets a bit wacky narrow at lower widths, but the shrinking text of the main view shows we can probably accomodate that ok.

        More screen refitting:
        -- right side: buildings/shops/etc, npcs, mobs
        -- below chat: 'also here', or maybe bottom right?
        -- left side: actions (cast, use, do, search, forage/fish, etc.)

        Idea: leftFocus and rightFocus, so if you're CASTING, that's maybe a right-side thing, and COMBAT lives on the left, so they 'mix' well?
    */
   switch (state.whatDo) {
        case 'explore': {
           return null;
        }
        case 'npcinteract': {
            return (
                <NPCInteractionContainer>
                    {/* 
                        Ok! What do we need to know? Aw hell, just grab the WHOLE NPC. :P 
                        That's working well for now. Soon-ish we should probably just grab a curated subset of the NPC's "stuff."
                    */}
                    <p>{focusObj?.echo}</p>

                    <Fader />

                    <NPCInteractionOptions>
                        {contextualArray.map((interaction, index) => (
                            <NPCInteractionButton key={index} viewed={localViewIndex === index} onClick={() => handleInteractionSelection(interaction)}>{interaction}</NPCInteractionButton>
                        ))}
                    </NPCInteractionOptions>
                </NPCInteractionContainer>
            )
        }
        case 'magic': {
            // NOTE: currently this is the same 'small menu' as combat and such; will change later to be full-screen wackiness
            return (
                <MagicContainer>
                    BEEP BOOP
                </MagicContainer>
            )
        }
        case 'inventory': {
            return (
                <InventoryContainer>
                    <EquippedContainer>
                        Equipped Gear
                        <EquippedItem viewed={state?.currentBarSelected === 'equipment' && state?.viewTarget?.id === 0}>Right Hand: {state.equipped?.rightHand?.glance || '(Nothing)'}</EquippedItem>
                        <EquippedItem viewed={state?.currentBarSelected === 'equipment' && state?.viewTarget?.id === 1}>Left Hand: {state.equipped?.leftHand?.glance || '(Nothing)'}</EquippedItem>
                        <EquippedItem viewed={state?.currentBarSelected === 'equipment' && state?.viewTarget?.id === 2}>Head: {state.equipped?.head?.glance || '(Nothing)'}</EquippedItem>
                        <EquippedItem viewed={state?.currentBarSelected === 'equipment' && state?.viewTarget?.id === 3}>Body: {state.equipped?.body?.glance || '(Nothing)'}</EquippedItem>
                        <EquippedItem viewed={state?.currentBarSelected === 'equipment' && state?.viewTarget?.id === 4}>Accessory: {state.equipped?.accessory1?.glance || '(Nothing)'}</EquippedItem>
                        <EquippedItem viewed={state?.currentBarSelected === 'equipment' && state?.viewTarget?.id === 5}>Accessory: {state.equipped?.accessory2?.glance || '(Nothing)'}</EquippedItem>
                        <EquippedItem>Money: {`${state?.wallet?.coins[0] + state?.wallet?.coins[1] * 100 + state?.wallet?.coins[2] * 10000 + state?.wallet?.coins[3] * 1000000} (${state?.wallet?.coins[0]}c, ${state?.wallet?.coins[1]}s, ${state?.wallet?.coins[2]}g, ${state?.wallet?.coins[3]}p)`}</EquippedItem>
                    </EquippedContainer>
                    <BackpackContainer>
                        <BackpackColumn>
                        {state?.backpack?.contents1?.map((item, index) => (
                            <BackpackItem key={index} viewed={state?.currentBarSelected === 'inventory/1' && state?.viewTarget?.id === index}>{item?.glance}</BackpackItem>
                        ))}
                        </BackpackColumn>
                        <BackpackColumn>
                        {state?.backpack?.contents2?.map((item, index) => (
                            <BackpackItem key={index} viewed={state?.currentBarSelected === 'inventory/2' && state?.viewTarget?.id === index}>{item?.glance}</BackpackItem>
                        ))}
                        </BackpackColumn>
                        <BackpackColumn locked={state.backpack?.size < 3}>
                        {state?.backpack?.contents3?.map((item, index) => (
                            <BackpackItem key={index} viewed={state?.currentBarSelected === 'inventory/3' && state?.viewTarget?.id === index}>{item?.glance}</BackpackItem>
                        ))}
                        </BackpackColumn>
                        <BackpackColumn locked={state.backpack?.size < 4}>
                        {state?.backpack?.contents4?.map((item, index) => (
                            <BackpackItem key={index} viewed={state?.currentBarSelected === 'inventory/4' && state?.viewTarget?.id === index}>{item?.glance}</BackpackItem>
                        ))}
                        </BackpackColumn>                                                                        

                    </BackpackContainer>
                    <InventoryItemDetails>
                    {state?.viewTarget?.item?.description || `An ethereal whisper of an item.`}
                    </InventoryItemDetails>
                </InventoryContainer>
            )
        }
        case 'stats': {
            return (
                <StatusScreenContainer>
                    {/* Ok! Display works. Noice. Now let's pretty it up. Also, a lot of numbers end up the same, so let's vary the starter equipment a bit more. */}
                    {/* 
                        Let's design! Stat screen. Uh, let's see...
                        HP, MP, eight derived stats, uh... oh, seven 'core' stats, obviously... what else...
                        ... skills? Skills! And maybe stuff related to that, like perk points, perks, etc.
                        ... oh, huh, I need to maybe record somewhere those perk point bits. Note to self! Do that. Ok, moving on.
                        ... being able to select for greater detail would be good, especially for skills/perks. Separate sub-screen? Hm.

                        TOP: Name, Class, indication this is stat screen :P
                        First, current status! HP/max, MP/max, injuries, other 'health' effects
                            -- 
                        Seven stats next, physical left, magical right, spirit in the center?
                            -- 
                        Below that: 'derived stats' in two four-group collections
                            -- 
                        Further down from that, skills! Listed in rows of... eh, three?
                            -- 
                        

                        ... this is also a status screen! Amending.
                    */}

                    <StatusScreenTitleContainer>
                        <h1>Stats and Status of {state?.name}, {state?.class || 'Adventurer'}</h1>
                    </StatusScreenTitleContainer>


                    <StatusScreenCharacterContainer>

                    </StatusScreenCharacterContainer>


                    <StatusScreenHealthContainer>
                        <HealthItem>{`HP: ${state?.stat?.HP}/${state?.stat?.HPmax}`}</HealthItem>
                        <HealthItem>{`MP: ${state?.stat?.MP}/${state?.stat?.MPmax}`}</HealthItem>
                        <HealthItem>{`Injuries: none`}</HealthItem>
                    </StatusScreenHealthContainer>


                    <StatusScreenCoreStatsContainer>
                        <CoreStatItem>Strength: {state?.stat?.strength}</CoreStatItem>
                        <CoreStatItem>Agility: {state?.stat?.agility}</CoreStatItem>
                        <CoreStatItem>Constitution: {state?.stat?.constitution}</CoreStatItem>
                        <CoreStatItem>Spirit: {state?.stat?.spirit}</CoreStatItem>
                        <CoreStatItem>Willpower: {state?.stat?.willpower}</CoreStatItem>
                        <CoreStatItem>Intelligence: {state?.stat?.intelligence}</CoreStatItem>
                        <CoreStatItem>Wisdom: {state?.stat?.wisdom}</CoreStatItem>
                    </StatusScreenCoreStatsContainer>


                    <StatusScreenDerivedStatsContainer>
                        <DerivedStatsRow>
                            <DerivedStatItem>Attack: {state?.stat?.ATK}</DerivedStatItem>
                            <DerivedStatItem>Accuracy: {state?.stat?.ACC}</DerivedStatItem>
                            <DerivedStatItem>Defense: {state?.stat?.DEF}</DerivedStatItem>
                            <DerivedStatItem>Evasion: {state?.stat?.EVA}</DerivedStatItem>
                        </DerivedStatsRow>
                        <DerivedStatsRow>
                            <DerivedStatItem>Magic: {state?.stat?.MAG}</DerivedStatItem>
                            <DerivedStatItem>Focus: {state?.stat?.FOC}</DerivedStatItem>
                            <DerivedStatItem>Resistance: {state?.stat?.RES}</DerivedStatItem>
                            <DerivedStatItem>Luck: {state?.stat?.LUK}</DerivedStatItem>
                        </DerivedStatsRow>
                    </StatusScreenDerivedStatsContainer>


                    <StatusScreenSkillsContainer>
                        {Object.keys(state?.skill).map((skill) => (
                            <SkillItem key={skill}>{skill[0].toUpperCase()}{skill.slice(1)}: {state?.skill[skill]}</SkillItem>
                        ))}
                    </StatusScreenSkillsContainer>

                </StatusScreenContainer>
            )
        }
        case 'combat': {
            /*
                Combat mode basics time! 
                So, combat can be initiated by being attacked or by attacking a target.
                Right now we're playing with the MOB initiating combat.
                Let's figure out what we want our key inputs to do, make them live, and build out the basic GUI.
                ... with this complete, we'll be quite close to ALPHA RELEASE! Fantastic.

                GUI:
                    -- We'll start with NON full-screen, but 'obscure' the iSpy below
                    -- Leave room for 'placement' concepts (grid v grid, or single grid)
                    -- Main commands on the left (i.e. (R)un, which should replace core commands of exploration)
                    -- Each enemy should display name, threat level, HP, overall status, status effects (ideally - maybe later, but consider room for it)
                    -- Texty area to see combat feedback
                    -- Maybe a way to look more closely at individual mobs? See their equipment, status, etc. in greater detail?
                    
                    -- To begin with, we need to know WHAT is attacking us! A threat list of sorts. So everything attacking us (and at-a-glance status for each).
                    -- The entity we're targeting should be front-and center.
                    -- Consider adding a brief flickering animation or something when they attack the player.
                    -- 'Target Window' will display the details of the current main fighting target
                    -- At-a-glance for the 'rest' (currently only one target is expected, muglins don't swarm)

                BUTTONS, reconfigured: 
                    -- (R)un -- try to disengage! Right now that just cancels combat (in an awkward way).
                    -- (A)ggressive stance
                    -- (D)odge stance
                    -- (G)uard stance

                    -- (S)trike

                    ... muglins are hard when they're just as 'good' as a starter char! One-on-one combat is dicey without options.
                    ... currently (A) does a basic STRIKE, but that can certainly change. Maybe (S)? (H) for Heavy Strike?
                    ... well, don't need to map the entire keyboard. :P
                
                Hm. Ok, it's hard to see at a glance who's doing what, so let's color-code or otherwise visually distinguish enemy vs player actions.

                Let's set it up so we can see the muglin's health status, as well as ours!
                -- and our EQL and stance would be fantastic as well

            */
            return (
                <CombatScreenContainer>
                    <CombatFeedBack id="combatview">
                        {combatFeedback.map((combatMessage, index) => (
                            <p key={index}>{combatMessage}</p>
                        ))}
                    </CombatFeedBack>
                </CombatScreenContainer>
            );
        }
        default: {
            return null;
        }
   }
}


const ViewBox = ({ state, dispatch }) => {
    const [talkText, setTalkText] = useState('');
    const [iSpy, setISpy] = useState(['So a new day of adventure begins.', 'Proceed boldly!']);
    const chatRef = useRef(null);
    // let mainViewElement;

    function handleSubmittedChatText(e) {
        e.preventDefault();
        if (talkText === '') {
            return;
        }
        dispatch({type: actions.PACKAGE_FOR_SERVER, payload: {action: 'talk', message: talkText}});
        setTalkText('');
    }

    useEffect(() => {
        if (state.whatDo === 'talk') {
            chatRef.current.focus();
        } else {
            setTalkText('');
        }
    }, [state.whatDo]);

    useEffect(() => {
        // THIS: when a new string is processed through PACKAGE_FROM_SERVER, it ends up here for display. Makes sense!
        if (state.received) {
            // ADD: parse the received data, and if it's a "move to new room" situation, add an extra blank line or two to iSpy, buffer it out a bit
            let newSights = [...iSpy];
            // Added a quick type check to omit combat_msg from the main iSpy log; later might want to have *some* reflection, just not the same exact text x2
            if (state.received.echo && state.received?.type !== 'combat_msg') {
                let newestSight = state.received?.echo[0].toUpperCase() + state.received?.echo.slice(1);
                newSights.push(newestSight);
            }

            setISpy(newSights);
            dispatch({type: actions.PACKAGE_FROM_SERVER, payload: undefined});
            // HERE, probably: clear out state.received to avoid redundancies/repeats
        }
    }, [state.received]);

    useEffect(() => {
        // mainViewElement = document.getElementById('mainview');
    }, []);

    useEffect(() => {
        let mainViewElement = document.getElementById('mainview');
        mainViewElement.scrollTop = mainViewElement.scrollHeight;
    }, [iSpy]);


    return (
        <>
            
            <MainViewContainer>
                <RoomView>
                    
                    {(state.currentBarSelected === 'entity' && state.whatDo === 'explore') &&
                    <>
                    <RoomName>{state.viewTarget?.glance || state.viewTarget?.name}</RoomName>
                    <RoomDetails>
                        <RoomImg />
                        <RoomDesc>
                            {state.viewTarget?.description}
                        </RoomDesc>
                    </RoomDetails>
                    </>
                    }
                    {state.whatDo === 'npcinteract' &&
                    <>
                    <RoomName>{state.target?.glance || state.target?.name}</RoomName>
                    <RoomDetails>
                        <RoomImg />
                        <RoomDesc>
                            {state.target?.description}
                        </RoomDesc>
                    </RoomDetails>
                    </>
                    }
                    {state.currentBarSelected === 'action' &&
                    <>
                    <RoomName>{state.location?.room?.zone} - {state.location?.room?.room}</RoomName>
                    <RoomDetails>
                        <RoomImg />
                        <RoomDesc>
                            {state.location?.room?.description}
                        </RoomDesc>
                    </RoomDetails>
                    </>
                    }

                </RoomView>
                <EyeView id='mainview'>
                    {iSpy.map((line, index) => (
                        <EyeSpyLine key={index}>{line}</EyeSpyLine>
                    ))
                    }
                </EyeView>
            </MainViewContainer>
            <ChatPrompt chatting={state.whatDo === 'talk'}>(TAB to talk)</ChatPrompt>
            <ChatWrapper chatting={state.whatDo === 'talk'} onSubmit={handleSubmittedChatText}>
                <ChatInput type='text' ref={chatRef} readOnly={state.whatDo === 'talk' ? false : true} value={talkText} onChange={e => setTalkText(e.target.value)} autoComplete={'off'} autoCorrect={'off'}></ChatInput>
                <ChatSubmit>!</ChatSubmit>
            </ChatWrapper>
        </>
    )
}



const MyChar = ({ state, dispatch }) => {
    // Hm, a little bulky. Think about what else is going in here, maybe shrink it down to mostly fixed with a little bit of vw.
    // Also, name shrinks far too much when screen size changes. Pump it up!

    return (
        <CharCard>
            <TopMenuBox state={state} dispatch={dispatch} />
            <CharProfileImg />
            <CharCondition>
                <CharProfileName>{state.name}</CharProfileName>
                <div>EQL: {state?.equilibrium}</div>
                <div>Stance: {state?.stance}</div>
            </CharCondition>
            <CharHPMP>
                <CharHPContainer>
                    <CharHP HPpercent={Math.floor(state.stat.HP / state.stat.HPmax * 100)} healthColor={'green'}>{state?.stat?.HP}</CharHP>
                    <CharMP HPpercent={Math.floor(state.stat.MP / state.stat.MPmax * 100)} manaColor={'blue'}>{state?.stat?.MP}</CharMP>
                </CharHPContainer>
                <CharMPContainer></CharMPContainer>
            </CharHPMP>
            <MyCompassView>
                <MyMapGuy />
                <CompassArrow east navigable={state.location?.room?.exits?.e}/>
                <CompassArrow southeast navigable={state.location?.room?.exits?.se}/>
                <CompassArrow south navigable={state.location?.room?.exits?.s}/>
                <CompassArrow southwest navigable={state.location?.room?.exits?.sw}/>
                <CompassArrow west navigable={state.location?.room?.exits?.w}/>
                <CompassArrow northwest navigable={state.location?.room?.exits?.nw}/>
                <CompassArrow north navigable={state.location?.room?.exits?.n}/>
                <CompassArrow northeast navigable={state.location?.room?.exits?.ne}/>
            </MyCompassView>
        </CharCard>
    )
}



const MyMap = ({ state }) => {
    // Ok, let's rethink. MyMapView should probably be a square again, just a little compass whose arrows light up when dir is available.
    // UP and DOWN can be on the side as sweeping arrows.
    // This MYMAP component can render just a NavCompass in MUD rooms, and expand to be a big screen view if/when Open World opens up.
    // We'll rejigger state variables to check that later, since we DO have it defined in AREAS on backend, each area has a 'type' such as 'mud'
    
    return (
        <></>
    )
}

/*

Refactored! Whoa! This is now the big 'main box' and its assorted bits and bobs.

Wed 3/10:
-- Doot da doo

Copying notes in here from App:

When traveling, the main part of the screen should be a visual representation of where you can go (we'll stick with top-down nav).
-- 'Map' between areas/world-wide can be spinny 'walk forward' "tank control" style
-- 'Areas' will be DR-like, with eight directions, up/down, out, etc. -- riiiight? Probably still the 'easiest' way to do it, so let's stick with that.
-- 'Forage' and 'context' menu on the bottom? Side? Side bottom? :P
-- COMMAND BAR: clickable/keyboardable buttons that let you know what you can do
-- 'Status' and 'condition' and 'hands' on the top
-- 'Chat' mode/interaction mode/'looking' mode? How to square with big ol' center NavView? HMMM.

-- We have a big ol' CENTER BOX. What to do with you? 
: Character Box ('face', condition, state such as stealth) in upper-left feels like a good start
: Command Bar across top related to character - Stuff, Stats, etc.
: Contextual Command Bar (forage, fish, etc.) across bottom?
: Surroundings-related (people, critters, mobs of various descriptions) - ???
: Picked-up/dropped items scooted to upper left near charbox, mayhaps?

Oof. I'm 'stuck' on this part. Let's see. CENTER BOX. Let's get you going, my friend...
-- What's the essential problem? What to 'see' and 'how' to see it. 

*/