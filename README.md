[![build Status](https://travis-ci.com/jpgorman/dynamic-redux-imports.svg?branch=master)](https://travis-ci.com/jpgorman/dynamic-redux-imports)
[![npm version](https://badge.fury.io/js/dynamic-redux-imports.svg)](https://badge.fury.io/js/dynamic-redux-imports)

## Why use this?

TL:DR; Dynamically load components and reducers into your app and redux store, whilst taking advantage of code-splitting to reduce your app's load time.

As apps become larger, it becomes more and more of a challenge to organise your code in to simple logical parts. This is especially true with redux and react.

This package aims to help resolve some of this complexity by allowing developers to split their code into distinct separate parts, each with access to the global redux store, but with the ability to register their components and reducers when they are required by the user. This is done using [webpack's dynamic imports](https://webpack.js.org/guides/code-splitting/#dynamic-imports) and [redux's replaceReducer functionality](https://reduxjs.org/api/store#replacereducer-next-reducer).

## Installation

```sh
$ npm install dynamic-redux-imports
```

## Demo

[Here's a working example.](https://codesandbox.io/s/wnyr7o0m3l)

## Usage
```js
// app.js
import {Module, createDynamicStore} from 'redux-dynamic-imports'
import { Provider } from "react-redux";

const store = createDynamicStore(reducers, initialState, applyMiddleware);

const App = () => (
    <Provider store={store}>
        <Module resolve={() => import("./my-module")} />
    </Provider>
)

ReactDOM.render(App, document.getElementById('root'))

// my-module
const MyComponent =  connect()(() => <div>some component</div>)

const myReducers = {
    noop: (state = {}, action) => state
}

export default {
    view: MyComponent,
    reducers: myReducers,
    name: 'myModule',
}
```

#### module structure
Each module should have it's own component(s), reducers, actions etc. These should be exported using the following structure.

```js
const MyComponent =  connect()(() => <div>some component</div>)

const myReducers = {
    count: (state = {}, action) => state
}

export default {
    view: MyComponent,
    reducers: myReducers,
    name: 'myModule',
}
```


## API

### Module

```js
<Module resolve={() => import('path/to/module')} foo="bar" />
```

Renders the `view` component from `path/to/module` and registers `reducers` from module with the redux store.

Also note that any outside of the API will be passed down to the imported component.

| Argument       | Type     | Requried | Description                                                                                                                                                                                                                                                                |
| -------------- | -------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| resolve           | Function   | true     | A function that wraps the import  method e.g. `() => import("path/to/module")`. This should be a closure to make the import load lazily.                    |
| loading           | React Component   | false     | Content that should be rendered whilst the module is bieng loadedContent that should be rendered whilst the module is bieng loaded. |

### createDynamicStore

```js
createDynamicStore(reducerDictionary, preloadedState, enhancer)
```

Returns a redux store that holds the state of your app. The store itself with have two additionaly methods `addModule` and `removeModule` that allow for new reducers to be dynamically added or removed from the store.

The only difference between `createDynamicStore` and redux's `createStore` is that the first argument should be a dictionary of reducers for your store. Other than that `createDynamicStore` works in exactly the same was as redux's `createStore`.  [See redux documentation for more detail.](https://redux.js.org/api/createstore).

```js
const fooReducer = (state, action) => Object.assign({}, state, action.payload)
const someReducer = (state, action) => Object.assign({}, state, action.payload)

const reducerDictionary = {
    foo: fooReducer
}

const store = createDynamicStore(reducerDictionary, preloadedState, enhancer)

store.addModule({name: 'foo', reducers: someReducer})
store.removeModule('foo')
```

| Argument       | Type     | Requried | Description                                                                                                                                                                                                                                                                |
| -------------- | -------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| reducerDictionary           | Object   | false     |  An object with properties that return a reducer.                    |
| preloadedState           | Object   | false     | The initial state of your store. [See details from redux docs](https://redux.js.org/api/createstore)                        |
| enhancer           | Function   | false     | A redux store enhancer. [See details from redux docs](https://redux.js.org/api/createstore)                     |

#### store.addModule
```js
const store = createDynamicStore(reducerDictionary, preloadedState, enhancer)
store.addModule({name: 'foo', reducers: someReducer})
```

When actions are handled by these reducers, the stores state will be updated under the namespace of `foo` e.g.

```js
Apps state

{
    foo: {
        ... modules state
    }
}
```

| Argument       | Type     | Requried | Description                                                                                                                                                                                                                                                                |
| -------------- | -------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| name           | String   | true     |  Unique identifier that will be used to register state for reducers.                    |
| reducers           | Function or Object   | true     |  Either a reducers function or a dictionary of reducer functions.                       |
#### store.removeModule
```js
store.removeModule('foo')
```

| Argument       | Type     | Requried | Description                                                                                                                                                                                                                                                                |
| -------------- | -------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| name           | String   | true     |  Unique identifier of reducers that you want to remove from the store. Note also that this doesn't destroy the state associated with the reducers, it simply unregisters the stores for this given module. New reducers can be added later under the same name to continue working with the same piece of state.                     |
