import React, { useState, forwardRef, useEffect, useContext } from 'react';
import { socketContext } from '../../context/socketContext';
import { useSelector } from 'react-redux';
import gsap from 'gsap'

const ConfirmRidePopup = forwardRef(({ setRides, onAccept,setNewRide, rideData, setRideStart }, ref) => {
  const [showFullP, setShowFullP] = useState(false);
  const [showFullD, setShowFullD] = useState(false);
  
  const captainData = useSelector((state) => state.captain);
  const { firstname, lastname, earning, rating, status, id } = captainData;

  const {socket} = useContext(socketContext);

  useEffect(() => {
    socket.on("available-rides", (data) => {
      setRides(data);
    });

    socket.on("ride-no-longer-available", () => {
      gsap.to(ref.current, {
        opacity: 0,
        scale: 0.9,
        y: 30,
        duration: 0.4,
        ease: "power2.in",
        onComplete: () => {
          setRideStart(false);
          setNewRide(null);
          
          gsap.to(ref.current, {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.4,
            ease: "power2.out",
          });
        },
      });
    });

    return () => {
      socket.off("available-rides");
      socket.off("ride-no-longer-available");
    };
  }, [socket]); 

  const acceptRide = () => {
    if (!rideData || !rideData.user) {
      return alert("Invalid ride data!");
    }
    socket.emit("accept-ride", { 
      userId: rideData.user, 
      captainId: id ,
      rideId: rideData._id,
    });
    onAccept();
  };

  return (
    <div ref={ref} className='bg-gray-100 h-92 w-full p-5 rounded-xl animate-slide-up mt-5'>
      <h1 className='text-lg font-semibold text-start mb-2'>Confirm Ride</h1>

      <div className='space-y-4'>
        {/* Pickup Location */}
        <div 
          className='bg-white p-4 py-2 rounded-xl shadow-sm cursor-pointer'
          onClick={() => setShowFullP(prev => !prev)}
        >
          <div className='flex items-center gap-2 mt-1'>
            <i className='ri-map-pin-2-fill text-green-500'></i>
            <div className='relative w-full'>
              <p 
                className={`font-medium transition-all duration-300 ease-in-out ${
                  showFullP ? 'max-h-[500px]' : 'max-h-30 overflow-hidden'
                }`}
              >
                {rideData?.pickup || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Destination Location */}
        <div 
          className='bg-white p-4 py-2 rounded-xl shadow-sm cursor-pointer'
          onClick={() => setShowFullD(prev => !prev)}
        >
          <div className='flex items-center gap-2 mt-1'>
            <i className='ri-map-pin-2-fill text-red-500'></i>
            <div className='relative w-full'>
              <p 
                className={`font-medium transition-all duration-300 ease-in-out ${
                  showFullD ? 'max-h-[500px]' : 'max-h-30 overflow-hidden'
                }`}
              >
                {rideData?.destination || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Ride Fare */}
        <div className='bg-white p-4 py-2 rounded-xl shadow-sm flex items-center justify-between'>
          <p className='text-gray-600 font-medium'>Ride Fare</p>
          <p className='text-lg font-semibold text-green-600'>₹{rideData?.fare || 0}</p>
        </div>

        {/* Confirm Ride Button */}
        <div className='flex gap-3 mt-6'>
          <button 
            onClick={acceptRide}
            className='w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl transition-colors font-medium'
          >
            Verify & Start Ride
          </button>
        </div>
      </div>
    </div>
  );
});

ConfirmRidePopup.displayName = "ConfirmRidePopup";

export default ConfirmRidePopup;
