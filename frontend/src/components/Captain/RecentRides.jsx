import React from "react";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";

const RecentRides = () => {
  const captainData = useSelector((state) => state.captain);
  const {
    hoursOnline,
    kmDriven,
    totalRide
  } = captainData;

  return (
    <div>
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="bg-gray-100 p-4 rounded-xl text-center">
          <i className="ri-timer-2-line text-2xl text-black"></i>
          <h4 className="text-xl font-bold mt-2">{hoursOnline}</h4>
          <p className="text-xs text-gray-500">Hours Online</p>
        </div>
        <div className="bg-gray-100 p-4 rounded-xl text-center">
          <i className="ri-route-line text-2xl text-black"></i>
          <h4 className="text-xl font-bold mt-2">{kmDriven}</h4>
          <p className="text-xs text-gray-500">Km Driven</p>
        </div>
        <div className="bg-gray-100 p-4 rounded-xl text-center">
          <i className="ri-taxi-line text-2xl text-black"></i>
          <h4 className="text-xl font-bold mt-2">{totalRide}</h4>
          <p className="text-xs text-gray-500">Rides</p>
        </div>
      </div>
      <h3 className="font-semibold mt-4 mb-4">Recent Rides</h3>
      <div className="space-y-4">
        {[1, 2].map((ride) => (
          <div
            key={ride}
            className="bg-gray-100 p-4 rounded-xl flex justify-between items-center"
          >
            <div>
              <h4 className="font-medium">Civil Lines → Model Town</h4>
              <p className="text-sm text-gray-500">2.3 km • 15 mins ago</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">₹120</p>
              <p className="text-xs text-green-500">Completed</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentRides;
