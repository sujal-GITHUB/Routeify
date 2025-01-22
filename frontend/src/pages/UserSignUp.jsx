import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { setUserData } from "../actions/userActions";
import { Link } from "react-router-dom";
import logo from "../assets/logo1.png";
import { useNavigate } from "react-router-dom";
import axios from 'axios'

const UserSignup = () => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate()

  const submitHandler = async(e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters long");
      }

      const newUser = {
        fullname:{
          firstname,
          lastname,
        },
        email,
        password,
      }

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/users/register`, 
        newUser,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if(response.status === 201){
        dispatch(setUserData({
          fullname:{
            firstname,
            lastname,
          },
          email,
          password,
        }));

        // Clear the local form state
        setEmail("");
        setPassword("");
        setFirstname("");
        setLastname("");
        localStorage.setItem('usertoken',response.data.token)
        navigate('/home');
      }
      setTimeout(() => {
        localStorage.removeItem('usertoken');
      }, 3600000); // 1 hour in milliseconds
    } catch (err) {
      if (err.response) {
        switch (err.response.status) {
          case 409:
            setError("Email already exists");
            break;
          case 400:
            setError(err.response.data.message || "Invalid input data");
            break;
          default:
            setError("Failed to create account. Please try again.");
        }
      } else if (err.request) {
        setError("Network error. Please check your connection.");
      } else {
        setError(err.message || "Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-cover bg-center font-lexend flex flex-col justify-between">
      <div className="p-5">
        <img src={logo} alt="Routeify Logo" className="w-20 mx-auto" />
      </div>

      <div className="bg-white p-5 flex h-screen flex-col items-center justify-between gap-4 rounded-t-lg">
        <div>
          <form className="w-full max-w-md" onSubmit={submitHandler}>
            {/* Firstname and Lastname Fields */}
            <div className="flex gap-2">
              <div>
                <label htmlFor="firstname" className="font-medium mb-2 block">
                  Firstname
                </label>
                <input
                  id="firstname"
                  required
                  value={firstname}
                  onChange={(e) => setFirstname(e.target.value)}
                  type="text"
                  placeholder="firstname"
                  className="bg-[#eeeeee] mb-4 rounded-md px-4 py-2 border w-full placeholder:text-sm"
                />
              </div>

              <div>
                <label htmlFor="lastname" className="font-medium mb-2 block">
                  Lastname
                </label>
                <input
                  id="lastname"
                  required
                  value={lastname}
                  onChange={(e) => setLastname(e.target.value)}
                  type="text"
                  placeholder="lastname"
                  className="bg-[#eeeeee] mb-4 rounded-md px-4 py-2 border w-full placeholder:text-sm"
                />
              </div>
            </div>

            {/* Email Field */}
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

            {/* Password Field */}
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`bg-black text-white w-full p-3 rounded-md transition ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
            {error && (
              <div className=" text-red-500 px-4 py-3 rounded relative text-sm text-center">
                {error}
              </div>
            )}
          </form>
          <p className="text-sm pt-4 text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-black font-semibold hover:underline">
              Login
            </Link>
          </p>
        </div>

        {/* Privacy Policy Text */}
        <div className="text-center pt-4 mb-2">
          <p className="text-gray-600 text-xs">
            By signing up, you agree to our Privacy Policy and Terms of Service.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserSignup;