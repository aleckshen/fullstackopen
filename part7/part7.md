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

# React bootstrap

React bootstrap is a ready-made ui framework, ui frameworks provide developers of web applications with ready-made themes and "components" like buttons, menus and tables. We can start by installing the react bootstrap library wiht the following command:
```
npm install react-bootstrap
```
To use bootstrap we need to add a link for loading the CSS stylesheet inside the `head` tag in the `public/index.html` file of the application:
```
<head>
  <link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
    integrity="sha384-9ndCyUaIbzAi2FUVXJi0CjmCapSmO7SnpJef0486qhLnuZ2cdeRhO02iuK6FUUVM"
    crossorigin="anonymous"
  />
  // ...
</head>
```
In bootstrap, all contents of the application are typically rendered inside a container. In practice this is accomplished by giving the root `div` element of the application the `container` class attribute:
```javascript
const App = () => {
  // ...

  return (
    <div className="container">
      // ...
    </div>
  )
}
```

## Tables

We can make some changes to the `Notes` component so that it renders the list of notes as a table. React bootstrap provides a built-in `Table` component for this purpose, so there is no need to define CSS classes separately.
```javascript
const Notes = ({ notes }) => (
  <div>
    <h2>Notes</h2>

    <Table striped>
      <tbody>
        {notes.map(note =>
          <tr key={note.id}>
            <td>
              <Link to={`/notes/${note.id}`}>
                {note.content}
              </Link>
            </td>
            <td>
              {note.user}
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  </div>
)
```
Also note that react bootstrap components have to be imported separately from the library:
```javascript
import { Table } from 'react-bootstrap'
```

## Forms

We can improve the form in the login view with the help of bootstrap forms.
```javascript
const Login = (props) => {
  // ...
  return (
    <div>
      <h2>login</h2>
      <Form onSubmit={onSubmit}>
        <Form.Group>
          <Form.Label>username:</Form.Label>
          <Form.Control
            type="text"
            name="username"
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>password:</Form.Label>
          <Form.Control
            type="password"
          />
        </Form.Group>
        <Button variant="primary" type="submit">
          login
        </Button>
      </Form>
    </div>
  )
}
```

## Notification

We can add a message for the notification when a user logs into the application. We will store it in the `message` variable in the app components state.
```javascript
const App = () => {
  const [notes, setNotes] = useState([
    // ...
  ])

  const [user, setUser] = useState(null)

  const [message, setMessage] = useState(null)

  const login = (user) => {
    setUser(user)

    setMessage(`welcome ${user}`)
    setTimeout(() => {
      setMessage(null)
    }, 10000)
  }
  // ...
}
```
We can render the message as a bootstrap `Alert` component:
```javascript
<div className="container">

  {(message &&
    <Alert variant="success">
      {message}
    </Alert>
  )}
  // ...
</div>
```

## Navigation structure

Lastly, we can alter the applications navigation menu to use bootstraps `Navbar` component:
```javascript
<Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
  <Navbar.Toggle aria-controls="responsive-navbar-nav" />
  <Navbar.Collapse id="responsive-navbar-nav">
    <Nav className="me-auto">
      <Nav.Link href="#" as="span">
        <Link style={padding} to="/">home</Link>
      </Nav.Link>
      <Nav.Link href="#" as="span">
        <Link style={padding} to="/notes">notes</Link>
      </Nav.Link>
      <Nav.Link href="#" as="span">
        <Link style={padding} to="/users">users</Link>
      </Nav.Link>
      <Nav.Link href="#" as="span">
        {user
          ? <em style={padding}>{user} logged in</em>
          : <Link style={padding} to="/login">login</Link>
        }
      </Nav.Link>
    </Nav>
  </Navbar.Collapse>
</Navbar>
```
Also note that if the viewport of the browser is narrowed, we notice that the menu collapses and it can be expanded by clicking the hamburger button. Bootstrap and a large majority of existing UI frameworks produce responsive designs, meaning that the resulting application render well on a variety of different screen sizes.

# Webpack

In the early days, react was somewhat famous for being difficult to configure the tools required for application development. To make this situation easier, create react app was developed, which eliminated configuuration related problems. Vite, which is also, has recently replaced create react app in new applications.

Both vite and create react app use bundlers to do the actual work. We will learn about a bundler called webpack used by create react app. Webpack was by far the most popular bundler for years. Recently, however there have been several new generation bundlers such as esbuild used by vite, which are significantly faster and easier to use than webpack. However, e.g. esbuild still lacks some useful features (such as hot reload of the code in the browser), so next we will get to the bundler webpack.

