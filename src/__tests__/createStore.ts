import { applyMiddleware } from 'redux'
import * as sinon from 'sinon'
import createDynamicStore from '../createStore'

const MockAction = 'FOO'

const MockReducer = (state = 'default', action: any) => {
  if (action.type === MockAction) return action.payload

  return state
}

const mockReducerMap = {
  myData: MockReducer,
}

const mockInitialState = {
  myData: 'initial',
}

const mockDynamicReducerMap = {
  myModuleData: MockReducer,
}

const mockEhancerHandler = sinon.stub()
const mockEhancer = (store: any) => (next: any) => (action: any) => {
  let result = next(action)
  mockEhancerHandler()
  return result
}

let mockStore: any
describe('createDynamicStore', () => {
  beforeEach(() => {
    mockStore = createDynamicStore(
      mockReducerMap,
      mockInitialState,
      applyMiddleware(mockEhancer),
    )
    mockStore.subscribe
  })
  it('Should return a function', () => {
    expect(createDynamicStore).toBeInstanceOf(Function)
  })
  it('Should have "registerDynamicModule" property', () => {
    expect(mockStore).toHaveProperty('registerDynamicModule')
  })
  it('Should have "unRegisterDynamicModule" property', () => {
    expect(mockStore).toHaveProperty('unRegisterDynamicModule')
  })
  it('Should persist initial state', () => {
    const actual = mockStore.getState()
    const expected = {
      myData: 'initial',
    }
    expect(actual).toEqual(expected)
  })
  it('Should allow for side effects via applyMiddleware', () => {
    mockStore.dispatch({
      type: MockAction,
      payload: 'foo',
    })

    sinon.assert.called(mockEhancerHandler)
  })
  it('Should dispatch actions', () => {
    mockStore.dispatch({
      type: MockAction,
      payload: 'foo',
    })
    const actual = mockStore.getState()
    const expected = {
      myData: 'foo',
    }
    expect(actual).toEqual(expected)
  })
  describe('Dynamically registering modules', () => {
    beforeEach(() => {
      mockStore.registerDynamicModule({
        name: 'moduleA',
        reducers: mockDynamicReducerMap,
      })
    })
    it('Should persist initial state', () => {
      const actual = mockStore.getState()
      const expected = {
        myModuleData: 'default',
      }
      expect(actual.moduleA).toEqual(expected)
    })
    it('Should persist dispatched data', () => {
      mockStore.dispatch({
        type: MockAction,
        payload: 'baz',
      })
      const actual = mockStore.getState()
      const expected = {
        myModuleData: 'baz',
      }
      expect(actual.moduleA).toEqual(expected)
    })
  })
  describe('Dynamically unregistering modules', () => {
    beforeEach(() => {
      mockStore.registerDynamicModule({
        name: 'moduleB',
        reducers: mockDynamicReducerMap,
      })
    })
    it('Should stop actions from updating the modules state', () => {
      mockStore.unRegisterDynamicModule('moduleB')
      mockStore.dispatch({
        type: MockAction,
        payload: 'baz',
      })
      const actual = mockStore.getState()
      const expected = {
        myModuleData: 'default',
      }
      expect(actual.moduleB).toEqual(expected)
    })
  })
})
