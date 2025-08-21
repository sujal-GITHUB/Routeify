import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store'; 
import { SocketProvider } from './context/SocketProvider';
import CaptainSignup from './pages/Captain/CaptainSignUp';
import CaptainLogin from './pages/Captain/CaptainLogin';
import Home from './pages/User/Home'
import Start from './pages/Start';
import UserLogin from './pages/User/UserLogin';
import UserSignUp from './pages/User/UserSignUp';
import Captain from './pages/Captain/Captain'
import UserProtectedWrapper from './pages/User/UserProtectedWrapper';
import CaptainProtectedWrapper from './pages/Captain/CaptainProtectedWrapper'
import Riding from './pages/User/Riding';
import CaptainRiding from './pages/Captain/CaptainRiding';
import RideSuccess from './pages/Captain/RideSuccess';
import Success from './pages/User/Success'

const App = () => {
  return (
    <Provider store={store}>
      <SocketProvider>
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
            <Route path="/ride-success" element={
              <CaptainProtectedWrapper>
                <RideSuccess/>
              </CaptainProtectedWrapper>
            } />
            <Route path="/success" element={
              <UserProtectedWrapper>
                <Success />
              </UserProtectedWrapper>
            } />
            <Route path="/login" element={<UserLogin />} />
            <Route path="/signup" element={<UserSignUp />} />
            <Route path="/captain-signup" element={<CaptainSignup />} />
            <Route path="/captain-login" element={<CaptainLogin />} />
          </Routes>
        </div>
      </SocketProvider>
    </Provider>
  );
}

export default App;
