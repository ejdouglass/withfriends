import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { Store } from './context/context';
import Keyboard from './components/Keyboard';
import Cutscene from './components/Cutscene';
import GameScreen from './pages/GameScreen';


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

  -- This is a little tricky, because there's a big difference between "fast mode" and "ideal mode" in my mind.

  Let's outline both real quick...
  FAST MODE:
  -- turnaround will be much more streamlined
  -- creativity is born out of constraints; might come up with some cool results just based on being limited
  -- can always build it out more thoroughly later, or use the concepts explored more deeply and quickly to launch other 'games' down the line

  
  IDEAL MODE:
  -- moar graphics, which will carry over in knowledge base better with Proper PrPl
  -- 


  BLENDED MODE: 
  -- if I can figure out a decent 'best of both worlds' option...?
  
  

*/