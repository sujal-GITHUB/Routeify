export const setUserData = (userData) => ({
    type: 'SET_USER_DATA',
    payload: userData,  
  });
  
export const FETCH_USER_DATA_REQUEST = 'FETCH_USER_DATA_REQUEST';
export const FETCH_USER_DATA_SUCCESS = 'FETCH_USER_DATA_SUCCESS';
export const FETCH_USER_DATA_FAILURE = 'FETCH_USER_DATA_FAILURE';

export const fetchUserDataRequest = () => ({
  type: FETCH_USER_DATA_REQUEST,
});

export const fetchUserDataSuccess = (userData) => ({
  type: FETCH_USER_DATA_SUCCESS,
  payload: userData,
});

export const fetchUserDataFailure = (error) => ({
  type: FETCH_USER_DATA_FAILURE,
  payload: error,
});

// Example of an async action to fetch user data
export const fetchUserData = () => {
  return async (dispatch) => {
    dispatch(fetchUserDataRequest()); // Dispatch request action
    try {
      const token = localStorage.getItem('usertoken')
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/users/profile`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      ); // Adjust the API endpoint as needed
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      
      const userData = {
        email: data.email,
        firstname: data.fullname.firstname,
        lastname: data.fullname.lastname,
        id: data._id,
      };

      dispatch(fetchUserDataSuccess(userData)); // Dispatch success action with userData
    } catch (error) {
      dispatch(fetchUserDataFailure(error.message));
    }
  };
};
  