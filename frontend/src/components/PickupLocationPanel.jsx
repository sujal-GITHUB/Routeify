import React from 'react';

const LocationSearchPanel = ({pickup,setPickup}) => {

  const locations = [
    { location: "Civil Lines, Ludhiana", state: "Ludhiana, Punjab" },
    { location: "Model Town, Ludhiana", state: "Ludhiana, Punjab" },
    { location: "Ferozepur Road, Ludhiana", state: "Ludhiana, Punjab" },
    { location: "Bhattian, Ludhiana", state: "Ludhiana, Punjab" },
    { location: "Dugri, Ludhiana", state: "Ludhiana, Punjab" },
    { location: "Sadar Bazar, Ludhiana", state: "Ludhiana, Punjab" },
    { location: "Kitchlu Nagar, Ludhiana", state: "Ludhiana, Punjab" },
    { location: "Charan Bagh, Ludhiana", state: "Ludhiana, Punjab" },
    { location: "Guru Nanak Nagar, Ludhiana", state: "Ludhiana, Punjab" },
    { location: "Jamalpur, Ludhiana", state: "Ludhiana, Punjab" },
    { location: "Bihar Colony, Ludhiana", state: "Ludhiana, Punjab" },
    { location: "Mandi, Ludhiana", state: "Ludhiana, Punjab" },
    { location: "Sherpur, Ludhiana", state: "Ludhiana, Punjab" },
    { location: "BRS Nagar, Ludhiana", state: "Ludhiana, Punjab" }
  ];

  // Function to handle pickup selection
  const submitPickup = (location) => {
    setPickup(location); 
  };

  return (
    <div className="p-3 rounded-t-2xl">
      {/* Panel Title with Map Pin Icon */}
      <div className="flex items-center gap-3 mb-3 w-full">
        <div className="flex flex-col w-full">
          {/* Map over locations array */}
          {locations.map((item, index) => (
            <div
              key={index}
              onClick={() => submitPickup(item.location)}  
              className={`mb-3 bg-white w-full p-3 rounded-xl border-2 border-transparent hover:border-black active:border-black transition-all duration-300 ${pickup === item.location ? 'border-black' : ''}`}
            >
              {/* Location with Map Pin Icon */}
              <div className="flex items-center gap-2 w-full">
                <i className="ri-map-pin-3-line text-gray-600"></i>
                <h4 className="text-sm font-medium text-gray-700">{item.location}</h4>
              </div>
              {/* State displayed directly below the location */}
              <h5 className="text-xs font-medium pl-6 text-gray-500">{item.state}</h5>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LocationSearchPanel;
