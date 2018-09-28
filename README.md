## Installation

```sh
$ npm install dynamic-redux-imports
```

## Why use this?

As apps become larger, it becomes more and more of a challenge to organise your code in to simple logical parts. This is especially true with redux and react.

This package aims to help resolve some of this complexity by allowing developers to split their code into distinct separate parts, each with access to the global redux store, but with the ability to register their components and reducers when they are required by the user. This us done using [webpack's dynamic imports](https://webpack.js.org/guides/code-splitting/#dynamic-imports) and [redux's replaceReducer functionality](https://reduxjs.org/api/store#replacereducer-next-reducer).

This allows for your code to be split into `modules`. 

```sh
  src
```


Each module, then has it's own components, reducers, actions etc. These are then added to the global store lazily.
