import React from "react";

const VehiclePanel = ({rides, selectedRide, setSelectedRide, setPrice}) => {
  return (
    <div className="mt-6 mx-1 mb-1">
      <h2 className="font-semibold mb-5">Choose a ride</h2>
      <div className="space-y-3">
        {rides.map((ride) => (
          <button
            key={ride.id}
            type="button"
            onClick={() => {
              setSelectedRide(ride.id)
              setPrice(ride.price)
            }}
            className={`w-full bg-gray-100 p-4 rounded-xl flex items-center justify-between transition-all ${
              selectedRide === ride.id ? "ring-2 ring-black" : ""
            }`}
          >
            <div className="flex items-center gap-4">
              <img src={ride.image} alt={ride.name} className="h-16 w-auto" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{ride.name}</span>
                  <span className="text-xs text-gray-600">
                    <i className="ri-user-fill" /> {ride.capacity}
                  </span>
                </div>
                <p className="text-sm text-start">{ride.waitTime} away</p>
                <p className="text-xs text-gray-600 text-start">{ride.description}</p>
              </div>
            </div>
            <span className="font-semibold">{ride.price}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default VehiclePanel;
