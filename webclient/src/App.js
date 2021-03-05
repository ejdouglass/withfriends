import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { Store } from './context/context';
import Landing from './pages/Landing';

const App = () => {
  return (
    <Store>
      <Router>
        <Route exact path='/' component={Landing} />
      </Router>
    </Store>
  )
}

export default App;