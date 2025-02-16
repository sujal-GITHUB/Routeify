import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setRideData } from "../actions/rideActions";
import gsap from "gsap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import payment_success from "../assets/payment-success.png";
import payment_error from "../assets/payment-error.png";

const ConfirmRide = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pickup, destination, price, distance, time, vehicletype } =
    useSelector((state) => state.ride);

  useEffect(() => {
    if (!pickup || pickup === "") {
      navigate("/home");
      return;
    }

    const fetchDistanceTime = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/maps/get-distance-time`,
          {
            params: { origin: pickup, destination: destination },
            headers: {
              Authorization: `Bearer ${localStorage.getItem("usertoken")}`,
            },
          }
        );

        dispatch(
          setRideData({
            distance: response.data.distance,
            time: response.data.duration,
          })
        );
      } catch (error) {
        console.error("Error fetching distance and time:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDistanceTime();
  }, [pickup, destination, navigate, dispatch]);

  const handleCancelRide = () => {
    const tl = gsap.timeline();
    tl.to(".ride-details", {
      opacity: 0,
      height: 0,
      duration: 0.3,
      onComplete: () => {
        dispatch(
          setRideData({
            pickup: "",
            destination: "",
            price: "",
            vehicletype: "",
          })
        );
        navigate("/home");
      },
    });
  };

  // Function to truncate text if it exceeds the max length
  const truncateText = (text, maxLength = 60) => {
    if (!text) return "";
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };

  const makePayment = async () => {
    try {
      setIsProcessing(true);

      // 1️⃣ Create an order on the backend
      const { data } = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/payments/create-order`,
        { amount: price, currency: "INR" },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("usertoken")}`,
          },
        }
      );

      if (!data.success || !data.order) {
        throw new Error("Failed to create order");
      }

      // 2️⃣ Initialize Razorpay Payment
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "Routeify",
        description: "Ride Payment",
        order_id: data.order.id,
        handler: async function (response) {
          console.log("Payment Success:", response);

          // 3️⃣ Verify Payment on Backend
          const verifyResponse = await axios.post(
            `${import.meta.env.VITE_BASE_URL}/payments/verify-payment`,
            response
          );

          if (verifyResponse.data.success) {
            setPaymentStatus("success");
            dispatch(
              setRideData((prev) => ({
                ...prev,
                paymentComplete: true,
                paymentTime: new Date().toISOString(),
              }))
            );

            setTimeout(() => navigate("/riding"), 1500);
          } else {
            setPaymentStatus("error");
          }
        },
        prefill: {
          name: "John Cena",
          email: "john@example.com",
          contact: "9999999999",
        },
        theme: { color: "#3399cc" },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
      razorpay.on("payment.failed", function (response) {
        console.error("Payment Failed:", response.error);
        setPaymentStatus("error");
      });
    } catch (error) {
      console.error("Payment failed:", error);
      setPaymentStatus("error");
    } finally {
      setTimeout(() => setIsProcessing(false), 2000);
    }
  };

  // Function to create a ride
  const createRide = async () => {
    const rideDetails = {
      "pickup":pickup,
      "destination":destination,
      "vehicleType":vehicletype
    }
    try {
      setIsProcessing(true);
      const token = localStorage.getItem("usertoken");
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/rides/create`, 
        rideDetails,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Ride created successfully:", response.data);
      dispatch(setRideData(response.data));
      setPaymentStatus("success");
    } catch (error) {
      console.error("Error creating ride:", error);
      setPaymentStatus("error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmRide = () => {
    const rideDetails = {
      pickup: "Your pickup location", // Replace with actual data
      destination: "Your destination", // Replace with actual data
      vehicleType: "Your vehicle type", // Add vehicle type
      // Add any other necessary ride details here
    };

    createRide(rideDetails);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <svg
          className="animate-spin h-10 w-10 text-black"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          ></path>
        </svg>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center bg-gray-100 p-5 rounded-xl animate-fade-in">
      <div className="ride-details w-full">
        <div className="w-full flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-black">Reaching to you in</h1>
          <div className="bg-black text-white rounded-full px-4 py-1 text-base">
            {2} mins
          </div>
        </div>

        <div className="h-[2px] w-full bg-gray-300 mb-4"></div>

        <div className="w-full flex items-center space-x-4 mb-4">
          <img
            className="h-16 w-16 rounded-full object-cover border-2 border-gray-200"
            src="https://static.vecteezy.com/system/resources/previews/036/594/092/non_2x/man-empty-avatar-photo-placeholder-for-social-networks-resumes-forums-and-dating-sites-male-and-female-no-photo-images-for-unfilled-user-profile-free-vector.jpg"
            alt="Driver Avatar"
          />
          <div className="text-black">
            <h5 className="text-base font-medium">John Cena</h5>
            <h2 className="text-lg font-bold">PB 10 BP 7401</h2>
            <h3 className="text-base">Yellow Porsche 911 Canvas</h3>
            <h4 className="flex items-center text-base text-yellow-500">
              <i className="ri-star-fill mr-1"></i> 4.4
            </h4>
          </div>
        </div>

        <div className="w-full flex justify-around text-xl text-white mt-6 mb-4">
          <div className="flex flex-col items-center">
            <i className="ri-shield-fill bg-blue-500 p-3 rounded-full w-12 h-12 flex items-center justify-center"></i>
            <p className="text-xs text-gray-600 mt-1">Safety</p>
          </div>
          <div className="flex flex-col items-center">
            <i className="ri-user-shared-fill bg-blue-500 p-3 rounded-full w-12 h-12 flex items-center justify-center"></i>
            <p className="text-xs text-gray-600 mt-1">Share</p>
          </div>
          <div className="flex flex-col items-center">
            <i className="ri-phone-fill bg-blue-500 p-3 rounded-full w-12 h-12 flex items-center justify-center"></i>
            <p className="text-xs text-gray-600 mt-1">Contact</p>
          </div>
        </div>

        <div className="h-[2px] w-full bg-gray-300 mb-4"></div>

        <div className="w-full text-gray-700 space-y-1">
          <p className="text-sm">
            <strong>From:</strong> {truncateText(pickup)}
          </p>
          <p className="text-sm">
            <strong>To:</strong> {truncateText(destination)}
          </p>
          <p className="text-sm">
            <strong>Total Distance:</strong> {distance}
          </p>
          <p className="text-sm">
            <strong>Total Time:</strong> {time}
          </p>
          <p className="text-sm">
            <strong>Total Price:</strong>{" "}
            <span className="text-green-600">₹{price}</span>
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleCancelRide}
            className="mt-5 bg-red-500 hover:bg-red-600 text-white w-1/2 py-3 px-4 rounded-md transition"
          >
            Cancel Ride
          </button>
          <button
            onClick={handleConfirmRide}
            className="mt-5 bg-green-500 hover:bg-green-600 text-white w-1/2 py-3 px-4 rounded-md transition flex items-center justify-center"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <svg
                className="animate-spin h-5 w-5 mr-2 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                ></path>
              </svg>
            ) : (
              `Confirm Ride`
            )}
          </button>
        </div>

        {paymentStatus === "success" && (
          <div className="mt-4 text-center">
            <img
              src={payment_success}
              alt="Payment Success"
              className="w-24 mx-auto"
            />
            <p className="text-green-600 font-bold">Ride created successfully!</p>
          </div>
        )}

        {paymentStatus === "error" && (
          <div className="mt-4 text-center">
            <img
              src={payment_error}
              alt="Payment Failed"
              className="w-24 mx-auto"
            />
            <p className="text-red-600 font-bold">
              Error creating ride. Please try again.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfirmRide;
