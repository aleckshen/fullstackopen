# JSX

It seems like React is just returning pure html however this isn't the case. All react components are written in JSX, JSX returned by React components is compiled into javascript. The compilation of this is handled by Babel. Vite is configured to handle this compilation automatically. In practice JSX is much like HTML, however with JSX you can easily embed dynamic content by writing the appropriate javascript within curly braces.

# Props: passing data to components

It's possible to pass data to components using so-called "props". We can set a parameter in our component function to props and define some javascript within curly braces for the props to equal to that when passed into the parameter. 

For example:
```javascript
function Hello(props) {
    return (
        <div>Hello {props.name}</div>
    )
}

function App() {
    return (
        <Hello name='Aleck' />
    )
}
```

# React fragments

The content of a React component usually needs to contain only one root element. If we for example try to define the App component without the outermost div like this:

```javascript
function App() {
    return (
        <div>Hello</div>
        <p>Paragraph</>
    )
}
```

We will receive a error for this, this can be avoided by using a React fragment which is a just a empty element wrapped around the current elements:

```javascript
function App() {
    return (
        <>
            <div>Hello</div>
            <p>Paragraph</>
        </>
    )
}
```

# Stateful components 

useState is a custom hook built into the react library, we can access it by using `import { useState } from 'react'`. useState allows us to add state to our components and dynamically update information such as a counter. For example:
```javascript
const [count, setCount] = useState(0);
```
In this example count is the state variable and it is set to zero through the value passed into the usedState parameter. The function used to update the state variable is the setCount function.

To update the state we just need to call the corresponding setter function:
```javascript
setCount(count + 1); // Increments the count
```

# Event handling

In react a function is passed to a event handlers, for example:
```javascript
const App = () => {
  const [ counter, setCounter ] = useState(0)

  return (
    <div>
      <div>{counter}</div>
      <button onClick={() => setCounter(counter + 1)}>
        plus
      </button>
      <button onClick={() => setCounter(0)}> 
        zero
      </button>
    </div>
  )
}
```
In this case a anonymous function is passed to the onClick event handler and the function executes the setCounter function to update the state of the counter variable. This is done as event handlers only take function as parameters. 

If we did this for example:
```javascript
<button onClick={setCounter(counter + 1)}> 
  plus
</button>
```
Our application here would break, as the onClick event handler is taking a function call instead of a function or a function reference.