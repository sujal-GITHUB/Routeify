import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setRideData } from "../../actions/rideActions";
import gsap from "gsap";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import payment_success from "../../assets/payment-success.png";
import payment_error from "../../assets/payment-error.png";
import { socketContext } from "../../context/socketContext";

export const RatingStars = ({ rating }) => {
  const ratingNum = parseFloat(rating);
  const fullStars = Math.floor(ratingNum);
  const hasHalfStar = ratingNum % 1 !== 0;
  
  return (
    <div className='flex flex-col items-end '>
        <div className="flex items-center">
      {[...Array(fullStars)].map((_, index) => (
        <i key={`full-${index}`} className="ri-star-fill text-yellow-500"></i>
      ))}
      {hasHalfStar && <i className="ri-star-half-fill text-yellow-500"></i>}
      {[...Array(5 - Math.ceil(ratingNum))].map((_, index) => (
        <i key={`empty-${index}`} className="ri-star-line text-yellow-500"></i>
      ))}
    </div>
    <div className="ml-1 font-semibold text-3xl">{rating}</div>
    </div>
  );
};

const ConfirmRide = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const { socket } = useContext(socketContext);
  const navigate = useNavigate();
  const {
    user,
    captain,
    pickup,
    destination,
    price,
    _id,
    distance,
    time,
    otp,
  } = useSelector((state) => state.ride);

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
  }, [pickup, destination, navigate, dispatch, captain]);

  const handleCancelRide = () => {
    gsap.to(".ride-details", {
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

  const truncateText = (text, maxLength = 60) => {
    return text?.length > maxLength
      ? `${text.slice(0, maxLength)}...`
      : text || "";
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
      if (isLeftButton) {
        handleCancelRide();
      } else {
        // First send OTP to captain
        if (captain?.socketId && otp) {
          socket.emit("send-otp", {
            otp: otp.toString(),
            socketId: captain.socketId,
          });
        }

        // Then emit confirm-ride event
        socket.emit("confirm-ride", {
          rideId: _id,
          userId: user,
        });

        socket.on("ride-confirmation-success", () => {
          setShowPaymentMethods(true);
        });

        socket.on("error", (error) => {
          console.error("Error:", error);
          alert("Failed to confirm ride. Please try again.");
        });
      }
    }
  };

  // Update the cleanup useEffect
  useEffect(() => {
    return () => {
      socket.off("otp-sent-confirmation");
      socket.off("ride-confirmation-success");
      socket.off("error");
    };
  }, [socket]);

  useEffect(() => {
    socket.on("ride-completed", (data) => {
      // Navigate to success page with ride data
      navigate("/success", {
        state: {
          pickup: data.pickup,
          destination: data.destination,
          fare: data.fare,
        },
      });
    });

    return () => {
      socket.off("ride-completed");
    };
  }, [socket, navigate]);

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
    <>
      <div className='bg-gray-100 p-4 rounded-xl'>
        <div className="w-full flex justify-between mb-4">
          <div className="w-full flex items-start space-x-4">
            <div className="flex justify-center h-full items-center">
            <img
              className="h-16 w-16 rounded-full object-cover border-2 border-gray-200"
              src="https://static.vecteezy.com/system/resources/previews/036/594/092/non_2x/man-empty-avatar-photo-placeholder-for-social-networks-resumes-forums-and-dating-sites-male-and-female-no-photo-images-for-unfilled-user-profile-free-vector.jpg"
              alt="Driver Avatar"
            />
            </div>
            <div className="flex-1 text-black">
              <h5 className="text-base font-medium">
                {captain?.fullname ? 
                  `${
                    captain.fullname.firstname.charAt(0).toUpperCase() +
                    captain.fullname.firstname.slice(1)
                  } ${
                    captain.fullname.lastname.charAt(0).toUpperCase() +
                    captain.fullname.lastname.slice(1)
                  }` : 'Driver'}
              </h5>

              <h2 className="text-lg font-bold">{captain?.vehicle?.plate || "XYZ 1234"}</h2>
              <h3 className="text-base">{captain?.vehicle?.vehicleType || "Car"}</h3>
            </div>
            <div className="flex-1 flex justify-end">
              <RatingStars rating={captain?.rating || "4.5"} />
            </div>
          </div>    
        </div>

        {otp && (
            <div className="flex flex-col items-center justify-center bg-gray-50 px-4 py-2 rounded-lg border border-gray-300">
              <span className="text-base text-black font-semibold mb-1">OTP</span>
              <span className="text-3xl font-bold text-black">{otp}</span>
            </div>
          )}

        <div className="w-full flex justify-around text-xl text-white mt-6 mb-4">
          <div className="flex flex-col items-center">
            <i className="ri-shield-fill bg-black p-3 rounded-full w-12 h-12 flex items-center justify-center"></i>
            <p className="text-xs text-black mt-1">Safety</p>
          </div>
          <div className="flex flex-col items-center">
            <i className="ri-user-shared-fill bg-black p-3 rounded-full w-12 h-12 flex items-center justify-center"></i>
            <p className="text-xs text-black mt-1">Share</p>
          </div>
          <div className="flex flex-col items-center">
            <i className="ri-phone-fill bg-black p-3 rounded-full w-12 h-12 flex items-center justify-center"></i>
            <p className="text-xs text-black mt-1">Contact</p>
          </div>
        </div>

        <div className="h-[2px] w-full bg-gray-300 mb-4"></div>

        {!paymentStatus && (
          <div>
            <div className="w-full text-black space-y-1">
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

            <div className="flex gap-3">
              <button
                onClick={() => handleButtonClick(true)}
                className={`mt-5 bg-red-500 hover:bg-red-600 text-white w-1/2 py-3 px-4 rounded-lg transition ${
                  isProcessing ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={isProcessing}
              >
                {showPaymentMethods ? "Cash" : "Cancel Ride"}
              </button>
              <button
                onClick={() => handleButtonClick(false)}
                className={`mt-5 bg-green-500 hover:bg-green-600 text-white w-1/2 py-3 px-4 rounded-lg transition flex items-center justify-center ${
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
                ) : showPaymentMethods ? (
                  "Online"
                ) : (
                  "Confirm Ride"
                )}
              </button>
            </div>
          </div>
        )}

        {paymentStatus && (
          <div className="mt-4 text-center">
            <img
              src={
                paymentStatus === "success" ? payment_success : payment_error
              }
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
    </>
  );
};

export default ConfirmRide;
