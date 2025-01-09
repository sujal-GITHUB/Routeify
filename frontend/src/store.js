import { createStore } from 'redux';
import rootReducer from './reducers';

// Create Redux store
const store = createStore(rootReducer);

export default store;
