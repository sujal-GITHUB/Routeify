const initialState = {
  firstname: '',
  lastname: '',
  email: '',
  password: '',
  captainLicenseNumber: '',
  earning: 0,
  capacity: '',
  color: '',
  vehicleType: '',
  hoursOnline: 0,
  location: {},
  kmDriven: 0,
  totalRide: 0,
  rating: '',
  loading: false,
  id: '',
  status:'',
  error: null,
  lastUpdatedDate: null,
};

const captainReducer = (state = initialState, action) => {
  const currentDate = new Date().toLocaleDateString();

  switch (action.type) {
    case 'FETCH_CAPTAIN_DATA_SUCCESS':
      // Check if the last updated date is different from the current date
      const isNewDay = state.lastUpdatedDate !== currentDate;

      return {
        ...state,
        firstname: action.payload.firstname || '',
        lastname: action.payload.lastname || '',
        email: action.payload.email || '',
        captainLicenseNumber: action.payload.vehicle.plate || '',
        color: action.payload.vehicle.color || '',
        vehicleType: action.payload.vehicle.vehicleType || "",
        capacity: action.payload.vehicle.capacity || '',
        earning: isNewDay ? 0 : action.payload.earning || 0,
        hoursOnline: isNewDay ? 0 : action.payload.hoursOnline ,
        kmDriven: isNewDay ? 0 : action.payload.kmDriven || 0,
        totalRide: isNewDay ? 0 : action.payload.totalRide || 0,
        rating: action.payload.rating ,
        id: action.payload.id || '',
        location: action.payload.location,
        status: action.payload.status || '',
        loading: false,
        error: null,
        lastUpdatedDate: currentDate, // Update the last updated date
      };

    case 'FETCH_CAPTAIN_DATA_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case 'UPDATE_CAPTAIN_HOURS':
      return {
        ...state,
        hoursOnline: action.payload
      };

    default:
      return state;
  }
};

export default captainReducer;
