import { SET_RIDE_DATA, UPDATE_CURRENT_RIDE, SET_ETA } from '../actions/rideActions';

const initialState = {
    user: {},
    captain: {},
    pickup: '',
    destination: '',
    price: '',
    distance: '',
    time: '',
    vehicletype: '',
    _id: '',
    otp: '',
    status: '',
    eta: null,
    fare: ''
};

const rideReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_RIDE_DATA:
            return {
                ...state,
                ...action.payload
            };
        case UPDATE_CURRENT_RIDE:
            return {
                ...state,
                ...action.payload,
                status: action.payload.status || state.status
            };
        case SET_ETA:
            return {
                ...state,
                eta: action.payload.eta
            };
        case 'CLEAR_RIDE':
            return {
                ...initialState,
                eta: null
            };
        default:
            return state;
    }
};

export default rideReducer;
