# Rendering collections

We can render list elements dynamically using array functions such as `array.map()`. For example we can have the following code block:
```javascript
const App = (props) => {
  const { notes } = props

  return (
    <div>
      <h1>Notes</h1>
      <ul>
        {notes.map(note => 
          <li key={note.id}>
            {note.content}
          </li>
        )}
      </ul>
    </div>
  )
}
```
This takes a a notes array as a property. The line `const { notes } = props` extracts the notes field using object destructuring and we can dynamically map every note within `<li>` brackets as shown in the code above. Each list item should include a key prop `key={note.id}`, which helps React identify and efficiently update individual items.

Note that another way to use the map function without directly including a key prop is by retrieving the index through a second parameter passed into the function such as:
```javascript
<ul>
  {notes.map((note, i) => 
    <li key={i}>
      {note.content}
    </li>
  )}
</ul>
```
However this is not entirely desirable.

# Map function

Map is a important javascript functions that takes a array and maps each variable to a desired output. Lets examine the following code:
```javascript
const result = notes.map(note => note.id)
console.log(result)
```
Essentially what this does is it takes a note object as a parameter and it returns the notes id as the result. This block of code is very simplified, the code within the map function is the same as:
```javascript
(note) => {
  return note.id
}
```

# Javascript run time environment

Javascript engines, or runtime environments follow the asynchronous model. This requires all input and output operations to be executed as non blocking (with some exceptions). This means that code continues to execute after immediately calling a input/output function without waiting for it to return. Currently javascript engines are single threaded and cannot execute code in parallel, as a result it is required in practice to use a non-blocking model for executing input/output operations. Otherwise the browser would freeze during, for instance fetching data from a server.

# Axios and promises

## Axios
Axios is a popular, promise-based JavaScript library for making HTTP requests from browsers or Node.js, simplifying data fetching and sending to APIs with a clean syntax, built-in features like request/response interception, error handling, and automatic JSON transformation. 

## Promises
A promise is an object representing the eventual completion or failure of an asynchronous operation. A promise can have three states:
1. The promise is pending: This means that the asynchronous operation corresponding to the promise has not been fulfilled yet and the final value is not yet available. 
2. The promise is fulfilled: This means that the operation is completed and a final value is available, which generally means a successful operation.
3. The promise is rejected: This means that a error prevented the final value from being determined, and generally represents a failed operation.

# Effect-hooks 

Effects let a component connect and synchronize with external systems. This includes dealing with network, browser DOM, animations, widgets writeen using a different UI library, and other non-React code. As such, effect hooks are precisely the right too to use when fetching data from a server. The function `useEffect` takes two parameters, the first parameter is the effect itself:
- By default, effects run after every completed render, but you can choose to fire it only when certain values have changed.

So by default the effect is always run after the component has been rendered. The second parameter of `useEffect` is used to specify how often the effect is run. If the second parameter is a empty array `[]`, then the effect is only run along with the first render of the component.

# REST

REST is a software development architectural style that was created to describe the design and guide the development of architecture for the world wide web. REST API stands for representational state transfer application programming interface. 

Every resource has a unique address associated with it - its URL. For example we for every individual note in a json-server we would be able to locate it at the resource URL `notes/3` where `3` is the id of the resource. The `notes` URL on the other hand would point to a resource collection containing all the notes.

Resources are fetched from the server with HTTP GET requests. For instance, an HTTP GET request to the URL `notes/3` will return the note that has the id number `3`. An HTTP GET request to the `notes` URL would return a list of all notes.

Creating a new resource for storing a note is done by making an HTTP POST request to the notes URL according to the REST convention that the json-server adheres to. The data for the new note resource is sent in the body of the request.

Json-server requires all data to be sent in JSON format, this means that the data must be a correctly formatted string and the request must contain the Content-Type request header with the value `application/json`.

# Sending data to the server

We can send data to the server with the following example:

```javascript
const AddNote = event => {
  event.preventDefault()
  const noteObject = {
    content: newNote,
    important: Math.random() < 0.5,
  }
  axios
    .post('https://localhost:3001/notes', noteObject)
    .then(response => {
      console.log(response)
    })
}
```

In this example we create a new note object but omit the id property since its better to let the server generate ids for our resources. The object is sent to the server using the axios libraries POST method, the registered event handler then logs the response that is sent back from the server to the console.

# Modifying JSON data

Individual notes stored in the json-server backend can be modified in two different ways:
1. Making HTTP requests to the notes unique IRL.
2. Replace the entire note with an HTTP PUT request or only change some of the notes properties with an HTTP PATCH request.

This can be seen in the form of this event handler function:
```javascript
const toggleImportanceOf = id => {
  const url = `http://localhost:3001/notes/${id}`
  const note = notes.find(n => n.id === id)
  const changedNote = { ...note, important: !note.important }

  axios.put(url, changedNote).then(response => {
    setNotes(notes.map(note => note.id === id ? response.data : note))
  })
}
```

# Separating backend into a separate module

The app component becomes pretty bloated with all the communication code with the backend server, to adhere to the single responsibility principle we will extract the communication code into its own module. We all create a `src/services` directory and add a file there called `notes.js`.

For example we would have the following code in our `notes.js` file:
```javascript
import axios from 'axios'
const baseUrl = 'http://localhost:3001/notes'

const getAll = () => {
  return axios.get(baseUrl)
}

const create = newObject => {
  return axios.post(baseUrl, newObject)
}

const update = (id, newObject) => {
  return axios.put(`${baseUrl}/${id}`, newObject)
}

export default { 
  getAll: getAll, 
  create: create, 
  update: update 
}
```

We would then import this into the App component for example: `import noteService from './services/notes`, this allows the App component to use the functions of the module.

# Promises and errors

Given a scenario where we fetch a note with a hard coded id like this:
```javascript
const getAll = () => {
  const request = axios.get(baseUrl)
  const nonExisting = {
    id: 10000,
    content: 'This note is not saved to server',
    important: true,
  }
  return request.then(response => response.data.concat(nonExisting))
}
```

If we try to change the importance of the note we will get a error message in the console. The error message says that the backend server responded to our HTTP PUT request with a status code of 404 not found.

The application should be able to handle these types of error situations gracefully. Users will not be able to tell that this error happened unless they open their console. There are 3 states in which a promise can be in, when an axios HTTP request fails, the associated promise is rejected. The code above does not handle this rejection in anyway. The rejection of a promise is handled by providing the `then` method with a second callback function, which is called in the situation where the promise is rejected. 

The more common way of adding a handler for rejected promises is top use the `catch` method. In practice, the error handler for rejected promises is defined like this:
```javascript
axios
  .get('http://example.com/probably_will_fail')
  .then(response => {
    console.log('success!')
  })
  .catch(error => {
    console.log('fail')
  })
```

If the request fails, the event handler registered with the `catch` method gets called. The `catch` method is often utilized by placing it deeper within the promise chain.