import { applyMiddleware } from 'redux'
import * as sinon from 'sinon'
import { createDynamicStore } from '../'

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
  })
  it('Should return a function', () => {
    expect(createDynamicStore).toBeInstanceOf(Function)
  })
  it('Should have "addModule" property', () => {
    expect(mockStore).toHaveProperty('addModule')
  })
  it('Should have "removeModule" property', () => {
    expect(mockStore).toHaveProperty('removeModule')
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
      mockStore.addModule({
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
    it("Should throw an error when trying to register under a namespace that's already taken", () => {
      expect(() =>
        mockStore.addModule({
          name: 'moduleA',
          reducers: mockDynamicReducerMap,
        }),
      ).toThrow()
    })
    it('Should NOT throw when trying to addModule under a namespace was previously removed', () => {
      mockStore.removeModule('moduleA')
      expect(() =>
        mockStore.addModule({
          name: 'moduleA',
          reducers: mockDynamicReducerMap,
        }),
      ).not.toThrow()
    })
  })
  describe('Dynamically unregistering modules', () => {
    beforeEach(() => {
      mockStore.addModule({
        name: 'moduleB',
        reducers: mockDynamicReducerMap,
      })
    })
    it('Should stop actions from updating the modules state', () => {
      mockStore.removeModule('moduleB')
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
    it("Should throw an error when trying to unregister from a namespace that doesn't exist", () => {
      expect(() => mockStore.removeModule('zzz')).toThrow()
    })
  })
})
