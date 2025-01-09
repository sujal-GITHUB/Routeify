const initialState = {
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    captainLicenseNumber: '',
  };
  
  const captainReducer = (state = initialState, action) => {
    switch (action.type) {
      case 'SET_CAPTAIN_DATA':  // Action to set captain data
        return {
          ...state,
          firstname: action.payload.firstname,
          lastname: action.payload.lastname,
          email: action.payload.email,
          password: action.payload.password,
          captainLicenseNumber: action.payload.captainLicenseNumber,
        };
      default:
        return state;
    }
  };
  
  export default captainReducer;
  