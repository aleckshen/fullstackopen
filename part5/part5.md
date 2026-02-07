# Creating new notes

We want to only create new notes if a user is logged in and authenticated. This means that we need to add the token of the logged in user to the authroization header of the HTTP request. We can make changes to our `noteService` module:
```javascript
import axios from 'axios'
const baseUrl = '/api/notes'


let token = null


const setToken = newToken => {
  token = `Bearer ${newToken}`
}

const getAll = () => {
  const request = axios.get(baseUrl)
  return request.then(response => response.data)
}

const create = async newObject => {

  const config = {
    headers: { Authorization: token }
  }


  const response = await axios.post(baseUrl, newObject, config)
  return response.data
}

const update = (id, newObject) => {
  const request = axios.put(`${ baseUrl }/${id}`, newObject)
  return request.then(response => response.data)
}


export default { getAll, create, update, setToken }
```
The module contains a private variable called `token`. Its value can be changed with the `setToken` function, which is exported by the module. `create`, now with async/await syntax, sets the token to the Authorization header. The header is given to axios as the third parameter of the post method. The event handler response for login must be changed to call the method `noteService.setToken(user.token)` with a successful login:
```javascript
const handleLogin = async (event) => {
  event.preventDefault()

  try {
    const user = await loginService.login({ username, password })

    noteService.setToken(user.token)
    setUser(user)
    setUsername('')
    setPassword('')
  } catch {
    // ...
  }
}
```

# Saving tokens to local storage

Our applciation currently has a small flaw, if the browser is refreshed, the users login information disappears. The problem is easily solved by saving the login details to local storage. Local storage is a key-value database in the browser. It is very easy to use. A value corresponding to a certain key is saved to the database with the method `setItem`. For example:
```javascript
window.localStorage.setItem('name', 'aleck shen')
```
This saves the string given as the second parameter as the valye of the key name. The value of a key can be found with the method `getItem`:
```javascript
window.localStorage.getItem('name')
```
While `removeItem` removes a key from local storage.

Values in the local storage are persisted even when the page is re-rendered. The storage is origin-specific so each web application has its own storage. We can extend our application so that it saves the details of a logged-in user to the local storage. Values saved to the storage are DOMstrings, so we cannot save a js object as it is. The object has to be parsed to JSON first, with the method `JSON.stringify`. Correspondingly, when a JSON object is read from the local storage, it has to be parsed back to javascript with `JSON.parse`.

We will make the following changing to our login form:
```javascript
  const handleLogin = async (event) => {
    event.preventDefault()
    try {
      const user = await loginService.login({ username, password })


      window.localStorage.setItem(
        'loggedNoteappUser', JSON.stringify(user)
      ) 
      noteService.setToken(user.token)
      setUser(user)
      setUsername('')
      setPassword('')
    } catch (exception) {
      // ...
    }
  }
```
After doing this we still need ot modify our application so that when we enter the page, the application checks if user details of a logged-in user can already be found on the local storage. If they are there, the details are saved to the state of the application and to `noteService`. The right way to do this is with an effect hook: a mechanism we first encountered in part2, and used to fetch notes from the server. We can have mutliple effect hooks, so we can create a second one to handle the first loading of the page:
```javascript
  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedNoteappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      noteService.setToken(user.token)
    }
  }, [])
}
```

# Components children, aka props.children

Within a component we can defined that uses `props.children` like the following bellow:
```javascript
import { useState } from 'react'

const Togglable = (props) => {
  const [visible, setVisible] = useState(false)

  const hideWhenVisible = { display: visible ? 'none' : '' }
  const showWhenVisible = { display: visible ? '' : 'none' }

  const toggleVisibility = () => {
    setVisible(!visible)
  }

  return (
    <div>
      <div style={hideWhenVisible}>
        <button onClick={toggleVisibility}>{props.buttonLabel}</button>
      </div>
      <div style={showWhenVisible}>
        {props.children}
        <button onClick={toggleVisibility}>cancel</button>
      </div>
    </div>
  )
}

export default Togglable
```
`props.children` is used for referencing the child components of the component. The child compoennts are react elements that we define between the opening and closing tags of a component. Unlike the "normal" props we've seen before, children is automatically added by react and always exists. If a component is defined with an automatically closing `/>` tag then the props.children is an empty array.

# Lifting state up

Sometime we want the state of two compoennts to change together. To do this we remove state from both of them and move it to their closest common parent, and then pass state down to them via props. This is known as lifting state up. 

In a react application, many components will have their own state. Some state may "live" close to the lead component (components at the bottom of the tree) like inputs. Other state may "live" closer to the top of the app. For example, even client-side routing libraries are usually implemented by storing the current route in the react state, and passing it down by props. 

For each unique piece of state, you will choose the compoennt that "owns" it. This principle is known as a "single source of truth". It doesn't mean that all state lives in one place, but that for each piece of state, there is a specific component that holds that piece of information. Instead of duplicating shared state between components, life it up to their common shared parent, and pass it down to the children that need it.

# References to components with ref

Currently the note form is still there after we create a new note, it would make more sense for this to disappear after. There is a problem with hiding it, the visibility is controlled with the visisble state variable inside of the Togglable component. One solution to this would be to move control of the Togglable components state outside the component. However, we wont do that now, because we want the component to be responsible for its own state. We will use the `ref` mechanism on react, which offers a reference to the component.

We will make the following changes to our app component:
```javascript
import { useState, useEffect, useRef } from 'react'

const App = () => {
  // ...
  const noteFormRef = useRef()

  const noteForm = () => (
    <Togglable buttonLabel='new note' ref={noteFormRef}>
      <NoteForm createNote={addNote} />
    </Togglable>
  )

  // ...
}
```
The useRef hook is used to create a noteFormRef reference, that is assigned to the Togglable compoent containing the creation note form. The noteFormRef variable acts as a reference to the component. This hook ensures that the same ref is kept throughout re-renders of the component. We also need to make the following changes to out Togglable component now:
```javascript
import { useState, useImperativeHandle, forwardRef } from 'react'

const Togglable = forwardRef((props, ref) => {
  const [visible, setVisible] = useState(false)

  const hideWhenVisible = { display: visible ? 'none' : '' }
  const showWhenVisible = { display: visible ? '' : 'none' }

  const toggleVisibility = () => {
    setVisible(!visible)
  }

  useImperativeHandle(ref, () => {
    return { toggleVisibility }
  })

  return (
    <div>
      <div style={hideWhenVisible}>
        <button onClick={toggleVisibility}>{props.buttonLabel}</button>
      </div>
      <div style={showWhenVisible}>
        {props.children}
        <button onClick={toggleVisibility}>cancel</button>
      </div>
    </div>
  )
})

export default Togglable

```
The component uses the useImperativeHandle hook to make its toggleVisibility function available outside of the component. The useImperativeHandle is a react hook, that is used for defining functions in a component, which can be invoked from outisde of the component. We can now hide the form by calling `noteFormRef.current.toggleVisibility` after a new note as been created:
```javascript
const App = () => {
  // ...
  const addNote = (noteObject) => {

    noteFormRef.current.toggleVisibility()
    noteService
      .create(noteObject)
      .then(returnedNote => {     
        setNotes(notes.concat(returnedNote))
      })
  }
  // ...
}
```
Also note that within the Togglable component we need to use another react hook `forwardRef` this allows parent components to pass down reference to child components and for the child components to be able to alter or change it wihthout error.
