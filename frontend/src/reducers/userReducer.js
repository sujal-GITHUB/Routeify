const initialState = {
    firstname: '',
    lastname: '',
    email: '',
    password: '',
  };
  
  const userReducer = (state = initialState, action) => {
    switch (action.type) {
      case 'SET_USER_DATA':
        return {
          ...state,
          firstname: action.payload.firstname,
          lastname: action.payload.lastname,
          email: action.payload.email,
          password: action.payload.password,
        };
      default:
        return state;
    }
  };
  
  export default userReducer;
  