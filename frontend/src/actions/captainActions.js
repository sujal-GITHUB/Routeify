import axios from 'axios';

export const setCaptainData = (captainData) => ({
    type: 'SET_CAPTAIN_DATA',
    payload: captainData, 
  });

  export const fetchCaptainData = () => async (dispatch) => {
    try {
      const token = localStorage.getItem("captaintoken");
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/captains/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const captainData = {
        email: response.data.captain.email,
        firstname: response.data.captain.fullname.firstname,
        lastname: response.data.captain.fullname.lastname,
        status: response.data.captain.status,
        vehicle: response.data.captain.vehicle,
        id: response.data.captain._id,
        rating: response.data.captain.rating,
        location: response.data.captain.location
      };
  
      dispatch({
        type: 'FETCH_CAPTAIN_DATA_SUCCESS',
        payload: captainData
      });
    } catch (error) {
      console.error("Fetch Error:", error);
      dispatch({
        type: 'FETCH_CAPTAIN_DATA_FAILURE',
        payload: error.message,
      });
    }
  };