# Bundling

We have implemented our applications by dividing our code into separate modules that have been imported to places that require them. Even though ES6 modules are defined in the ECMAScript standard, the older browsers do not know how to handle code that is divided into modules.

For this reason, code that is divided into modules must be bundled for browsers, meaning that all of the source code files are transofmred into a single file that contains all of the application code. When we deployed our react front end to prod, we performed the bundling of our application with `npm run build`. Under the hood, the npm script bundles the source, and this produces the following collection of files in the `dist` directory:
```
├── assets
│   ├── index-d526a0c5.css
│   ├── index-e92ae01e.js
│   └── react-35ef61ed.svg
├── index.html
└── vite.svg
```
The `index.html` file located at the root of the `dist` directory is the "main file" of the application which loads the bundled javascript file with a script tag.
```
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite + React</title>
    <script type="module" crossorigin src="/assets/index-e92ae01e.js"></script>
    <link rel="stylesheet" href="/assets/index-d526a0c5.css">
  </head>
  <body>
    <div id="root"></div>
    
  </body>
</html>
```
This is a exmaple of a application created with vite, the build script also bundles the applications CSS files into a single `/assets/index.../css` file. In practice, bundling is done so that we define an entry point for the application, which typically is the `index.js` file. When webpack bundles the code, it includes not only tho code form the entry point but also the code that is imported by the entry points, as well as the code imported by its import statements, and so on.

We can create a webpack configuration by hand, suitable for a new react application. We can create a new directory for the project with the following subsirectories (build and src) and files:
```
├── build
├── package.json
├── src
│   └── index.js
└── webpack.config.js
```
The contents of the `package.json` file can be the following:
```
{
  "name": "webpack-part7",
  "version": "0.0.1",
  "description": "practicing webpack",
  "scripts": {},
  "license": "MIT"
}
```
We can install webpack with the following command:
```
npm install --save-dev webpack webpack-cli
```
We defined the functionality of webpack in the `webpack.config.js` file, which we initialize with the following content:
```javascript
const path = require('path')

const config = () => {
  return {
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, 'build'),
      filename: 'main.js'
    }
  }
}

module.exports = config
```
We will then define a new npm script called `build` that will execute the bundling with webpack:
```
"scripts": {
  "build": "webpack --mode=development"
},
```
We can add some code to the `src/index.js` file:
```javascript
const hello = name => {
    console.log(`hello ${name}`)
}
```
When we execute the `npm run build` command, our application code will be bundled by webpack. The operation will produce a new `main.js` files that is added under the build directory.

# Bundling react

We can transform our application into a minimal react application. First we need to install `react` and `react-dom`:
```
npm install react react-dom
```
Next we will turn our application into a react application by adding the familiar definitions in the `index.js` files:
```javascript
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

createRoot(document.getElementById('root')).render(
  <App />
)
```
We will also make the follolwing changes to the `App.js` file:
```javascript
import React from 'react' // we need this now also in component files

const App = () => {
  return (
    <div>
      hello webpack
    </div>
  )
}

export default App
```
We still need the `build/index.html` file that will server as the "main page" of our application, which will load our bundled javascript code with a script tag:
```
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>React App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="text/javascript" src="./main.js"></script>
  </body>
</html>
```
If we try to `npm run build` right now we will encounter a error that states that we need an appropriate loader to handle this file type in `index.js`.

# Loaders

The error message from webpack states that we may need an appropriate loader to bundle the `App.js` file correctly. By default, webpack only knows how to deal with plain javascript. Althought we may have become unaware of it, we are using JSX for rendering our views in React. We can use loaders to inform webpack of the files that need to be processed before they are bundled.

We can configure a loader to out application that transofmrs the JSX code into regular javascript:
```javascript
const path = require('path')

const config = () => {
  return {
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, 'build'),
      filename: 'main.js'
    },

    module: {
      rules: [
        {
          test: /\.js$/,
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react'],
          },
        },
      ],
    },
  }
}

module.exports = config
```
Loaders are defined under the module property in the rules array. The definition of a single loader consists of three parts, test, loader and options. The test property specifies that the loader is for files that have names ending with `.js`. The loader property specifies that the processing for those files will be done with `babel-loader`. The options property is used for specifying parameters for the loader, which configure its functionality.

