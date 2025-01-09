import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store'; 
import CaptainSignup from './pages/CaptainSignUp';
import CaptainLogin from './pages/CaptainLogin';
import Home from './pages/Home';
import UserLogin from './pages/UserLogin';
import UserSignUp from './pages/UserSignUp';

const App = () => {
  return (
    <Provider store={store}>
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<UserLogin />} />
          <Route path="/signup" element={<UserSignUp />} />
          <Route path="/captain-signup" element={<CaptainSignup />} />
          <Route path="/captain-login" element={<CaptainLogin />} />
        </Routes>
      </div>
    </Provider>
  );
}

export default App;
