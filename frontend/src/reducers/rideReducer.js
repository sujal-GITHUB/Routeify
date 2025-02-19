const initialState = {
  user: {},  // Should store user details
  captain: {}, // Should store captain details if assigned
  pickup: '',
  destination: '',
  price: '',
  distance: '',
  time: '',
  vehicletype: '',
  _id: '',
  otp: '' 
};

const rideReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_RIDE_DATA':
      return {
        ...state,
        ...action.payload  // Updating state with ride data
      };
    case 'CLEAR_RIDE':
      return initialState; // Reset ride data when needed
    default:
      return state;
  }
};

export default rideReducer;
