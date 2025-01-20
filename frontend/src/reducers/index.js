import { combineReducers } from 'redux';
import userReducer from './userReducer'; 
import captainReducer from './captainReducer';
import rideReducer from './rideReducer';

const rootReducer = combineReducers({
  user: userReducer, 
  captain: captainReducer, 
  ride: rideReducer
});

export default rootReducer;
