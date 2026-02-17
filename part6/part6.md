# Flux architecture

Flux-architecture is made to make state management of react apps easier. In flux, the state is seperated from the react components and into its own stores. State in the store is not changed directly, but with different actions. When an action changes the state of the store, the views are rendered:
```
Action --> Dispatcher --> Store --> View
```
If some action on the application, for example pushing a button, causes the need to change the state, the change is made with an action. This causes re-rendering the view again. Flux offers a standard way for how and where the applications state is kept and how it is modified.

# Redux

In this course we will use the redux library. It works with the same principle but is a bit simpler then facebooks implementation for flux. Facebook also uses redux now instead of their original flux. We will get to know redux by implementing a counter application yet again. First we will create a new vite application and install redux with the command:
```
npm install redux
```
As in flux, in redux the state is also stored in a store. The whole state of the application is stored in one js object in the store. Because our application only needs the value of the counter, we will save it straight to the store. If the state was more complicated, different things in the state would be saved as seperate fields of the object.

The state of the store is changed with actions. Actions are objects, which have at least a field determining the type of the action. Our application needs for example the following actions:
```javascript
{
  type: 'INCREMENT'
}
```
If there is data involved with the action, other fields can be declared as needed. However, our counting app is so simple that the actions are fine with just the type field. The impact of the action to the state of the application is defined using a reducer. In practice, a reducer is a function that is given the current state and an action as parameters. It returns a new state. We can define a reducer for our application at `main.jsx`. The file will initially look like this:
```javascript
const counterReducer = (state, action) => {
  if (action.type === 'INCREMENT') {
    return state + 1
  } else if (action.type === 'DECREMENT') {
    return state - 1
  } else if (action.type === 'ZERO') {
    return 0
  }

  return state
}
```
The first parameter is the state in the store. The reducer returns a new state based on the `action` type. So, e.g. when the type of action is `INCREMENT`, the state gets the old value plus one. We can change the code a bit, we have used if-else statements, however, the switch statement is the most common approach to writing a reducer. Lets also define a default value of 0 for the parameter state. Now the reducer works even if the store state has not been primed yet.
```javascript
const counterReducer = (state = 0, action) => {
  switch (action.type) {
    case 'INCREMENT':
      return state + 1
    case 'DECREMENT':
      return state - 1
    case 'ZERO':
      return 0
    default: // if none of the above matches, code comes here
      return state
  }
}
```
The reducer is never supposed to be called directly from the applications code. It is only given as a parameter to the `createStore` function which creates the store:
```javascript
import { createStore } from 'redux'

const counterReducer = (state = 0, action) => {
  switch (action.type) {
    case 'INCREMENT':
      return state + 1
    case 'DECREMENT':
      return state - 1
    case 'ZERO':
      return 0
    default:
      return state
  }
}


const store = createStore(counterReducer)
```
The store now uses the reducer to handle actions, which are dispatched or 'sent' to the store with its dispatch method.
```javascript
store.dispatch({ type: 'INCREMENT' })
```
This will increment state by 1. Another important method that the store has is `subscribe`, which is used to create callback functions that the store calls whenever an action is dispatched to the store. If, for example, we would add the following function to subscribe, every change in the store would be printed to the console.
```javascript
store.subscribe(() => {
  const storeNow = store.getState()
  console.log(storeNow)
})
```

# Pure functions, immutable

The initial version of the reducer is very simple:
```javascript
const noteReducer = (state = [], action) => {
  switch (action.type) {
    case 'NEW_NOTE':
      state.push(action.payload)
      return state
    default:
      return state
  }
}
```
The application works with this reducer, but the reducer we declared is bad. It breaks the basic assumption that reducers must be pure functions. Pure functions are such, that they do not cause any side effects and they must always returns the same response when called with the same parameters. We added the note to the state with the method `state.push(action.payload)` which changes the state of the state-object. This is not allowed. The problem is easily solved by using the `concat` method, which creates a new array, which contains all the elements of the old array and the new.
```javascript
return state.concat(action.payload)
```
A reducer state must be composed of immutable objects. If there is a change in the statem the old objects is not changed, but replaced with a new, changed, object. This is exactly what we did with the new reducer: the older array is replaced with the new one.

# Configuring test environment

