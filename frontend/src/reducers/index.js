import { combineReducers } from 'redux';
import userReducer from './userReducer'; 
import captainReducer from './captainReducer';

const rootReducer = combineReducers({
  user: userReducer, 
  captain: captainReducer, 
});

export default rootReducer;