We can install the laoder and its required packages as a development dependency:
```
npm install @babel/core babel-loader @babel/preset-react --save-dev
```
Now our application will successfully bundle. If we make some changes to the app component and take a look at the bundled code, we notice that the bundled version of the component looks like this:
```javascript
const App = () =>
  react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(
    'div',
    null,
    'hello webpack'
  )
```
The react elements that were written in jsx are now created with regular javascript by using reacts `createElement` function. We can test the bundled application by opening the `build/index.html` file. Also note that if the bundled applications source code uses async/await, the browser will not render anything on some browsers. This is because async/await is not fully supported in older browsers, to fix this solution we can install two more dependencies, core-js and regenerator-runtime.
```
npm install core-js regenerator-runtime
```
We then need to import these dependencies at the top of the `index.js` files:
```javascript
import 'core-js/stable/index.js'
import 'regenerator-runtime/runtime.js'
```

# Transpilers

The process of transforming code from one form of javascript to another is called transpiling. The general definition of the term is to compile source code by transforming it from one language to another.

By using the configuration from the previous section, we are transpiling the code containing JSX into regular javascript with the help of babel, which is currently the most popular tool for the job.

Most browsers do not support the latest features that were introduced in ES6 and ES7, for this reason, the code is usually transpiled to a version of javascript that implements the ES5 standard.

the transpilation process that is executed by babel is defined with plugins. In practice, most developers use ready made presets that are groups of pre configured plugins. Currently we are using the @babel/preset-react preset for transpiling the source code of our application.

We can also add the @babel/preset-env plugin that contains everything needed to take code using all of the latest features and to transpile it to code that is compatible with ES5 standard:
```
{
  test: /\.js$/,
  loader: 'babel-loader',
  options: {

    presets: ['@babel/preset-env', '@babel/preset-react']
  }
}
```
We can install the preset along with the command:
```
npm install @babel/preset-env --save-dev
```

# CSS

We can quickly add some CSS to our application at `src/index.css`:
```
.container {
  margin: 10px;
  background-color: #dee8e4;
}
```
And use the style in the app component:
```javascript
const App = () => {
  return (
    <div className="container">
      hello webpack
    </div>
  )
}
```
And we import the style in the `index.js` file:
```
import './index.css'
```
If we try to run our build currently, it will fail. This is because when using CSS, we have to use css and style loaders:
```
{
  rules: [
    {
      test: /\.js$/,
      loader: 'babel-loader',
      options: {
        presets: ['@babel/preset-react', '@babel/preset-env'],
      },
    },

    {
      test: /\.css$/,
      use: ['style-loader', 'css-loader'],
    },
  ],
}
```
We can install the loaders with:
```
npm install style-loader css-loader --save-dev
```
The job of the css loader is to load the css files and the job of the style loader is to generate and inject a style element that contains all of the style of the application.

With this configuration, the CSS definitions are included in the `main.js` file of the application. For this reason, there is no need to separately import the CSS styles in the main `index.html` file.

# Webpack dev-server

The current configuration makes it possible to develop our application but the workflow is awful. Every time we make a change to the code, we have to bundle it and refresh the browser to test it. The webpack dev-server offers a solution to our problems. We can install it with the command:
```
npm install --save-dev webpack-dev-server
```
We can define a npm script for starting the dev server:
```
{
  // ...
  "scripts": {
    "build": "webpack --mode=development",

    "start": "webpack serve --mode=development"
  },
  // ...
}
```
We will also add a new `devServer` property to the configuration object in the `webpack.config.js` file:
```javascript
const config = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'main.js',
  },

  devServer: {
    static: path.resolve(__dirname, 'build'),
    compress: true,
    port: 3000,
  },
  // ...
};
```
The `npm start` command will now start the dev-server at port 3000, meaning that our application will be available by visiting `http://localhost:3000` in the browser. When we make changes to the code, the browser will automatically refresh the page.

The process for updating the code is fast. When we use dev-server, the code is not bundled the usual way into the `main.js` file. The results of the bundling exists only in memory.

We can extend the code by changing the definition of the app component as shown below:
```javascript
import React, { useState } from 'react'
import './index.css'

const App = () => {
  const [counter, setCounter] = useState(0)

  return (
    <div className="container">
      hello webpack {counter} clicks
      <button onClick={() => setCounter(counter + 1)}>
        press
      </button>
    </div>
  )
}

export default App
```

# Source maps

We will extract the click handler into its own function and store the previous value of the counter in its own state:
```javascript
bconst App = () => {
  const [counter, setCounter] = useState(0)

  const [values, setValues] = useState()


  const handleClick = () => {
    setCounter(counter + 1)
    setValues(values.concat(counter))
  }

  return (
    <div className="container">
      hello webpack {counter} clicks

      <button onClick={handleClick}>
        press
      </button>
    </div>
  )
}
```
The application no longer works and we get the following error:
```
App.js:27 Uncaught TypeError: Cannot read property 'concat' of undefined
    at handleClick (App.js:27)
```
The location of the error indicated in the message does not match the actual location of the error in our source code. If we click the error message, we notice that the displayed source code does not resemble our application code.

