import * as React from 'react'
import * as PropTypes from 'prop-types'
import { Reducer } from 'redux'
import { DynamicStore } from './createStore'

type ReactComponent = React.ComponentType<any>

interface ModuleShape {
  name?: string
  reducers?: { [key: string]: Reducer }
  view?: ReactComponent
}

interface State {
  module?: ModuleShape
  hasError?: Error
}

interface Import {
  default: ModuleShape
}

const defaultModuleProps = {
  loading: '',
}
const initialState = {
  module: undefined,
  hasError: undefined,
}

type DefaultModuleProps = Readonly<typeof defaultModuleProps>

type ModuleProps = {
  resolve: () => Promise<Import>
  loading?: string | ReactComponent
}

type Context = {
  store: DynamicStore
}

class Module extends React.Component<any, State> {
  static contextTypes = {
    store: PropTypes.object,
  }

  readonly context: Context

  readonly state: State = initialState

  readonly defaultModuleProps: DefaultModuleProps = defaultModuleProps

  async componentDidMount() {
    try {
      const { resolve } = this.props
      const { default: module } = await resolve()
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
    const { loading, resolve, ...rest } = this.props
    if (hasError) return <React.Fragment>{hasError.message}</React.Fragment>
    if (!module) return <React.Fragment>{this.props.loading}</React.Fragment>
    if (module.view != null) return React.createElement(module.view, rest)
    return <React.Fragment>Module Loaded</React.Fragment>
  }
}

const WithModuleProps = <P extends {}>(props: ModuleProps & P) => (
  <Module {...props} />
)

export default WithModuleProps
