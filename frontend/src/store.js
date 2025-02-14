import { createStore, applyMiddleware, compose } from 'redux';
import { thunk } from 'redux-thunk'
import rootReducer from './reducers';

// Enable Redux DevTools
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

// Create store with middleware and devtools
const store = createStore(
  rootReducer,
  composeEnhancers(applyMiddleware(thunk))
);

export default store;
