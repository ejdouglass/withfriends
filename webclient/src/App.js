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

  RANDOM THOUGHTS:
  -- I'm a little off in the weeds right now. Get back to core functionality next.
  WITH FRIENDS. First, make it possible to play with friends, real-time, chatting and gathering and building and accomplishing together!
  -- Once that can be done, you can 'expand' whatever you like.
  -- Make it REALLY easy to begin. Name, class (grab or customize), away we go! Should be able to fire it up in seconds, literally.
    -> However, to ensure an enduring existence, add account creation, and make sure it's prominent.


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