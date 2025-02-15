const initialState = {
  firstname: '',
  lastname: '',
  email: '',
  id: '',
  loading: false,
  error: null,
  lastUpdatedDate: '',
};

const userReducer = (state = initialState, action) => {
  const currentDate = new Date().toLocaleDateString();

  switch (action.type) {
    case 'FETCH_USER_DATA_SUCCESS':
      // Check if the last updated date is different from the current date
      const isNewDay = state.lastUpdatedDate !== currentDate;

      return {
        ...state,
        firstname: action.payload.firstname || '',
        lastname: action.payload.lastname || '',
        email: action.payload.email || '',
        id: action.payload.id || '',
        loading: false,
        error: null,
        lastUpdatedDate: currentDate,
      };

    case 'FETCH_USER_DATA_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    default:
      return state;
  }
};

export default userReducer;
  