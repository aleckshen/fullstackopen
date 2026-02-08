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

# Testing react apps

To test our react application we will use a testing tool called Vitest. We can start by installing vitest and the jsdom library simulating a web browser:
```
npm install --save-dev vitest jsdom
```
In addition to vitest, we also need another testing library that will help us render components for testing purposes. The current best option for this is react-tesintg-library which has seen rapid growth in popularity in recent times. It is also worth extending the expresive power of the test with the library jest-dom. We can install the following libraries with the command:
```
npm install --save-dev @testing-library/react @testing-library/jest-dom
```
Before we can do the first test, we need some configurations. We can add a script to the package.json file to run the tests:
```
{
  "scripts": {
    // ...
    "test": "vitest run"
  }
  // ...
}
```
We can then create a file `testSetup.js` in the project root with the following content:
```javascript
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

afterEach(() => {
  cleanup()
})
```
Now, after each test, the function `cleanup` is executed to reset jsdom, which is simulating the browser. We can then expand the `vite.config.js` file as follows:
```
export default defineConfig({
  // ...
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './testSetup.js', 
  }
})
```
With globals being set to true, there is no need to import keywords such as `describe`, `test` and `expect` into tests. We can now write tests for the component that is responsible for rendering a note:
```javascript
const Note = ({ note, toggleImportance }) => {
  const label = note.important
    ? 'make not important'
    : 'make important'

  return (

    <li className='note'>
      {note.content}
      <button onClick={toggleImportance}>{label}</button>
    </li>
  )
}
```
Notice that the `li` element has the value note for the CSS attribute className, that could be used to access the component in our tests.

# Rendering the component for tests

We will write out test in the `src/components/Note.test.jsx` file, which is in the same directory as the component itself. The first test verifies that the component renders the contents of the note:
```javascript
import { render, screen } from '@testing-library/react'
import Note from './Note'

test('renders content', () => {
  const note = {
    content: 'Component testing is done with react-testing-library',
    important: true
  }

  render(<Note note={note} />)

  const element = screen.getByText('Component testing is done with react-testing-library')
  expect(element).toBeDefined()
})
```
After the initial configuration, the test renders the component with the render function provided by the react-testing-library:
```javascript
render(<Note note={note} />)
```
Normally react compoennts are rendered to the DOM. The render method we used renders the components in a format that is suitable for tests without rendering them to the DOM. We can use the object screen to access the rendered component. We use screens method `getByText` to search for an element that has the note content and ensure that it exists. The existence of an element is checked using Vitest's `expect` command. Expect generates an assertion for its argument, the validity of which can be tested using various condition functions. Now we used `toBeDefined` which tests whether the `element` argument of expect exists.

Small note that eslint complains about the keywords `test` and `expect` in the tests so we can just extend our eslint config to this:
```
// ...

export default [
  // ...

  {
    files: ['**/*.test.{js,jsx}'],
    languageOptions: {
      globals: {
        ...globals.vitest
      }
    }
  }
]
```

# Test file location

In react there are (at least) two different conventions for the test files location. We created our test files according to the current standard by placing them in the same directory as the component being tested. The other convention is to store the test files "normally" in a seperate `test` directory.

# Searching for content in a component

The react-testing-library offers many ways of investigating the content of the component being tested. In reality the `expect` in our test is not needed at all. Test fails if `getByText` does not find the element it is looking for. This method searches for an element that contains only the text provided as a parameter and nothing else. If we had a component that would render text like this:
```javascript
const Note = ({ note, toggleImportance }) => {
  const label = note.important
    ? 'make not important' : 'make important'

  return (
    <li className='note'>

      Your awesome note: {note.content}
      <button onClick={toggleImportance}>{label}</button>
    </li>
  )
}

export default Note
```
The `getByText` method would not find the element:
```javascript
test('renders content', () => {
  const note = {
    content: 'Does not work anymore :(',
    important: true
  }

  render(<Note note={note} />)

  const element = screen.getByText('Does not work anymore :(')

  expect(element).toBeDefined()
})
```
If we want to look for an element that contains the text, we could use an extra option:
```javascript
const element = screen.getByText(
  'Does not work anymore :(', { exact: false }
)
```
Or we could use the `findByText` method:
```javascript
const element = await screen.findByText('Does not work anymore :(')
```
It is importatnt to note that unlike the other `byText` methods, `findByText` returns a promise.

There are situations where yet another form of the queryByText method is useful. The method returns the element but it does not cause an exception if it is not found. We could eg. use the method to ensure that something is not rendered to the component:
```javascript
test('does not render this', () => {
  const note = {
    content: 'This is a reminder',
    important: true
  }

  render(<Note note={note} />)

  const element = screen.queryByText('do not want this thing to be rendered')
  expect(element).toBeNull()
})
```
Other methods also exist, such as `getByTestId`, which searches for elements based on id fields specifcally createrd for testing purposes. We could alos use CSS-selectors to find rendered elements by using the method `querySelector` of the object container that is one of the fields returned by the render:
```javascript
import { render, screen } from '@testing-library/react'
import Note from './Note'

test('renders content', () => {
  const note = {
    content: 'Component testing is done with react-testing-library',
    important: true
  }


  const { container } = render(<Note note={note} />)


  const div = container.querySelector('.note')
  expect(div).toHaveTextContent(
    'Component testing is done with react-testing-library'
  )
})
```

