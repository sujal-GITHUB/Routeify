import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/car1.png';

const CaptainLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captainData, setCaptainData] = useState({ email: '', password: '' });

  const submitHandler = (e) => {
    e.preventDefault();
    setCaptainData({
      email: email,
      password: password,
    });
    setEmail('');
    setPassword('');
    console.log(captainData);  
  };

  return (
    <div className="h-screen bg-cover bg-center font-lexend flex flex-col justify-between">
      {/* Logo Section */}
      <div className="p-5 pb-2">
        <img src={logo} alt="Routeify Logo" className="w-16 mx-auto" />
      </div>

      {/* Login Form Section */}
      <div className="bg-white p-5 pt-0 flex h-screen flex-col items-center justify-between gap-4 rounded-t-lg">
        <div>
          <form className="w-full max-w-md" onSubmit={submitHandler}>
            <label htmlFor="email" className=" font-medium mb-2 block">
              Email
            </label>
            <input
              id="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="email@example.com"
              className="bg-[#eeeeee] mb-4 rounded-md px-4 py-2 border w-full  placeholder:text-sm"
            />

            <label htmlFor="password" className=" font-medium mb-2 block">
              Password
            </label>
            <input
              id="password"
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password"
              className="bg-[#eeeeee] mb-4 rounded-md px-4 py-2 border w-full  placeholder:text-sm"
            />

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white w-full p-3 rounded-md transition"
            >
              Login
            </button>
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
          className="bg-black text-white w-full p-3 m-3 rounded-md transition text-center"
        >
          Login as User
        </Link>
      </div>
    </div>
  );
};

export default CaptainLogin;