We will first install vitest as a dev tool with `npm install --save-dev vitest` then create a script for running the vitest command. To make testing easier we will move the reducers code to its own module `src/reducers/noteReducer.js`. We will also add the library `deep-freeze`, which can be used to ensure that the reducer has been correctly defined as an immutable function. We can install the library as a development dependency:
```
npm install --save-dev deep-freeze
```

# Tests for noteReducer

We can create a test for our `noteReducer` function as `src/reducers/noteReducer.test.js`, the test will contain the code:
```javascript
import deepFreeze from 'deep-freeze'
import { describe, expect, test } from 'vitest'
import noteReducer from './noteReducer'

describe('noteReducer', () => {
  test('returns new state with action NEW_NOTE', () => {
    const state = []
    const action = {
      type: 'NEW_NOTE',
      payload: {
        content: 'the app state is in redux store',
        important: true,
        id: 1
      }
    }

    deepFreeze(state)
    const newState = noteReducer(state, action)

    expect(newState).toHaveLength(1)
    expect(newState).toContainEqual(action.payload)
  })
})
```

# Array spread syntax

We can refactor some of our code with array spread syntax. Adding a new note creates the state returned from the arrays `concat` functtion. We can acheive the by using javascripts array spread syntax:
```javascript
const noteReducer = (state = [], action) => {
  switch(action.type) {
    case 'NEW_NOTE':

      return [...state, action.payload]
    case 'TOGGLE_IMPORTANCE': {
      // ...
    }
    default:
    return state
  }
}
```
The spread syntax works like this. If we declare:
```javascript
const numbers = [1, 2, 3]
```
`...numbers` breaks the array up into individual elements, which can be placed in another array.
```javascript
[...numbers, 4, 5]
```
The result would be `[1, 2, 3, 4, 5]`

When we take elements from an array by destructuring, a similar looking syntaxz is used to gather the rest of the elements:
```javascript
const numbers = [1, 2, 3, 4, 5, 6]

const [first, second, ...rest] = numbers

console.log(first)     // prints 1
console.log(second)   // prints 2
console.log(rest)     // prints [3, 4, 5, 6]
```

# Uncontrolled form

We can expand the functionality of our `note-redux` application:
```javascript
// ...


const generateId = () => Number((Math.random() * 1000000).toFixed(0))

const App = () => {

  const addNote = event => {
    event.preventDefault()
    const content = event.target.note.value
    event.target.note.value = ''
    store.dispatch({
      type: 'NEW_NOTE',
      payload: {
        content,
        important: false,
        id: generateId()
      }
    })
  }


  const toggleImportance = id => {
    store.dispatch({
      type: 'TOGGLE_IMPORTANCE',
      payload: { id }
    })
  }

  return (
    <div>

      <form onSubmit={addNote}>
        <input name="note" /> 
        <button type="submit">add</button>
      </form>
      <ul>
        {store.getState().map(note => (

          <li key={note.id} onClick={() => toggleImportance(note.id)}>
            {note.content} <strong>{note.important ? 'important' : ''}</strong>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ...
```
Note that we have not bound the state of the form fields to the state of the app component like we have previously done. React calls this kind of form uncontrolled. Uncontrolled forms have certain limitations (for example, dynamic error messages or disabling the submit button based on input are not possible). However they are suitable for our current needs.

# Action creators

React components dont need to know redux action types and forms. We can seperate creating actions into seperate functions:
```javascript
const createNote = content => {
  return {
    type: 'NEW_NOTE',
    payload: {
      content,
      important: false,
      id: generateId()
    }
  }
}

const toggleImportanceOf = id => {
  return {
    type: 'TOGGLE_IMPORTANCE',
    payload: { id }
  }
}
```
Functions that create actions are called action creators.

The app component does not have to know anything about the inner representation of the actions anymore, it just gets the right action by calling the creator function:
```javascript
const App = () => {
  const addNote = event => {
    event.preventDefault()
    const content = event.target.note.value
    event.target.note.value = ''

    store.dispatch(createNote(content))
    
  }
  
  const toggleImportance = id => {

    store.dispatch(toggleImportanceOf(id))
  }

  // ...
}
```

# Forwarding redux store to various components

Aside from our reducer, our application is in one file. This is of course not sensible, and we should seperate App into its own module. The question is, how can the app access the store after the move? And more broadly, when a component is composed of many smaller components, there must be a way for all of the components to access the store.

