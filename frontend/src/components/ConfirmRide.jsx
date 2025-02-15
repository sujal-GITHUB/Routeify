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
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pickup, destination, price, distance, time, vehicletype } =
    useSelector((state) => state.ride);

  useEffect(() => {
    if (!pickup) {
      navigate("/home");
      return;
    }

    const fetchDistanceTime = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/maps/get-distance-time`,
          {
            params: { origin: pickup, destination },
            headers: {
              Authorization: `Bearer ${localStorage.getItem("usertoken")}`,
            },
          }
        );

        dispatch(setRideData({
          distance: response.data.distance,
          time: response.data.duration,
        }));
      } catch (error) {
        console.error("Error fetching distance and time:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDistanceTime();
  }, [pickup, destination, navigate, dispatch]);

  const handleCancelRide = () => {
    gsap.to(".ride-details", {
      opacity: 0,
      height: 0,
      duration: 0.3,
      onComplete: () => {
        dispatch(setRideData({
          pickup: "",
          destination: "",
          price: "",
          vehicletype: "",
        }));
        navigate("/home");
      },
    });
  };

  const truncateText = (text, maxLength = 60) => {
    return text?.length > maxLength ? `${text.slice(0, maxLength)}...` : text || "";
  };

  const handlePayment = async (paymentMethod) => {
    try {
      setIsProcessing(true);
      setPaymentStatus(null);

      if (paymentMethod === "online") {
        const { data } = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/payments/create-order`,
          { amount: price, currency: "INR" },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("usertoken")}`,
            },
          }
        );

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: data.order.amount,
          currency: data.order.currency,
          name: "Routeify",
          description: "Ride Payment",
          order_id: data.order.id,
          handler: async (response) => {
            const verifyResponse = await axios.post(
              `${import.meta.env.VITE_BASE_URL}/payments/verify-payment`,
              response
            );

            if (verifyResponse.data.success) {
              setPaymentStatus("success");
              setTimeout(() => navigate("/riding"), 1500);
            } else {
              setPaymentStatus("error");
            }
          },
          theme: { color: "#3399cc" },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.on("payment.failed", () => setPaymentStatus("error"));
        razorpay.open();
      } else {
        setTimeout(() => navigate("/riding"), 500);
      }
    } catch (error) {
      console.error("Payment failed:", error);
      setPaymentStatus("error");
    } finally {
      setIsProcessing(false);
    }
  };


  const handleButtonClick = (isLeftButton) => {
    if (showPaymentMethods) {
      isLeftButton ? handlePayment("cash") : handlePayment("online");
    } else {
      isLeftButton ? handleCancelRide() : setShowPaymentMethods(true);
    }
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
    <div className="w-full h-full flex flex-col items-center bg-gray-100 p-5 rounded-xl animate-fade-in">
      <div className="ride-details w-full">
        {/* Existing UI elements remain unchanged below */}
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

        {!paymentStatus && (
          <div>
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
            onClick={() => handleButtonClick(true)}
            className={`mt-5 bg-red-500 hover:bg-red-600 text-white w-1/2 py-3 px-4 rounded-md transition ${
              isProcessing ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isProcessing}
          >
            {showPaymentMethods ? "Cash" : "Cancel Ride"}
          </button>
          <button
            onClick={() => handleButtonClick(false)}
            className={`mt-5 bg-green-500 hover:bg-green-600 text-white w-1/2 py-3 px-4 rounded-md transition flex items-center justify-center ${
              isProcessing ? "opacity-50 cursor-not-allowed" : ""
            }`}
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
              showPaymentMethods ? "Online" : "Confirm Ride"
            )}
          </button>
        </div>
          </div>
        ) }

        {paymentStatus && (
          <div className="mt-4 text-center">
            <img
              src={paymentStatus === "success" ? payment_success : payment_error}
              className="mx-auto h-24 w-24"
              alt="Payment Status"
            />
            <p className="mt-2 font-semibold">
              {paymentStatus === "success"
                ? "Payment Successful!"
                : "Payment Failed"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfirmRide;