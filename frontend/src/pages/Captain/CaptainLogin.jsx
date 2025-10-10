import { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/car1.png';
import halfPageImage from '../../assets/half_page.jpg';
import { setCaptainData } from '../../actions/captainActions';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'
import { useDispatch } from 'react-redux';
import { TokenManager } from '../../utils/tokenManager';

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
        TokenManager.setToken('captaintoken', response.data.token, 24)
        navigate('/captain');
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
        <div className="p-5 pb-2">
          <img src={logo} alt="Routeify Logo" className="w-16 mx-auto" />
        </div>

        {/* Login Form Section */}
        <div className="bg-white p-5 pt-0 flex h-screen flex-col items-center justify-between gap-4 rounded-t-lg md:max-w-md md:mx-auto md:w-full">
        <div className="w-full max-w-96 md:max-w-none">
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
            className="bg-black text-white w-full max-w-96 mx-3 p-3 rounded-md transition text-center"
          >
            Login as User
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CaptainLogin;