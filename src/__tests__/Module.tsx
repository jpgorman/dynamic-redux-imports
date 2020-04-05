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

const waitForPromises = () => new Promise(resolve => setImmediate(resolve))

describe('<Module />', () => {
  it('Should render loading prop if module is not ready', () => {
    const Wrapper = mount(
      <Module
        loading="loading"
        resolve={() => Promise.resolve({ default: {} })}
      />,
    )
    expect(Wrapper.text()).toBe('loading')
  })
  it('Should render module view', async () => {
    const Wrapper = await mount(<Module resolve={mockModule} />)
    await waitForPromises()

    expect(Wrapper.text()).toBe('foo')
  })
  it('Should pass props other onto modules View component', async () => {
    const Wrapper = await mount(<Module foo="bar" resolve={mockModule} />)
    await waitForPromises()

    expect(Wrapper.text()).toBe('bar')
  })
  it('Should not render anything if no "view" exists in module', async () => {
    const Wrapper = await mount(
      <Module resolve={() => Promise.resolve({ default: { name: 'foo' } })} />,
    )
    await waitForPromises()

    expect(Wrapper.text()).toBe(null)
  })
  it('Should register module reducers with store', async () => {
    await mount(<Module resolve={mockModule} />, options)
    await waitForPromises()

    expect(mockStore.addModule).toHaveBeenCalledWith({
      name: 'module',
      reducers: mockReducer,
    })
  })
  it('Should unregister module reducers with store when unmounting', async () => {
    const Wrapper = await mount(<Module resolve={mockModule} />, options)
    await waitForPromises()

    Wrapper.unmount()
    expect(mockStore.removeModule).toBeCalledWith('module')
  })
})
