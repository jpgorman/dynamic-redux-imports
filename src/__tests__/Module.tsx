import * as React from 'react'
import * as PropTypes from 'prop-types'
import { mount } from 'enzyme'
import { Module } from '../'

const mockStore = {
  addModule: jest.fn(),
  removeModule: jest.fn(),
}

const mockReducer = {
  foo: (state = {}, action: any) => state,
}

const View: React.ComponentType<any> = ({ foo = 'foo' }: { foo: string }) => (
  <div>{foo}</div>
)
View.displayName = 'View'

const mockModule = () =>
  Promise.resolve({
    default: {
      name: 'module',
      view: View,
      reducers: mockReducer,
    },
  })

const options = {
  context: { store: mockStore },
  childContextTypes: {
    store: PropTypes.object,
  },
}

const assertAfterPromiseHasResolved = (assertion: any) => (
  promise: Promise<any>,
  Wrapper: any,
) => {
  return promise
    .then(() => {
      Wrapper.update()
    })
    .then(assertion)
}

describe('<Module />', () => {
  it('Should not render anything when the module has no view', () => {
    const promise = mockModule()
    const Wrapper = mount(
      <Module resolve={() => Promise.resolve({ default: {} })} />,
    )

    return assertAfterPromiseHasResolved(() => {
      expect(Wrapper.text()).toBe(null)
    })(promise, Wrapper)
  })
  it('Should render module view', () => {
    const promise = mockModule()
    const Wrapper = mount(<Module resolve={mockModule} />)

    return assertAfterPromiseHasResolved(() => {
      expect(Wrapper.text()).toBe('foo')
    })(promise, Wrapper)
  })
  it('Should pass props other onto modules View component', () => {
    const promise = mockModule()
    const Wrapper = mount(<Module foo="bar" resolve={mockModule} />)

    return assertAfterPromiseHasResolved(() => {
      expect(Wrapper.text()).toBe('bar')
    })(promise, Wrapper)
  })
  it('Should register module reducers with store', () => {
    const promise = mockModule()
    const Wrapper = mount(<Module resolve={mockModule} />, options)

    return assertAfterPromiseHasResolved(() => {
      expect(mockStore.addModule).toHaveBeenCalledWith({
        name: 'module',
        reducers: mockReducer,
      })
    })(promise, Wrapper)
  })
  it('Should unregister module reducers with store when unmounting', () => {
    const promise = mockModule()
    const Wrapper = mount(<Module resolve={mockModule} />, options)

    return assertAfterPromiseHasResolved(() => {
      Wrapper.unmount()
      expect(mockStore.removeModule).toHaveBeenCalledWith('module')
    })(promise, Wrapper)
  })
})