Fixing this error message is easy. We will ask webpack to generate a so-called source map for the bundle, which makes it possible to map errors that occur during the execution of the bundle to the corresponding part in the original source code.

The source map can be generated by adding a new devtool property to the configuration object with the value `source-map`:
```javascript
const config = {
  entry: './src/index.js',
  output: {
    // ...
  },
  devServer: {
    // ...
  },

  devtool: 'source-map',
  // ..
};
```

# Minifying the code

When we deploy the application to prod, we are using the `main.js` code bundle that is generated by webpack. The size of the `main.js` files is 1009487 bytes even though our application only contains a few lines of our code. The larger file size is because the bundle also contains the source code for the entire react library. The size of the bundled code matter since the browser has to load the code when the application is first used. With high speed internet connections, 1009487 bytes is not an issue, but if we were to keep adding more external dependecnies, loading speeds could become an issue, particularly for mobile users.

If we inspect the contents of the bundle file, we notice that it could be greatly optimized in terms of file size by removingf all of the comments. Theres no point in manuallly optimizing these files, as these are many existing tools for the job.

The optimization process for javascrip files is called minification. One of the leading tools intended for this purpose is UglifyJS.

Starting from version 4 of webpack, the minification plugin does not require additional configuration to be used. It is enough to modify the npm script in the `package.json`file to specify that webpack will execute the bundling of code in production mode:
```
"scripts": {
    "build": "webpack --mode=production",
    "start": "webpack serve --mode=development"
},
```

# Development and production configuration

We can now add a backend to our application by repurposing the now familiar note application backend. We can store notes in the `db.json` file.

Our goal is to configure the application with webpack in such a way that, when used locally, the application uses the json-server available in port 3001 as its backend. The bundled file will then be configured to use the backend available at `https://notes2023.fly.dev/api/notes` URL.

We will install axios, start the json-server, and then make the necessary changes to the application. For the sake of changing things up, we will fetch the notes from the backend with our custom hook called `useNotes`:
```javascript
import React, { useState, useEffect } from 'react'
import axios from 'axios'
const useNotes = (url) => {
  const [notes, setNotes] = useState([])
  useEffect(() => {
    axios.get(url).then(response => {
      setNotes(response.data)
    })
  }, [url])
  return notes
}

const App = () => {
  const [counter, setCounter] = useState(0)
  const [values, setValues] = useState([])

  const url = 'https://notes2023.fly.dev/api/notes'
  const notes = useNotes(url)

  const handleClick = () => {
    setCounter(counter + 1)
    setValues(values.concat(counter))
  }

  return (
    <div className="container">
      hello webpack {counter} clicks
      <button onClick={handleClick}>press</button>

      <div>{notes.length} notes on server {url}</div>
    </div>
  )
}

export default App
```
The adress of the backend server is currently hardcoded in the application code. We need a solution to change the adress in a controlled fashion to point to the production server when the code is bundled for production. 

Webpacks configuration function has two parameters, env and argv. We can use the latter to find out the mode defined in the npm script:
```javascript
const path = require('path')


const config = (env, argv) => {
  console.log('argv.mode:', argv.mode)
  return {
    // ...
  }
}

module.exports = config
```
Now, if we want, we can set webpack to work differently depending on whether the application operating environment, or mode, is set to production or development. We can also use webpacks `DefinePlugin` for defining global default constants that can be used in the bundled code. We can define a new global constant `BACKEND_URL` that gets a different value depending on the environment that the code is being bundled for:
```javascript
const path = require('path')

const webpack = require('webpack')

const config = (env, argv) => {
  console.log('argv', argv.mode)


  const backend_url = argv.mode === 'production'
    ? 'https://notes2023.fly.dev/api/notes'
    : 'http://localhost:3001/notes'

  return {
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, 'build'),
      filename: 'main.js'
    },
    devServer: {
      static: path.resolve(__dirname, 'build'),
      compress: true,
      port: 3000,
    },
    devtool: 'source-map',
    module: {
      // ...
    },

    plugins: [
      new webpack.DefinePlugin({
        BACKEND_URL: JSON.stringify(backend_url)
      })
    ]
  }
}

module.exports = config
```
The global constant is used in the following way:
```javascript
const App = () => {
  const [counter, setCounter] = useState(0)
  const [values, setValues] = useState([])

  const notes = useNotes(BACKEND_URL)

  // ...
  return (
    <div className="container">
      hello webpack {counter} clicks
      <button onClick={handleClick} >press</button>

      <div>{notes.length} notes on server {BACKEND_URL}</div>
    </div>
  )
}
```
If the configuration for development and production differs a lot, it may be a good idea to seperate the configuration of the two into their own files.

