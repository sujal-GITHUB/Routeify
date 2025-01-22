import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store'; 
import CaptainSignup from './pages/CaptainSignUp';
import CaptainLogin from './pages/CaptainLogin';
import Home from './pages/Home'
import Start from './pages/Start';
import UserLogin from './pages/UserLogin';
import UserSignUp from './pages/UserSignUp';
import Captain from './pages/Captain'
import UserProtectedWrapper from './pages/UserProtectedWrapper';
import CaptainProtectedWrapper from './pages/CaptainProtectedWrapper'
import Riding from './pages/Riding';
import CaptainRiding from './pages/CaptainRiding';

const App = () => {
  return (
    <Provider store={store}>
      <div>
        <Routes>
          <Route path="/" element={<Start />} />
          <Route path="/home" element={
          <UserProtectedWrapper>
            <Home />
          </UserProtectedWrapper>}/>
          <Route path='/captain' element={
            <CaptainProtectedWrapper>
              <Captain/>
            </CaptainProtectedWrapper>
          }/>
          <Route path="/riding" element={
          <UserProtectedWrapper>
            <Riding />
          </UserProtectedWrapper>}/>
          <Route path='/captain-riding' element={
            <CaptainProtectedWrapper>
              <CaptainRiding/>
            </CaptainProtectedWrapper>
          }/>
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
