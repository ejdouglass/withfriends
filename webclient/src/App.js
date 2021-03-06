import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { Store } from './context/context';
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
        <Route exact path='/' component={GameScreen} />
      </Router>
    </Store>
  )
}

export default App;

/*

  DRAFTUS
  ... just realized that the ROUTE is laaargely unnecessary, but it's already there, so eh, character creation/login screens, cool, done

  -- This is a little tricky, because there's a big difference between "fast mode" and "ideal mode" in my mind.

  Let's outline both real quick...
 
  Ok, let's reframe.
  MUDmode
  -- Not fully 'MUD' of course; the graphics are just a semi-abstract framework to help users grok what's happening at-a-glance
  -- Main navigation mode is DR-esque; the 'screen' would show a background relevant to the current physical context, plus a block for text
  -- Fastest initial turnaround, can capitalize on 'chat room' functionality for websocket shenanigans
  -- Yeahhhh ok this is probably our best bet, don't get ahead of yourself


  MIXmode
  -- I dunno where the intersection would be. Hm. 
  
  

*/