Now, if the application is start with the command `npm start` in development mode, it fetches the notes from the address `http://localhost:3001/notes`. The version bundled with the command `npm run build` uses the address `https://notes2023.fly.dev/api/notes` to get the list of notes.

We can inspect the bundled production version of the application locally by executing the following command in the build directory:
```
npx static-server
```

# Polyfill

Our application is finished and works with all relatively recent versions of modern browsers, except for internet explorer. The reason for this is that, because of `axios`, our code uses `Promises`, and no existing version of IE supports them.

There are many other things in the standard that IE does not support. Something as harmless as the `find` method of javascript arrays exceeds the capabilities of IE.

In these situations, it is not enough to transpile the code, as transpilation simply transforms the code from a newer version of javascript to an older one with wider browser support. IE understands Promises syntactically but it has not implemented their functionality. The `find` propert of arrays in IE is simply `undefined`.

If we want the application to be IE-compatible, we need to add a polyfill, which is code that adds the missing functionality to older browsers. Polyfills can be added with the help of webpack and babel or by installing one of many existing polyfill libraries.

The polyfill provided by the promise-polyfill library is easy to use. We simply have to add the following to our existing application code:
```javascript
import PromisePolyfill from 'promise-polyfill'

if (!window.Promise) {
  window.Promise = PromisePolyfill
}
```
If the global `Promise` object does not exist, meaning that the browser does not support Promises, the polyfilled Promise is stored in the global variable. If the polyfilled Promise is implemented well enough, the rest of the code should work without issues.

# Class components

During the course, we have only used react components having been defined as javascript functions. This was not possible without the hook functionality that came with version 16.8 of react. Before, when defining a component that uses state, one had to define it using javascript class syntax.

It is beneficial to at least be familiar with class components to some extent since the world contains a lot of old react code, which will probably never be completely rewritten using updated syntax.

We can get to know the main features of class components by producing another very familiar anecdote application. We store the anecdotes in the file `db.json` uisng json-server. The initial version of the class component looks like this:
```javascript
import React from 'react'

class App extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div>
        <h1>anecdote of the day</h1>
      </div>
    )
  }
}

export default App
```
The component now has a constructor, in which nothing happens at the moment, and contains the method render. Render defines how and what is rendered to the screen.

We can define state for the list of anecdotes and the currently-visible anecdote. In contrast to when using the `useState` hook, class components only contain one state. So if the state is made up of multiple "parts", they should be stored as properties of the state. The state is intitialized in the constructor:
```javascript
class App extends React.Component {
  constructor(props) {
    super(props)


    this.state = {
      anecdotes: [],
      current: 0
    }
  }

  render() {

    if (this.state.anecdotes.length === 0) {
      return <div>no anecdotes...</div>
    }

    return (
      <div>
        <h1>anecdote of the day</h1>

        <div>
          {this.state.anecdotes[this.state.current].content}
        </div>
        <button>next</button>
      </div>
    )
  }
}
```
The component state is in the instance variable `this.state`. The state is an object having two properties. `this.state.anecdotes` is the list of anecdotes and `this.state.current` is the index of the currently shown anecdote.

In functional components, the right place for fetching data from a server is inside an effect hook, which is executed when a component renders or less frequently if necessary, e.g. only in combination with the first render.

The lifecycle methods of class components offer corresponding functionality. The correct place to trigger the fetching of data from a server is inside the lifecycle method `componentDidMount`, which is executed once right after the first time a component renders:
```javascript
componentDidMount = () => {
    axios.get('http://localhost:3001/anecdotes').then(response => {
      this.setState({ anecdotes: response.data })
    })
  }
```
The callback function of the HTTP request updates the components state using the method `setState`. The method only touches the keys that have been defined in the object passed to the method as an argument. The value for the key `current` remains unchanged.

Calling the method `setState` always triggers the rerender of the class component, i.e. calling the method `render`.o

The biggest difference between functional component and class components is mainly that the state of a class component is a sinlge object, and that the state is updated using the `setState` method, while in functional components the state can consist of multiple different variables, with all of them having their own update function. A notable benifit of using functional components is not having to deal with the self referencing `this` reference of the javascript class.
