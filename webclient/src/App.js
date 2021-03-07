import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { Store } from './context/context';
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
  
  Okie-doodle! Let's plan out the arc of the thing.
  -- basic frontend stuff: a basic layout and interactivity (open and close backpack, 'look around,' etc.)
  -- basic backend stuff: mostly for account and character creation and loading, below
  -- login/auth implementation
  -- character creation (basic) -- mostly so we can see how sockets work, below
  -- implement and test sockets ... backend/server 'events' (oh noes a GOBLIN), and multiple users (easiest way: probably one Chrome, one Safari)
  
  -- also, at some point, a 'game loop' needs to exist somewhere, possibly multiple somewheres

*/