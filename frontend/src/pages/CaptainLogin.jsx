import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/car1.png';
import { setCaptainData } from '../actions/captainActions';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'
import { useDispatch } from 'react-redux';

const CaptainLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState("");
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/captains/login`, {
        email,
        password
      });

      if(response.status == 200){
        dispatch(setCaptainData(response.data));

        setEmail('');
        setPassword('');
        localStorage.setItem('captaintoken',response.data.token)
        navigate('/captain');
      }
    setTimeout(() => {
      localStorage.removeItem('captaintoken');
    }, 3600000); // 1 hour in milliseconds
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
    <div className="h-screen bg-cover bg-center font-lexend flex flex-col justify-between">
      {/* Logo Section */}
      <div className="p-5 pb-2">
        <img src={logo} alt="Routeify Logo" className="w-16 mx-auto" />
      </div>

      {/* Login Form Section */}
      <div className="bg-white p-5 pt-0 flex h-screen flex-col items-center justify-between gap-4 rounded-t-lg">
        <div className="w-full">
          <form className="w-full" onSubmit={submitHandler}>
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
              className="bg-blue-600 hover:bg-blue-700 text-white w-full p-3 rounded-md transition"
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
            Want to join as captain?{' '}
            <Link to="/captain-signup" className="text-black font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </div>

        {/* Login as User Link */}
        <Link
          to="/login"
          className="bg-black text-white w-full mx-3 p-3 rounded-md transition text-center"
        >
          Login as User
        </Link>
      </div>
    </div>
  );
};

export default CaptainLogin;
