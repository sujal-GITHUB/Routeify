import { SET_RIDE_DATA, UPDATE_CURRENT_RIDE } from '../actions/rideActions';

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
    status: ''
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
        case 'CLEAR_RIDE':
            return initialState;
        default:
            return state;
    }
};

export default rideReducer;
