import * as React from 'react'
import * as PropTypes from 'prop-types'
import { Reducer } from 'redux'
import { DynamicStore } from './createStore'

interface ModuleShape {
  name?: string
  reducers?: { [key: string]: Reducer }
  view?: React.StatelessComponent | React.ComponentClass
}

interface State {
  module?: ModuleShape
  hasError?: Error
}

interface Import {
  default: ModuleShape
}

type Props = {
  resolve: Promise<Import>
} & Partial<DefaultProps>

type Context = {
  store: DynamicStore
}

type DefaultProps = Readonly<typeof defaultProps>

const defaultProps = {
  loading: '',
}
const defaultState = {
  module: undefined,
  hasError: undefined,
}

export default class Module extends React.Component<Props, State> {
  static contextTypes = {
    store: PropTypes.object,
  }

  context: Context

  static defaultProps = defaultProps

  constructor(props: Props) {
    super(props)
    this.state = defaultState
  }

  async componentDidMount() {
    try {
      const { resolve } = this.props
      const { default: module } = await resolve
      const { name, reducers } = module
      const { store } = this.context
      if (name && store && reducers)
        store.registerDynamicModule({ name, reducers })
      this.setState({ module })
    } catch (error) {
      this.setState({ hasError: error })
    }
  }

  componentWillUnmount() {
    const { module } = this.state
    const { store } = this.context
    if (store && module != null && module.name != null)
      store.unRegisterDynamicModule(module.name)
  }

  render() {
    const { module, hasError } = this.state

    console.log(module)
    if (hasError) return <React.Fragment>{hasError.message}</React.Fragment>
    if (!module) return <React.Fragment>{this.props.loading}</React.Fragment>
    if (module.view != null) return React.createElement(module.view)
    return <React.Fragment>Module Loaded</React.Fragment>
  }
}
