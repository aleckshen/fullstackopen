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
