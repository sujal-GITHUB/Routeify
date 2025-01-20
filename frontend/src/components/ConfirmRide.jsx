import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setRideData } from '../actions/rideActions';
import gsap from 'gsap';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import payment_success from '../assets/payment-success.png';
import payment_error from '../assets/payment-error.png';

const ConfirmRide = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pickup, destination, price, distance, time } = useSelector(state => state.ride);

  useEffect(() => {
    if (!pickup || pickup === '') {
      navigate('/home');
    }
  }, [pickup, navigate]);

  const handleCancelRide = () => {
    const tl = gsap.timeline();
    
    tl.to('.ride-details', {
      opacity: 0,
      height: 0,
      duration: 0.3,
      onComplete: () => {
        dispatch(setRideData({
          pickup: '',
          destination: '',
          price: '',
          vehicletype: '',
        }));
        navigate("/home");
      }
    });
  };

  const makePayment = async () => {
    try {
      setIsProcessing(true);
      // Simulate API call
      const response = await new Promise((resolve, reject) => {
        setTimeout(() => {
          const success = Math.random() > 0.3;
          if (success) {
            resolve({ status: 'success' });
          } else {
            reject(new Error('Payment failed'));
          }
        }, 2000);
      });

      if (response.status === 'success') {
        setPaymentStatus('success');
        dispatch(setRideData({
          ...rideData,
          paymentComplete: true,
          paymentTime: new Date().toISOString()
        }));
        
        setTimeout(() => {
          navigate('/riding');
        }, 1500);
      }
    } catch (error) {
      console.error('Payment failed:', error);
      setPaymentStatus('error');
      setTimeout(() => {
        setPaymentStatus(null);
        setIsProcessing(false);
      }, 2000);
    }
  };

  return (
    <div className="w-full flex flex-col items-center bg-gray-100 p-5 rounded-xl animate-fade-in">
      <div className="ride-details w-full">
        {/* Header */}
        <div className="w-full flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-black">Reaching to you in</h1>
          <div className="bg-black text-white rounded-full px-4 py-1 text-base">
            2 mins
          </div>
        </div>

        {/* Divider */}
        <div className="h-[2px] w-full bg-gray-300 mb-4"></div>

        {/* Driver Info */}
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

        {/* Divider */}
        <div className="h-[2px] w-full bg-gray-300 mb-4"></div>

        {/* Ride Details */}
        <div className="w-full text-gray-700 space-y-1">
          <p className="text-sm"><strong>From:</strong> {pickup}</p>
          <p className="text-sm"><strong>To:</strong> {destination}</p>
          <p className="text-sm"><strong>Total Distance:</strong> {distance}</p>
          <p className="text-sm"><strong>Total Time:</strong> {time}</p>
          <p className="text-sm"><strong>Total Price:</strong> <span className="text-green-600">{price}</span></p>
        </div>

        <div className='flex gap-2'>
        <button 
          onClick={handleCancelRide}
          className="mt-5 bg-red-500 hover:bg-red-600 text-white w-1/2 py-3 px-4 rounded-md transition"
        >
          Cancel Ride
        </button>
        <button 
          onClick={makePayment}
          className="mt-5 bg-green-500 hover:bg-green-600 text-white w-1/2 py-3 px-4 rounded-md transition"
        >
          Pay {price}
        </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmRide;