There are multiple ways to share the redux store with components. First, we will look into the newest, and possibly the easiest way, which is using the `hooks` API of the `react-redux` library. We can install this with:
```
npm install react-redux
```
We can reorganize the application code into different files. Our `main.jsx` file will now look like this:
```javascript
import ReactDOM from 'react-dom/client'
import { createStore } from 'redux'
import { Provider } from 'react-redux'

import App from './App'
import noteReducer from './reducers/noteReducer'

const store = createStore(noteReducer)

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <App />
  </Provider>
)
```
Now the application is now defined as a child of a `Provider` component provided by the react-redux library. The applications store is goven to the `Provider` as its attribute store. This makes the store accessible to all components in the application, as we will soon see. We will also move all our action creators to the file where the reducer is defined.

Our `App.jsx` will now look look like this:
```javascript
import { createNote, toggleImportanceOf } from './reducers/noteReducer'
import { useSelector, useDispatch } from 'react-redux'

const App = () => {
  const dispatch = useDispatch()
  const notes = useSelector(state => state)

  const addNote = event => {
    event.preventDefault()
    const content = event.target.note.value
    event.target.note.value = ''
    dispatch(createNote(content))
  }

  const toggleImportance = id => {
    dispatch(toggleImportanceOf(id))
  }

  return (
    <div>
      <form onSubmit={addNote}>
        <input name="note" />
        <button type="submit" >add</button>
      </form>
      <ul>
        {notes.map(note => (
          <li key={note.id} onClick={() => toggleImportance(note.id)}>
            {note.content} <strong>{note.important ? 'important' : ''}</strong>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App
```
Instead of using the dispatch method from the redux store we will now use the dispatch function from the `useDispatch` hook from the react-redux library. The hook provides any react component access to the dispatch function of the redux store defined in `main.jsx`. This allows all components to mkake changes to the state of the redux store. 

The component can access the notes stored in the store with the `useSelector` hook of the react-redux library. 
```javascript
import { useSelector, useDispatch } from 'react-redux'

const App = () => {
  // ...

  const notes = useSelector(state => state)
  // ...
}
```
`useSelector` receives a function as a parmeter. The function either searches for or selects data from the redux store. Here we need all of the notes, so our selector function returns the whole state:
```
state => state
```
Usually, selector functions are a bit more interesting and return only selected parts of the contents of the redux store. For example we could return only notes marked as important:
```javascript
const importantNotes = useSelector(state => state.filter(note => note.important))
```

# Combined reducers

We want to store both the current notes we have saved and also the type of filter we want to state. Our global state store should look like this:
```javascript
{
  notes: [
    { content: 'reducer defines how redux store works', important: true, id: 1},
    { content: 'state of store can contain any data', important: false, id: 2}
  ],
  filter: 'IMPORTANT'
}
```
To do this we will start by creating a new reducer to store the state of the filter.

After doing so we can create the actual reducer for out application by combining the two exisiting reducers with the `combineReducers` function. We can defined thje combined reducer in the `main.jsx` file like so:
```javascript
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { createStore, combineReducers } from 'redux'

import App from './App'
import filterReducer from './reducers/filterReducer'
import noteReducer from './reducers/noteReducer'

const reducer = combineReducers({
  notes: noteReducer,
  filter: filterReducer
})

const store = createStore(reducer)

console.log(store.getState())

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <div />
  </Provider>
)
```
The state of our store defined by the reducer above is an object with two properties, notes and filter. The value of the notes property is defined by the `noteReducer`, which does not have to deal with the other properties of the state. Likewise, the filter property is managed by the `filterReducer`.

# Redux toolkit and refactoring store config

So far we have seenm that refux's configuration and state management implementation requires quite a lot of effort. Redux toolkit is a library that solves these common redux-related problems. The library for example greatly simplifies the configuration of the redux store and offers a large variety of tools to ease state management. We can install redux toolkit with the following command:
```
npm install @reduxjs/toolkit
```
Next we will use `configureStore` instead of redux's `createStore` function.
```javascript
import { configureStore } from '@reduxjs/toolkit'

const store = configureStore({
  reducer: {
    notes: noteReducer,
    filter: filterReducer
  }
})
```
We can further clean up the `main.jsx` file by moving the code related to the creation of the redux store intoa seperate file. We can create this file at `src/store.js`

# Redux toolkit and refactoring  reducers

