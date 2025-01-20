const initialState = {
  pickup: '',
  destination: '',
  price: '',
  distance: '',
  time: '',
  vehicletype: ''
};

const rideReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_RIDE_DATA':
      return {
        ...state,
        ...action.payload
      };
    default:
      return state;
  }
};

export default rideReducer;