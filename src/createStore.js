import * as redux from 'redux';
import logger from 'redux-logger';

const {createStore: _createStore, applyMiddleware, combineReducers} = redux;

export default reducerMap => {
  const injectAsyncReducers = (store, name, reducers) => {
    let asyncReducers;

    if (typeof reducers === 'function') {
      asyncReducers = reducers;
    }

    if (typeof reducers === 'object') {
      asyncReducers = combineReducers(reducers);
    }

    store.asyncReducers[name] = asyncReducers;
    store.replaceReducer(
      combineReducers({
        ...reducerMap,
        ...store.asyncReducers,
      }),
    );
  };

  const store = _createStore(
    combineReducers(reducerMap),
    applyMiddleware(logger),
  );
  store.asyncReducers = {};
  store.registerDynamicModule = ({name, reducers}) => {
    console.info(`Registering module reducers for ${name}`);
    injectAsyncReducers(store, name, reducers);
  };
  store.unRegisterDynamicModule = name => {
    console.info(`Unregistering module reducers for ${name}`);
    const noopReducer = (state = {}) => state;
    injectAsyncReducers(store, name, noopReducer);
  };

  return store;
};