Next we can refactor our reducers using the redux toolkit. With redux toolkit, we can easily create reducer and related action creators using the `createSlice` function. We can use the `createSlice` function to refactor the reducer and action creators in the `reducers/noteReducer.js` file:
```javascript
import { createSlice } from '@reduxjs/toolkit'

const initialState = [
  {
    content: 'reducer defines how redux store works',
    important: true,
    id: 1,
  },
  {
    content: 'state of store can contain any data',
    important: false,
    id: 2,
  },
]

const generateId = () =>
  Number((Math.random() * 1000000).toFixed(0))


const noteSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    createNote(state, action) {
      const content = action.payload
      state.push({
        content,
        important: false,
        id: generateId(),
      })
    },
    toggleImportanceOf(state, action) {
      const id = action.payload
      const noteToChange = state.find(n => n.id === id)
      const changedNote = { 
        ...noteToChange, 
        important: !noteToChange.important 
      }
      return state.map(note =>
        note.id !== id ? note : changedNote 
      )     
    }
  },
})


export const { createNote, toggleImportanceOf } = noteSlice.actions
export default noteSlice.reducer
```
The `createSlice` functions name parmeter defines the prefix whihc is used in the actions type values. For example. the `createNote` actions defined later will have the type value of `notes/createNote`. It is good practice to give the parameter a value which is unique among the reducers. This way there wont be unexpected collisions between the applications action type values. The `initialState` parameter defined the reducers initial state. The `reducers` parameter takes the reducer itself as an object, of which functions handle state changes caused by certain actions. Note that the `action.payload` in the function contains the argument provided by calling the action creator:
```javascript
dispatch(createNote('Redux Toolkit is awesome!'))
```
This dispatch call is equivalent to dispatching the following object:
```javascript
dispatch({ type: 'notes/createNote', payload: 'Redux Toolkit is awesome!' })
```

Also note that in the code we actually directly mutate state. Reudx toolkit utilizes the `Immer` library with reducers created by `createSlice` function, which makes it possible to mutate the `state` inside the reducer. Immer uses the mutated state to produce a new, immutable state and this the state changes remain immutable. Note that `state` can be changed without "mutating it", as we have done with the `toggleImportanceOf` action. In this case, the function directly returns the new state. Nevertheless mutating the state will often come in handy when a complex state needs to be updated.

The `createSlice` function returns an object containing the reducer as well as the action creators defined by the `reducers` parameter. The reducer can be accessed by the `noteSlice.reducer` property, whereas the action creators by the `noteSlice.actions` property. 

# Redux toolkit and console.log

If we try to print the state of the redux store in the middle of a reducer created with the function `createSlice` we will get the following printed to console:
```
Proxy(Array) {0: {…}}
  [[Handler]]: null
  [[Target]]: null
  [[IsRevoked]]: true
```
The output is not very useful. This is because of the `Immer` library that is used by redux toolkit internally to save the state of the store. The state can be converted to a human readable format by using the `current` function from redux toolkit. The function can be imported with the following command:
```javascript
import { current } from '@reduxjs/toolkit'
```
And after this, the state can be printed to the console with the following command:
```javascript
console.log(current(state))
```

# Redux devtools

Redux devtools is a chrome addon that offers useful development tools for redux. It can be used for example to inspect the redux stores state and dispatch actions through the browsers console. When the store is created using redux toolkits `configureStore` function, no additional configuration is needed for refux devtools to work. Once the addon is installed, clicking the redux tab in the browsers developer tools, the redux devtools will open.

Using redux devtools, we can inspect how dispatching a certain action changes the state by clicking the action and also dispatch actions to the store using the developments tools itself.

# Fetch API

In software development, we need to consider whether a certain functionality should be implemented using an external library or whether it is better to utilize the native solutions provided by the environment. 

In the earlier parts of the course we used axios library to make HTTP requests. We will explore a alternative way to make HTTP requests using the native fetch API. It is typical for an external library like axios to be implemented using other external libraries. For example, if you install axios in your project with the command `npm install axios`, a bunch of other package are installed in order for axios to function.

The fetch API provides a similar way to make HTTP requests as axios, but using fetch API does not require installing any external libraries. Maintaining the application becomes easier when there are fewer libraries to update, and security is also improved because the potential attack surface of the application is reduced. In practice, requests are made using the `fetch()` function. The syntax used differs from axios. We will also notice that axios has taken care of some things for us and made our lives easier. However, we will now use the fetch API, as it is a widely used native solution.

# Getting data from the backend

