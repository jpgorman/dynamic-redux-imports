import { createStore, combineReducers, Store, Reducer } from 'redux'
import * as invariant from 'invariant'

interface AddModule {
  name: string
  reducers: any
}

export interface DynamicStore extends Store<{}> {
  addModule({ name, reducers }: AddModule): void
  removeModule(name: string): void
  asyncReducers: any
}

interface StringMap<T> {
  [key: string]: T
}

const noopReducer = (state = {}) => state

const createStoreFactory = ({ createStore, combineReducers }: any) => (
  reducerMap: StringMap<Reducer>,
  ...rest: any[]
): DynamicStore => {
  const injectAsyncReducers = (
    store: DynamicStore,
    name: string,
    reducers: Object | Function,
  ) => {
    let asyncReducers
    if (typeof reducers === 'function') {
      asyncReducers = reducers
    }

    if (typeof reducers === 'object') {
      asyncReducers = combineReducers(reducers)
    }

    store.asyncReducers[name] = asyncReducers
    store.replaceReducer(
      combineReducers({
        ...reducerMap,
        ...store.asyncReducers,
      }),
    )
  }

  const store = createStore(combineReducers(reducerMap), ...rest)
  store.asyncReducers = {}
  store.addModule = ({ name, reducers }: AddModule) => {
    invariant(
      !store.asyncReducers.hasOwnProperty(name) ||
        store.asyncReducers[name] === noopReducer,
      `There are already reducers registered with under "${name}".`,
    )
    injectAsyncReducers(store, name, reducers)
  }
  store.removeModule = (name: string): void => {
    invariant(
      store.asyncReducers.hasOwnProperty(name),
      `There aren't any reducers registered under "${name}".`,
    )
    injectAsyncReducers(store, name, noopReducer)
  }

  return store
}

const createDynamicStore = createStoreFactory({ createStore, combineReducers })

type DynamicStoreCreator = (
  reducerMap: StringMap<Reducer>,
  ...rest: Array<any>
) => DynamicStore

export default createDynamicStore as DynamicStoreCreator
