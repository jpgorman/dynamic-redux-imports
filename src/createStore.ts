import { createStore, combineReducers, Store, Reducer } from 'redux'

interface IRegisterDynamicModule {
  name: string
  reducers: any
}

type TRegisterDynamicModule = (
  { name, reducers }: IRegisterDynamicModule,
) => void
type TUnregisterDynamicModule = (name: string) => void

export interface DynamicStore extends Store<{}> {
  registerDynamicModule: TRegisterDynamicModule
  unRegisterDynamicModule: TUnregisterDynamicModule
  asyncReducers?: any
}

interface StringMap<T> {
  [key: string]: T
}

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
  store.registerDynamicModule = ({
    name,
    reducers,
  }: IRegisterDynamicModule) => {
    console.info(`Registering module reducers for ${name}`)
    injectAsyncReducers(store, name, reducers)
  }
  store.unRegisterDynamicModule = (name: string) => {
    console.info(`Unregistering module reducers for ${name}`)
    const noopReducer = (state = {}) => state
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
