import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCaptainData } from "../actions/captainActions"; // Fixed import
import logo from "../assets/car1.png";
import axios from "axios";

const CaptainSignUp = () => {
 const [email, setEmail] = useState("");
 const [password, setPassword] = useState("");
 const [firstname, setFirstname] = useState("");
 const [lastname, setLastname] = useState("");
 const [color, setColor] = useState("");
 const [plate, setPlate] = useState("");
 const [capacity, setCapacity] = useState("");
 const [vehicleType, setVehicleType] = useState("");
 const [error, setError] = useState("");
 const [isLoading, setIsLoading] = useState(false);

 const navigate = useNavigate();
 const dispatch = useDispatch();

 const submitHandler = async (e) => {
   e.preventDefault();
   setError("");
   setIsLoading(true);

   try {
     // Validation
     if (password.length < 6) {
       throw new Error("Password must be at least 6 characters long");
     }
     if (capacity <= 0) {
       throw new Error("Vehicle capacity must be greater than 0");
     }
     if (plate.length < 3) {
       throw new Error("Please enter a valid plate number");
     }
     if (!["car", "motorcycle", "auto"].includes(vehicleType)) {
       throw new Error("Please select a valid vehicle type");
     }

     const newCaptain = {
       fullname: {
         firstname,
         lastname,
       },
       email,
       password,
       vehicle: {
         color,
         plate: plate.toUpperCase(),
         capacity: parseInt(capacity),
         vehicleType,
       },
     };

     const response = await axios.post(
       `${import.meta.env.VITE_BASE_URL}/captains/register`,
       newCaptain,
       {
         headers: {
           "Content-Type": "application/json",
         },
       }
     );

     if (response.status === 201) {
       // Store response data
       dispatch(setCaptainData(response.data));
       
       // Clear form
       setEmail("");
       setPassword("");
       setFirstname("");
       setLastname("");
       setColor("");
       setPlate("");
       setCapacity("");
       setVehicleType("");
       localStorage.setItem('captaintoken',response.data.token)
       navigate("/captain");
     }setTimeout(() => {
      localStorage.removeItem('captaintoken');
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
     {/* Logo Section */}
     <div className="p-5 pb-2">
       <img src={logo} alt="Routeify Logo" className="w-16 mx-auto" />
     </div>

     {/* Signup Form Section */}
     <div className="bg-white p-5 pt-0 flex h-screen flex-col items-center justify-between gap-4 rounded-t-lg">
       <div className="w-full">
         <form className="w-full" onSubmit={submitHandler}>
           {/* Firstname and Lastname Fields */}
           <div className="flex gap-2">
             <div>
               <label htmlFor="firstname" className="font-medium mb-2 block">
                 First name
               </label>
               <input
                 id="firstname"
                 required
                 value={firstname}
                 onChange={(e) => setFirstname(e.target.value)}
                 type="text"
                 placeholder="firstname"
                 className="bg-[#eeeeee] mb-4 rounded-md px-3 py-2 border w-full placeholder:text-sm"
               />
             </div>

             <div>
               <label htmlFor="lastname" className="font-medium mb-2 block">
                 Last name
               </label>
               <input
                 id="lastname"
                 required
                 value={lastname}
                 onChange={(e) => setLastname(e.target.value)}
                 type="text"
                 placeholder="lastname"
                 className="bg-[#eeeeee] mb-4 rounded-md px-3 py-2 border w-full placeholder:text-sm"
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

           {/* Vehicle Details Section */}
           <fieldset>
             <legend className="font-medium mb-2 block">Vehicle Details</legend>
             <div className="flex gap-4 mb-4">
               <div className="w-1/2">
                 <input
                   id="color"
                   required
                   value={color}
                   onChange={(e) => setColor(e.target.value)}
                   type="text"
                   placeholder="Vehicle color"
                   className="bg-[#eeeeee] rounded-md px-4 py-2 border w-full placeholder:text-sm"
                 />
               </div>
               <div className="w-1/2">
                 <input
                   id="capacity"
                   required
                   value={capacity}
                   onChange={(e) => setCapacity(e.target.value)}
                   type="number"
                   min="1"
                   max="50"
                   placeholder="Vehicle capacity"
                   className="bg-[#eeeeee] rounded-md px-4 py-2 border w-full placeholder:text-sm"
                 />
               </div>
             </div>

             <div className="mb-4">
               <input
                 id="plate"
                 required
                 value={plate}
                 onChange={(e) => setPlate(e.target.value)}
                 type="text"
                 placeholder="Vehicle plate number"
                 className="bg-[#eeeeee] rounded-md px-4 py-2 border w-full placeholder:text-sm"
               />
             </div>

             <div className="mb-4">
               <select
                 id="vehicleType"
                 required
                 value={vehicleType}
                 onChange={(e) => setVehicleType(e.target.value)}
                 className="bg-[#eeeeee] rounded-md px-4 py-2 border w-full placeholder:text-sm"
               >
                 <option value="">Select vehicle type</option>
                 <option value="car">Car</option>
                 <option value="motorcycle">Motorcycle</option>
                 <option value="auto">Auto</option>
               </select>
             </div>
           </fieldset>

           {/* Submit Button */}
           <button
             type="submit"
             disabled={isLoading}
             className={`bg-black text-white w-full p-3 rounded-md transition ${
               isLoading ? 'opacity-70 cursor-not-allowed' : ''
             }`}
           >
             {isLoading ? "Creating Account..." : "Create Account"}
           </button>
           {error && (
              <div className=" text-red-500 px-4 py-3 rounded relative text-sm text-center">
                {error}
              </div>
            )}
         </form>

         <p className="text-sm pt-4 text-gray-600">
           Already a captain?{" "}
           <Link to="/captain-login" className="text-black font-semibold hover:underline">
             Login
           </Link>
         </p>
       </div>

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