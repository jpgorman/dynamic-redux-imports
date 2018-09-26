import * as React from 'react'
import * as sinon from 'sinon'
import { mount } from 'enzyme'
import Module from '../Module'

const mockStore = {
  registerDynamicModule: sinon.stub(),
  unRegisterDynamicModule: sinon.stub(),
}

const mockReducer = {
  foo: (state = {}, action: any) => state,
}

const mockModule = Promise.resolve({
  default: {
    name: 'module',
    view: () => <div>foo</div>,
    reducers: mockReducer,
  },
})

const context = { store: mockStore }

const mockBadModule = Promise.reject(new Error('nope!'))

describe('<Module />', () => {
  beforeEach(() => {})
  it('Should render loading prop if module is not ready', () => {
    const Wrapper = mount(
      <Module loading="loading" resolve={Promise.resolve({ default: {} })} />,
    )
    expect(Wrapper.text()).toBe('loading')
  })
  it('Should render module view', async () => {
    const Wrapper = await mount(<Module resolve={mockModule} />, {
      context,
    })

    expect(Wrapper.text()).toBe('foo')
  })
  it('Should render error message if module throws', async () => {
    const BadWrapper = await mount(<Module resolve={mockBadModule} />)
    try {
    } catch {
      expect(BadWrapper.text()).toBe('nope!')
    }
  })
  it('Should show default text if no "view" exists in module', async () => {
    const Wrapper = await mount(
      <Module resolve={Promise.resolve({ default: { name: 'foo' } })} />,
    )
    expect(Wrapper.text()).toBe('Module Loaded')
  })
  it('Should register module reducers with store', async () => {
    await mount(<Module resolve={mockModule} />, {
      context,
    })
    sinon.assert.calledWith(mockStore.registerDynamicModule, {
      name: 'module',
      reducers: mockReducer,
    })
  })
  it('Should unregister module reducers with store when unmounting', async () => {
    const Wrapper = await mount(<Module resolve={mockModule} />, {
      context,
    })
    Wrapper.unmount()
    sinon.assert.calledWith(mockStore.unRegisterDynamicModule, 'module')
  })
})
