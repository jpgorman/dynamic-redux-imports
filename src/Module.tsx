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
}

interface Import {
  default: ModuleShape
}

const defaultModuleProps = {
  loading: '',
}
const initialState = {
  module: undefined,
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

  _isMounted: boolean = false

  readonly context: Context

  readonly state: State = initialState

  readonly defaultModuleProps: DefaultModuleProps = defaultModuleProps

  async componentDidMount() {
    this._isMounted = true
    try {
      const { resolve } = this.props
      const { default: module } = await resolve()
      const { name, reducers } = module
      const { store } = this.context
      if (name && store && reducers) store.addModule({ name, reducers })
      this._isMounted && this.setState({ module })
    } catch (error) {
      throw error
    }
  }

  componentWillUnmount() {
    const { module } = this.state
    const { store } = this.context
    if (store && module != null && module.name != null) {
      store.removeModule(module.name)
    }
    this._isMounted = false
  }

  render() {
    const { module } = this.state
    const { loading, resolve, ...rest } = this.props
    if (module === undefined)
      return <React.Fragment>{this.props.loading}</React.Fragment>
    if (module && module.view != null)
      return React.createElement(module.view, rest)
    return null
  }
}

const WithModuleProps = <P extends {}>(props: ModuleProps & P) => (
  <Module {...props} />
)

export default WithModuleProps
