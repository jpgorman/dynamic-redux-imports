## Installation

```sh
$ npm install dynamic-redux-imports
```

## Why use this?

TL:DR; Dynamically load components and reducers into your app and redux store, whilst taking advantage of code-splitting to reduce your app's load time.

As apps become larger, it becomes more and more of a challenge to organise your code in to simple logical parts. This is especially true with redux and react.

This package aims to help resolve some of this complexity by allowing developers to split their code into distinct separate parts, each with access to the global redux store, but with the ability to register their components and reducers when they are required by the user. This us done using [webpack's dynamic imports](https://webpack.js.org/guides/code-splitting/#dynamic-imports) and [redux's replaceReducer functionality](https://reduxjs.org/api/store#replacereducer-next-reducer).

## Demo

[Here's a working example.](https://codesandbox.io/s/znx199wpmp)

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
Each module should have it's own components, reducers, actions etc. These should be exported using the following structure.

```js
export default {
    view: MyComponent,
    reducers: myReducers,
    name: 'myModule',
}
```

Here's an example of how each module should be exported.
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

### <Module />

```js
<Module resolve={() => import('path/to/module')} foo="bar" />
```

Renders `view` from `path/to/module` and registers `reducers` from module with store.

| Argument       | Type     | Requried | Description                                                                                                                                                                                                                                                                |
| -------------- | -------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| resolve           | Function   | true     | A function that wraps the import  method e.g. `() => import("path/to/module")`. This should be a closure to make the import load lazily.                    |

### createDynamicStore

```js
createDynamicStore(reducerDictionary, preloadedState, enhancer)
```

The only difference between `createDynamicStore` and reduxs `createStore` is that the first agrument should be a dictionary of reducers for your store. Other than that `createDynamicStore` works in exactly the same was as redux's `createStore`.  [See redux documentation for more detail.](https://redux.js.org/api/createstore)

```js
const fooReducer = (state, action) => Object.assign({}, state, action.payload)

const reducerDictionary = {
    foo: fooReducer
}

createDynamicStore(reducerDictionary)
```

| Argument       | Type     | Requried | Description                                                                                                                                                                                                                                                                |
| -------------- | -------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| reducerDictionary           | Object   | false     |  An object with properties that return a reducer.                    |
| preloadedState           | Object   | false     | The initial state of your store. [See details from redux docs](https://redux.js.org/api/createstore)                        |
| enhancer           | Function   | false     | A redux store enhancer. [See details from redux docs](https://redux.js.org/api/createstore)                     |
