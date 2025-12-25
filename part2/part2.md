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
A promise is an object representing the eventual completion of failure of an asynchronous operation. A promise can have three states:
1. The promise is pending: This means that the asynchronous operation corresponding to the promise has not been fulfilled yet and the final value is not yet available. 
2. The promise is fulfilled: This means that the operation is completed and a final value is available, which generally means a successful operation.
3. The promise is rejected: This means that a error prevented the final value from being determined, and generally represents a failed operation.

# Effect-hooks 

Effects let a component connect and synchronize with external systems. This includes dealing with network, browser DOM, animations, widgets writeen using a different UI library, and other non-React code. As such, effect hooks are precisely the right too to use when fetching data from a server. The function `useEffect` takes two parameters, the first parameter is the effect itself:
- By default, effects run after every completed render, but you can choose to fire it only when certain values have changed.

So by default the effect is always run after the component has been rendered. The second parameter of `useEffect` is used to specify how often the effect is run. If the second parameter is a empty array `[]`, then the effect is only run along with the first render of the component.