We can create a methjod for fetching data from the backend in the file `src/services/notes.js`:
```javascript
const baseUrl = 'http://localhost:3001/notes'

const getAll = async () => {
  const response = await fetch(baseUrl)

  if (!response.ok) {
    throw new Error('Failed to fetch notes')
  }

  const data = await response.json()
  return data
}

export default { getAll }
```
We will use the `fetch()` function which takes the backends URL as an argument to retrieve all notes from the backend. Since we didnt define the request type, fetch performs its default action, which is a GET request. Once the response has arrived, we have to check the success of the request using `response.ok` since fetch doesnt automatically throw erros based on unsuccessful response codes.

If the request is successful, the data contained in the response is converted to JSON format:
```javascript
const data = await response.json()
```
`fetch` does not automatically convert any data included in the response to JSON format, so we have to convert it manually. Also the `response.json` is an asynchronous method, so the `await` keyword is required. We can further simplfy the code by directly returning the data returned by the `response.json()` method:
```javascript
const getAll = async () => {
  const response = await fetch(baseUrl)

  if (!response.ok) {
    throw new Error('Failed to fetch notes')
  }


  return await response.json()
}
```

# Initializing the store with data fetched from the server

First we will set `initialState` in the note reducer to be a empty array. Next we will create a new action creator called `setNotes`, which allows us to directly replace the array of notes.
```
javascript
setNotes(state, action) {
  return action.payload
}
```
Next we will implement thje initialization of notes in the app component. As is usually the case when fetching data from a server, we will use the `useEffect` hook:
```javascript
useEffect(() => {
  noteService.getAll().then(notes => dispatch(setNotes(notes)))
}, [dispatch])
```
The notes are fetched from the server using the `getAll` method we defined, and then stored in the redux store by dispatching the action returned by the `setNotes` action creator. Notice a small detail, we have added the `dispatch` variable to the dependency array of the use effect hook. Logically the code would work the same since the variable `dispatch` will never change but it is considered good programming practice to add all variables and functions used inside the `useEffect` hook that are defined within the component to the dependency array. This helps to avoid unexpected bugs.

# Sending data to the backend

We will implement the functionaility for sending a new note to the server. We will do this by creating a POST request using the `fetch()` method. We can extend our code in the services folder as follows:
```javascript
const createNew = async (content) => {
  const response = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, important: false }),
  })
  
  if (!response.ok) {
    throw new Error('Failed to create note')
  }
  
  return await response.json()
}
```
The first parameter of the fetch function specifies the URL to which the request is made. The second parameter is an object that defines other details of the request, such as the request type, headers, and the data sent with the request. We can further calrify the code by storing the objects that defines the object that defines the request details in a seperate options variable:
```javascript
const options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, important: false }),
  }
  
  const response = await fetch(baseUrl, options)
```
Taking a closer look at the options object:
- `method` defines the type of the request, which in this case is POST.
- `headers` define the request headers. We add the header `'Content-Type': 'application/json'` to let the server know that the data sent with the request is in JSON format, so it can handle the request correctly.
- `body` contains the data sent with the request. You cannot directly assign a javascript object to this field, it must be first converted to JSON string by calling the `JSON.stringify()` function.

As with a GET request, the response status code is checked for errors. If the request is successful, JSON Server returns the newly created note, for which it has also generated a unique id. However, the data conmtained in the response still needs to be converted to JSON format using the `response.json()` method

As with a GET request, the response status code is checked for errors. If the request is successful, JSON Server returns the newly created note, for which it has also generated a unique id. However, the data conmtained in the response still needs to be converted to JSON format using the `response.json()` method.

We can now modify our `NoteForm` component so that a new note is sent to the backend. THe components `addNote` method will change slightly:
```javascript
import { useDispatch } from 'react-redux'
import { createNote } from '../reducers/noteReducer'

import noteService from '../services/notes'

const NoteForm = (props) => {
  const dispatch = useDispatch()
  

  const addNote = async (event) => {
    event.preventDefault()
    const content = event.target.note.value
    event.target.note.value = ''

    const newNote = await noteService.createNew(content)
    dispatch(createNote(newNote))
  }

  return (
    <form onSubmit={addNote}>
      <input name="note" />
      <button type="submit">add</button>
    </form>
  )
}

export default NoteForm
```
When a new note is created in the backend by calling the `createNew()` method, the return value is an object representing the note, to which the backend has generated a unique id. Therefore, we can modfiy the action creator `createNote` defined in the notes reducer to just push the `action.payload` instead of generating the unique id itself.
