# React router

To help with routing and navigation we can use the react router library. To install we will run the following command:
```
npm install react-router-dom
```
The routing provided by react router is enabled by changing the application as follows:
```javascript
import {
  BrowserRouter as Router,
  Routes, Route, Link
} from 'react-router-dom'

const App = () => {

  const padding = {
    padding: 5
  }

  return (
    <Router>
      <div>
        <Link style={padding} to="/">home</Link>
        <Link style={padding} to="/notes">notes</Link>
        <Link style={padding} to="/users">users</Link>
      </div>

      <Routes>
        <Route path="/notes" element={<Notes />} />
        <Route path="/users" element={<Users />} />
        <Route path="/" element={<Home />} />
      </Routes>

      <div>
        <i>Note app, Department of Computer Science 2024</i>
      </div>
    </Router>
  )
}
```
Routing, or the conditional rendering of components based on the URL in the browser, is used by placing components as children of the router component. Note that we are talked about `BrowserRouter` since we have imported `Router` as `BrowserRouter`

Inside the router, we define links that modify the adress bar with the help of the `Link` component. For example:
```javascript
<Link to="/notes">notes</Link>
```
creates a link in the application with the text notes, which when clicked changes the URL in the adress bar to `/notes`. Components rendered based on the URL of the browser are defined with the help of the component `Route`. For example:
```javascript
<Route path="/notes" element={<Notes />} />
```
If the browser adress is `/notes`, we render the `Notes` component. We wrap the components to be rendered based on the URL with a routes component. The routes works by rendering the first component whose path matches the URL in the browsers adress bar.

# Parameterized route

The ability to click a name is implemented with the component `Link`, and clicking the name of a note whose id is 3 woudl trigger an event that changes the adress of the browse into `notes/3`:
```javascript
const Notes = ({notes}) => (
  <div>
    <h2>Notes</h2>
    <ul>
      {notes.map(note =>
        <li key={note.id}>

          <Link to={`/notes/${note.id}`}>{note.content}</Link>
        </li>
      )}
    </ul>
  </div>
)
```
We define parameterized URLs in the routing of the app component as follows:
```javascript
<Route path="/notes/:id" element={<Note notes={notes} />} />
```
When a browser navigates to the URL for a specific note, for example, `/note/3`, we render the Note component thats passed into the element parameter of the `Route` component. The `Note` component receives all of the notes as props notes, and it can access the URL parameter (the id of note to be displayed) with the `useParams` function of react router.

# useNavigtate

We have also implemented a simple login function in our application. If a user is logged in, information about a logged-in user is saved to the user field of the state of the app component. The option to navigate to the login view is rendered conditionally in the menu.
```javascript
{user
  ? <em>{user} logged in</em>
  : <Link style={padding} to="/login">login</Link>
}
```
If the user is already logged in, instead of displaying the login link, we will show its username logged in. The code of the component handling the login functionality is as follows:
```javascript
import {
  // ...

  useNavigate
} from 'react-router-dom'

const Login = (props) => {

  const navigate = useNavigate()

  const onSubmit = (event) => {
    event.preventDefault()
    props.onLogin('mluukkai')

    navigate('/')
  }

  return (
    <div>
      <h2>login</h2>
      <form onSubmit={onSubmit}>
        <div>
          username: <input />
        </div>
        <div>
          password: <input type='password' />
        </div>
        <button type="submit">login</button>
      </form>
    </div>
  )
}
```
With the use of the `useNavigate` function of the react router, the browsers URL can be changed programmatically. With the user login, we call `navigate('/)` which causes the browsers URL to change to `/` and the application renders the corresnponding component `Home`. Both `useParams` and `useNavigate` are hook functions.

# Redirect

We have the following `Users` route:
```javascript
<Route path="/users" element={user ? <Users /> : <Navigate replace to="/login" />} />
```
If a user isnt logged in, the `Users` component is not rendered. Instead, the user is redirected using the component `Navigate` to the login view.

# Parameterized route revisited

A application has a flaw. The `Note` component receives all of the notes, even thougth it only displays the one whose id matches the URL parameter. We want to modify the application so that the `Note` component receives only the note it should display. We can do this using react routers `useMatch` hook to figure out the id of the note to be displayed in the `App` component.

It is not possible to use the `useMatch` hook in the component which defines the routed part of the application. We will have to move the `Router` compoennt from App:
```javascript
ReactDOM.createRoot(document.getElementById('root')).render(

  <Router>
    <App />

  </Router>
)
```
We can use `useMatch` in our app component like this:
```javascript
import {
  // ...
  useMatch
} from 'react-router-dom'

const App = () => {
  // ...

  const match = useMatch('/notes/:id')
  const note = match 
    ? notes.find(note => note.id === Number(match.params.id))
    : null

  return (
    <div>
    // ...
      <Routes>
        <Route path="/notes/:id" element={<Note note={note} />} />
      // ...
      </Routes>   

    </div>
  )
}  
```
Everytime the component is rendered (evertime the browsers URL changes), the following command is executed:
```javascript
const match = useMatch('/notes/:id')
```
If the URL matches `/notes/:id`, the match variable will contain an object which we can access the parameterized part of the path, the id of the note to be displayed, and we can fetch the correct note to display.

# Hooks and custom hooks

Some genral rules of react hooks are to never call hooks inside loops, conditions, or nested functions. Instead, always use hooks at the top level of your react function.

You can only call hooks while react is rendering a function component:
- Call them at the top level in the body of a function component.
- Call them at the top level in the body of a custom hook.

React offers the option to create custom hooks. According to react, the primary purpose of custom hooks is to facilitate the reuse of the logic used in components. Building your own hooks lets you extract component logic into reusable function.

Custom hooks are regular javascript functions that can use any other hooks, as long as they adhere to the rules of hooks. Additionally, the name of custom hooks must start with the word `use`.

For example we could create a custom hook for incrementing a counter.
```javascript
const useCounter = () => {
  const [value, setValue] = useState(0)

  const increase = () => {
    setValue(value + 1)
  }

  const decrease = () => {
    setValue(value - 1)
  }

  const zero = () => {
    setValue(0)
  }

  return {
    value, 
    increase,
    decrease,
    zero
  }
}
```
The custom hook uses the `useState` hook internally to create its state. The hook returns an object, the properties of which include the value of the counter as well as functions for manipulating the value.

We can use the following custom hook like so:
```javascript
const App = () => {
  const counter = useCounter()

  return (
    <div>
      <div>{counter.value}</div>
      <button onClick={counter.increase}>
        plus
      </button>
      <button onClick={counter.decrease}>
        minus
      </button>      
      <button onClick={counter.zero}>
        zero
      </button>
    </div>
  )
}
```
