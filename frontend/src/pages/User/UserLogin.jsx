import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo1.png';
import halfPageImage from '../../assets/half_page.jpg';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setUserData } from '../../actions/userActions';
import { TokenManager } from '../../utils/tokenManager';

const UserLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState("");
  const navigate = useNavigate()
  const dispatch = useDispatch();

  const submitHandler = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/users/login`, {
        email,
        password
      });
      
      if (response.status === 200) {
        dispatch(setUserData(response.data));

        setEmail('');
        setPassword('');
        TokenManager.setToken('usertoken', response.data.token, 24)
        navigate('/home');
      }
    } catch (err) {
      if (err.response) {
        switch (err.response.status) {
          case 401:
            setError("Invalid email or password");
            break;
          case 404:
            setError("Account not found");
            break;
          default:
            setError("Login failed. Please try again.");
        }
      } else if (err.request) {
        setError("Network error. Please check your connection.");
      } else {
        setError("An error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="h-screen bg-cover bg-center font-lexend flex">
      {/* Half Page Image - Left Side (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img 
          src={halfPageImage} 
          alt="Routeify Background" 
          className="w-full h-full object-cover transition-transform duration-500 ease-in-out hover:scale-105"
        />
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
      </div>

      {/* Login Section - Right Side (Desktop) / Full Width (Mobile) */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between">
        {/* Logo Section */}
        <div className="p-5">
          <img src={logo} alt="Routeify Logo" className="w-20 mx-auto" />        
        </div>

        {/* Login Form Section */}
        <div className="bg-white p-5 flex h-screen flex-col items-center justify-between gap-4 rounded-t-lg md:max-w-md md:mx-auto md:w-full">
          <div className="max-w-96 w-full md:max-w-none">
            <form className="w-full" onSubmit={submitHandler}> {/* Removed max-w-md */}
            <label htmlFor="email" className="font-medium mb-2 block">
              Email
            </label>
            <input
              id="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="email@example.com"
              className="bg-[#eeeeee] mb-4 rounded-md px-4 py-2 border w-full placeholder:text-sm"
            />

            <label htmlFor="password" className="font-medium mb-2 block">
              Password
            </label>
            <input
              id="password"
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password"
              className="bg-[#eeeeee] mb-4 rounded-md px-4 py-2 border w-full placeholder:text-sm"
            />

            <button
              type="submit"
              className="bg-black text-white w-full p-3 rounded-md transition"
            >
              Login
            </button>
            {error && (
              <div className=" text-red-500 px-4 py-3 rounded relative text-sm text-center">
                {error}
              </div>
            )}
          </form>
          <p className="text-sm pt-4 text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="text-black font-semibold hover:underline">
              Sign up
            </Link>
          </p>
          
          </div>

          {/* Login as Captain Link */}
          <Link
            to="/captain-login"
            className="bg-blue-600 text-white max-w-96 w-full mx-3 p-3 rounded-md hover:bg-blue-700 transition text-center"
          >
            Login as Captain
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;