import * as React from 'react'
import * as PropTypes from 'prop-types'
import * as sinon from 'sinon'
import { mount } from 'enzyme'
import { Module } from '../'

const mockStore = {
  addModule: sinon.stub(),
  removeModule: sinon.stub(),
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

const mockBadModule = () => Promise.reject(new Error('nope!'))

describe('<Module />', () => {
  it('Should not render anything when the module has no view', async () => {
    const Wrapper = await mount(
      <Module resolve={() => Promise.resolve({ default: {} })} />,
    )
    expect(Wrapper.text()).toBe(null)
  })
  it('Should render module view', () => {
    const promise = mockModule()
    const Wrapper = mount(<Module resolve={mockModule} />)
    return promise
      .then(() => {
        Wrapper.update()
      })
      .then(() => {
        expect(Wrapper.text()).toBe('foo')
      })
      .catch(e => console.error(e))
  })
  it('Should pass props other onto modules View component', async () => {
    const Wrapper = await mount(<Module foo="bar" resolve={mockModule} />)

    expect(Wrapper.text()).toBe('bar')
  })
  it('Should throw when there is an error loading the module', async () => {
    const BadWrapper = await mount(<Module resolve={mockBadModule} />)
    try {
    } catch (e) {
      expect(() => BadWrapper.text()).toThrow()
    }
  })
  it('Should register module reducers with store', async () => {
    await mount(<Module resolve={mockModule} />, options)
    sinon.assert.calledWith(mockStore.addModule, {
      name: 'module',
      reducers: mockReducer,
    })
  })
  it('Should unregister module reducers with store when unmounting', async () => {
    const Wrapper = await mount(<Module resolve={mockModule} />, options)
    Wrapper.unmount()
    sinon.assert.calledWith(mockStore.removeModule, 'module')
  })
})