# Debugging tests

We can often run into many kinds of problems when writing our tests. Object `screen` has a method `debug` that can be used to print the HTML of a component to the terminal. IF we change the test as follows:
```javascript
import { render, screen } from '@testing-library/react'
import Note from './Note'

test('renders content', () => {
  const note = {
    content: 'Component testing is done with react-testing-library',
    important: true
  }

  render(<Note note={note} />)


  screen.debug()
  // ...
})
```
The HTML gets printed to the console. It is also possible to use the same method to print a wanted element to console:
```javascript
const element = screen.getByText('Component testing is done with react-testing-library')

screen.debug(element)
```

# Clicking buttons in tests

In addition to displaying content, the Note component also makes sure that when the button associated with the note is pressed, the `toggleImportance` event handler function gets called. We can install a library `user-event` that makes simulating user input a bit easier:
```
npm install --save-dev @testing-library/user-event
```
Testing the functionality can be accomplished like this:
```javascript
import { render, screen } from '@testing-library/react'

import userEvent from '@testing-library/user-event'
import Note from './Note'

// ...

test('clicking the button calls event handler once', async () => {
  const note = {
    content: 'Component testing is done with react-testing-library',
    important: true
  }
  

  const mockHandler = vi.fn()

  render(

    <Note note={note} toggleImportance={mockHandler} />
  )


  const user = userEvent.setup()
  const button = screen.getByText('make not important')
  await user.click(button)


  expect(mockHandler.mock.calls).toHaveLength(1)
})
```

# Testing forms

We already used the `click` function of the user-event in our previous test to click buttons. We can also simulate text input with userEvent. We can make a test for the NoteForm component. The form works by calling the function received as props `createNote`, with the details of the new note. The test is as follows:
```javascript
import { render, screen } from '@testing-library/react'
import NoteForm from './NoteForm'
import userEvent from '@testing-library/user-event'

test('<NoteForm /> updates parent state and calls onSubmit', async () => {
  const createNote = vi.fn()
  const user = userEvent.setup()

  render(<NoteForm createNote={createNote} />)

  const input = screen.getByRole('textbox')
  const sendButton = screen.getByText('save')

  await user.type(input, 'testing a form...')
  await user.click(sendButton)

  expect(createNote.mock.calls).toHaveLength(1)
  expect(createNote.mock.calls[0][0].content).toBe('testing a form...')
})
```
Tests get access to the input field using the function getByRole. The method type of the userEvent is used to write text to the input field. The first test expectation ensures that submitting the form calls the createNote method. The second expectation checks that the event handler is called with the right parameters - that a note with the correct content is created when the form is filled.

# About finding elements

If our form has two input fields we cannot use the approach:
```
const input = screen.getByRole('textbox')
```
We would get an error, the error message suggests using `getAllByRole`. The test could be fixed as follows:
```javascript
const inputs = screen.getAllByRole('textbox')

await user.type(inputs[0], 'testing a form...')
```
This method returns an array and the right input field is the first element of the array. However, this approach is a bit suspicious since it relies on the order of the input fields. If an label were defined for the input field, the input field could be located using it with the `getByLabelText` method. For example, if we added a label to the input field like this:
```javascript
  // ...

  <label>
    content
    <input
      value={newNote}
      onChange={event => setNewNote(event.target.value)}
    />

  </label>
  // ...
```
Then the test could locate the input field as folows:
```javascript
test('<NoteForm /> updates parent state and calls onSubmit', async () => {
  const user = userEvent.setup()
  const createNote = vi.fn()

  render(<NoteForm createNote={createNote} />) 


  const input = screen.getByLabelText('content')
  const sendButton = screen.getByText('save')

  await user.type(input, 'testing a form...')
  await user.click(sendButton)

  expect(createNote.mock.calls).toHaveLength(1)
  expect(createNote.mock.calls[0][0].content).toBe('testing a form...')
})
```
Quite often input fields have a placeholder text that hints user what kind of input is expected. Let us add a placeholder to our form:
```javascript
<input
  value={newNote}
  onChange={event => setNewNote(event.target.value)}
  placeholder='write note content here'
/>
```
Now finding the right input field is easy with the method getByPlaceholderText:
```javascript
test('<NoteForm /> updates parent state and calls onSubmit', async () => {
  const user = userEvent.setup()
  const createNote = vi.fn()

  render(<NoteForm createNote={createNote} />) 


  const input = screen.getByPlaceholderText('write note content here')
  const sendButton = screen.getByText('save')

  await user.type(input, 'testing a form...')
  await user.click(sendButton)

  expect(createNote.mock.calls).toHaveLength(1)
  expect(createNote.mock.calls[0][0].content).toBe('testing a form...')
})```

# Test coverage

We can easily find out the coverage of our tests by running them with the command:
```
npm test -- --coverage
```
The first time you run the command, vitest will ask you if you want to install the required library `@vitest/coverage-v8`. We can install, and run the command again.
