export const SET_RIDE_DATA = 'SET_RIDE_DATA';
export const UPDATE_CURRENT_RIDE = 'UPDATE_CURRENT_RIDE';
export const CLEAR_RIDE = 'CLEAR_RIDE';

export const setRideData = (rideData) => ({
    type: SET_RIDE_DATA,
    payload: rideData,  
});

export const updateCurrentRide = (rideData) => ({
    type: UPDATE_CURRENT_RIDE,
    payload: rideData
});

export const clearRide = () => ({
    type: CLEAR_RIDE
});
