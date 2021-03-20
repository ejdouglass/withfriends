import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { Store } from './context/context';
import Above from './components/Above';
import Around from './components/Around';
import Below from './components/Below';
import MainView from './components/MainView';
import CharSheet from './components/CharSheet';
import Backpack from './components/Backpack';
import Status from './components/Status';
import Keyboard from './components/Keyboard';
import Cutscene from './components/Cutscene';
import GameScreen from './pages/GameScreen';


// Might end up plopping a lot of the "screens" down here at the keyboard level... like inventory, charsheet, etc.
// It could be possible to combine and conditionally render some of these that can't co-exist? Hm.

// ADD: UserPrompt - for character creation, network errors, etc.
const App = () => {
  return (
    <Store>
      <Router>
        <Keyboard />
        <Above />
        <Around />
        <MainView />
        <Below />
        <Cutscene />
        <CharSheet />
        <Backpack />
        <Status />
        <Route exact path='/' component={GameScreen} />
      </Router>
    </Store>
  )
}

export default App;

/*

  DRAFTUS
  -- Ok, so, here's our marching orders (in order!) right now:
  x) Create a Cluster/DB (we'll stick with MONGO ATLAS for now)

  2) Implement character creation
  -- App needs to know user is not 'logged in' or, more specifically, does not have a valid character
  -- Allow user to quickly or in-depth-ly create a valid character (backend will validate its existence, even without a Player account)
  -- The 'token' for this character, and character itself, can persist even on backend *for a time,* but requires Player acct for true persistence
  -- So, for now, big milestones:
    I. App goes "valid character able to be loaded?" -> YES: load, play ... NO: fire up chara creation
    -- So, uh, check localStorage for (current chara token), if one found, attempt to load in backend; if none found, scoot-addle to CREATION

    II. Chara Creation!
    -- Name (must be unique, check backend for that)
    -- Stats
    -- Background/'Class' (informs skills, knowledge, other stuff eventually perhaps) (can evolve this later into more nuanced backstories)
    -- Features (basic)
    -> Consideration: 'character' database? ... separate player database, too. Well, collection.


  3) Create a "User Account" process on frontend and backend, inclusive of creation, deletion, logging in, logging out, and character selection (all AUTH)
  4) Use the ABSOLUTE TRUTH of the backend to create meaningful 'navigation' on frontend in our LilMap
  5) Add meaningful interaction with the 'rooms'
  6) Add meaningful interaction with the field goblin

  ?) Add skills
  ?) Add perks/talents/abilities unlocked through skills
  ?) Add minigames (fighting, fishing, foraging, etc.)
  !) Add 'chat' and better-fleshed-out room interactivity (including other entities in it)

  REFACTOR) Don't need the separate root-level Above/Below/etc. Move into components within a single main entity.



  WEDS 3/17/21 APP THOUGHTS:
  -- Still a little in the weeds, but hopefully centering in on a good and practical ("practical") core experience.
  -- Next task is to create the login process. Crib off of folioprpl for the logistics on that, and copy into Notes.
  -- The login process should also be tied to a 'character creation' process. Start silly-simple, and then add from there.
    -> There's a lot of potential depth here, so feel free to begin brainstorming, and keep options open for how the creation/characters are handled.
  -- Based on random thoughts below, it makes sense to STREAMLINE character creation/jumping in, with a BIG NOTE @ user to create an account to persist.

  -- Gotta spin up an ATLAS for "With Friends," and mostly it'll be there to 'load' players into the game, I think?
    -> The 'server' is where the actual game lives by current reckoning, so that has to not go 'bloop' too often or else that'll be an issue :P
    -> That said, having the DB store a living snapshot of the ENTIRE GAME'S STATE periodically, and know when/if to load from that snapshot, would be great
    -> Somewhat unrelated, but having "internal AI" for entities and areas is a great goal to pursue ultimately
  

  Hm. "Socket reset?" Right now the downside to the single-declaration socket is, if something goes wrong, we just sit there with a broken socket...
  -- Where can we put the 'socket connection' that makes the socket component-accessible but refreshable?
  ... huh, maybe inside the component itself? With a 'socketStatusOK' useEffect-based useState to 'fix' it if it's broken? 


  Can look into CLASSES for mob generation! Neato! ... new Goblin(), here we come :P

  Pondering how to handle 'room actions'... it makes sense to 'put' a character in the room (while also having room reference attached to character).
  -- That way, there's an array or collection of 'entities' within a room, and events can just be 'broadcast' to them.
  -- This works both for basic messaging (ambient, mobs in room) as well as skill-based stuff, parsing mob actions, player actions, etc.


  The main goal is to design the 'ideal' version from my current point of view, then scale back to first dev milestones ASAP.
  -- Websocket play and demo
  -- Robust and interesting, if fairly basic, experience
  
  STUFF TO DEV UP, IN ORDER:
  !! basic frontend stuff: a basic layout and interactivity (open and close backpack, 'look around,' etc.)
    -> THIS STEP: add support for navigation, acting in current environment contextually, viewing basic elements of character, state (can be crude atm)

  -- character creation (basic) -- mostly so we can see how sockets work, below 
  -- basic backend stuff: mostly for account and character creation and loading, below
  -- login/auth implementation
  -- implement and test sockets ... backend/server 'events' (oh noes a GOBLIN), and multiple users (easiest way: probably one Chrome, one Safari)
  
  -- also, at some point, a 'game loop' needs to exist somewhere, possibly multiple somewheres


  CURRENT: "Basic Frontend Stuff -- Layout and Basic Interactivity"
  -- What do we need to 'see'? Where we are, what we ARE doing, what we CAN do, how we're doing
  : Where we are - name, sky, context (forest, beach, etc.), buildings/exits, weather/time, who/what else is around (and their demeanors to some degree)
  : What we ARE doing - combat, fishing, digging through our backpack, etc. all different appearances
  : What we CAN do - exits, forageables (auto or focus bar/menu), environment(s), fight/sneak/barter/blend, etc.
  : How we're doing - health, position, body, stealth, equipment/hands?



  
  THINGS WE CAN DO - Brainstorm now, whittle down to Version Public Zero later :P
  : Fight
  : Hunt
  : Fish
  : Forage/Gather - herbs, rocks, wood, grass, sap, roots, flowers, vines, drops/critter parts (feathers, not like entire hides :P)
  : Lumberjack - for gathering the BIG lumber sources, or specifically prepared/identified bits (a perfect rather than random wood for a bow)
  : Mine
  : Craft (subtypes: forge, assemble, carve, alchemy, enchant, ___)
  : Build (buildings, walls, etc.) - (change the terrain/spawn/etc. rules, with step-wise limiters as a Township level dictates)
  : Interact (PC's, NPC's)
  : Quest
  : Dungeon-crawl (various kinds)
  : Explore (fixed, procedural)
  : Gain skills, develop talents, pursue class(es)


  QUICK VISUAL SKETCH but with words haaaaa ok here we go.

  When traveling, the main part of the screen should be a visual representation of where you can go (we'll stick with top-down nav).
  -- Dunno how to handle 'overworld'/open-ended travel modes, if applicable.
  -- 'Areas' will be DR-like, with eight directions, up/down, out, etc.
  -- 'Forage' and 'context' menu on the bottom? Side? Side bottom? :P
  -- COMMAND BAR: clickable/keyboardable buttons that let you know what you can do
  -- 'Status' and 'condition' and 'hands' on the top
  -- 'Chat' mode/interaction mode/'looking' mode? How to square with big ol' center NavView? HMMM.
  
  -- We have a big ol' CENTER BOX. What to do with you? 
  : Character Box ('face', condition, state such as stealth) in upper-left feels like a good start
  : Command Bar across top related to character - Stuff, Stats, etc.
  : Surroundings-related (people, critters, mobs of various descriptions) - ???
  : Picked-up rise on upper right, dropped fall on lower right

  Oof. I'm 'stuck' on this part. Let's see. CENTER BOX. Let's get you going, my friend...
  -- What's the essential problem? What to 'see' and 'how' to see it. 


*/