import React, { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/car1.png";

const CaptainSignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [color, setColor] = useState(""); // Color of the vehicle
  const [plate, setPlate] = useState(""); // Plate number of the vehicle
  const [capacity, setCapacity] = useState(""); // Vehicle capacity
  const [vehicleType, setVehicleType] = useState(""); // Vehicle type (car, motorcycle, auto)
  const [userData, setUserData] = useState({});

  const submitHandler = (e) => {
    e.preventDefault();
    setUserData({
      fullname: {
        firstname: firstname,
        lastname: lastname,
      },
      email: email,
      password: password,
      vehicle: {
        color: color,
        plate: plate,
        capacity: capacity,
        vehicleType: vehicleType,
      },
    });
    setEmail("");
    setPassword("");
    setFirstname("");
    setLastname("");
    setColor("");
    setPlate("");
    setCapacity("");
    setVehicleType("");
  };

  return (
    <div className="h-screen bg-cover bg-center font-lexend flex flex-col justify-between">
      {/* Logo Section */}
      <div className="p-5 pb-2">
        <img src={logo} alt="Routeify Logo" className="w-16 mx-auto" />
      </div>

      {/* Signup Form Section */}
      <div className="bg-white p-5 pt-0 flex h-screen flex-col items-center justify-between gap-4 rounded-t-lg">
        <div>
          <form className="w-full max-w-md" onSubmit={submitHandler}>
            {/* Firstname and Lastname Fields */}
            <div className="flex">
              <div>
                <label htmlFor="firstname" className=" font-medium mb-2 block">
                  Firstname
                </label>
                <input
                  id="firstname"
                  required
                  value={firstname}
                  onChange={(e) => setFirstname(e.target.value)}
                  type="text"
                  placeholder="firstname"
                  className="bg-[#eeeeee] mb-4 rounded-md px-4 py-2 border w-full mr-2  placeholder:text-sm"
                />
              </div>

              <div>
                <label htmlFor="lastname" className=" ml-2 font-medium mb-2 block">
                  Lastname
                </label>
                <input
                  id="lastname"
                  required
                  value={lastname}
                  onChange={(e) => setLastname(e.target.value)}
                  type="text"
                  placeholder="lastname"
                  className="bg-[#eeeeee] mb-4 rounded-md px-4 py-2 border w-full ml-2  placeholder:text-sm"
                />
              </div>
            </div>

            {/* Email Field */}
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

            {/* Password Field */}
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

            {/* Vehicle Details Section */}
            <div>
              <label htmlFor="vehicleDetails" className=" font-medium mb-2 block">
                Vehicle Details
              </label>
              <div className="flex gap-4 mb-4">
                {/* Color Field */}
                <div className="w-1/2">
                  <input
                    id="color"
                    required
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    type="text"
                    placeholder="Vehicle color"
                    className="bg-[#eeeeee] rounded-md px-4 py-2 border w-full  placeholder:text-sm"
                  />
                </div>

                {/* Capacity Field */}
                <div className="w-1/2">
                  <input
                    id="capacity"
                    required
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    type="number"
                    placeholder="Vehicle capacity"
                    className="bg-[#eeeeee] rounded-md px-4 py-2 border w-full  placeholder:text-sm"
                  />
                </div>
              </div>

              {/* Plate Number Field */}
              <div className="mb-4">
                <input
                  id="plate"
                  required
                  value={plate}
                  onChange={(e) => setPlate(e.target.value)}
                  type="text"
                  placeholder="Vehicle plate number"
                  className="bg-[#eeeeee] rounded-md px-4 py-2 border w-full  placeholder:text-sm"
                />
              </div>

              {/* Vehicle Type Field */}
              <div className="mb-4">
                <select
                  id="vehicleType"
                  required
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="bg-[#eeeeee] rounded-md px-4 py-2 border w-full placeholder:text-sm"
                >
                  <option value="">Select Type</option>
                  <option value="car">Car</option>
                  <option value="motorcycle">Motorcycle</option>
                  <option value="auto">Auto</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="bg-black text-white w-full p-3 rounded-md transition"
            >
              Sign Up
            </button>
          </form>
          <p className="text-sm pt-4 text-gray-600">
            Already a captain?{" "}
            <Link to="/captain-login" className="text-black font-semibold hover:underline">
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

export default CaptainSignUp;
