# Simple web server

We can create a simple web server from first running the command `npm init`, after running this command we get some requirements for our package.json. Once we autofill in the requirement or write in our own requirements we get something like this:
```javascript
{
  "name": "backend",
  "version": "1.0.0",
  "description": "",
  "license": "ISC",
  "author": "",
  "type": "commonjs",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  }
}
```

This gives us the name of our project, description, license etc. The most important part we are focusing on is the entry point of our server which is `"main": index.js"`. This is where our server runs, we also have scripts we can run in which we can define on our own. For example `"start": "node index.js"`, we run this script with `npm start` and it will run the same way if we ran `node index.js`. In our `index.js` we can create a server with the following code:
```javascript
const http = require('http')

const app = http.createServer((request, response) => {
    response.writeHead(200, { 'Content-Type': 'text/plain' })
    response.end('Hello World')
})

const PORT = 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)
```

# Express

Express eases server-side development with node by offering a more pleasing interface to work with the built in http module. Libraries like express aim to provide a better abstraction for building backend servers. To create a express server we can have the following code:
```javascript
const express = require('express')
const app = express()

let notes = [
// json notes
]

app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})

app.get('/api/notes', (request, response) => {
    response.json(notes)
})

const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
```

We can define routes to the application as seen above. The first route defined is for the root url, the event handler function accepts two parameters. The first `request` parameter contains all the information of the HTTP request and the second `response` parameter is used to define how the request is responded to.

Its quite annoying having to restart the express server every time we make changes to allow our server to auto reset every time we make a change we can add the following script to our package.json:
```javascript
"scripts": {
    "start": "node index.js",
    "dev": "node --watch index.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  }
```

Now we can start out server in the command line with `npm run dev`.

# REST

REST also known as representational state transfer is an architectural style meant for building scalable web application. In RESTful thinking we often think of our data as resources, previously we had notes as data in our application and we called them resources. Every resource has an associated URL which is the resources unique address. One convention for creating unique addresses is to combine the name of the resource type with the resources unique identifier. 

Lets assume that the root URL of out service is `www.example.com/api.`, if we define the resource type of note to be `notes`, then the address if a note resource with the identifier 10, has the unique address `wwww.example.com/api/notes/10`. The URL for the entire collection of all note resource is `wwww.example.com/api/notes`.

# Postman

After creating routes for all resources or singular resources, it's quite easy to check if the routes work as intended, we just need to type in the URL and check if the correct data is displayed on the screen. So how do we test the delete operation? We could write some js for testing deletion for writing test code is not always the best solution in every situation.

Many tools exist for making the testing of backends easier. One of these is a command line program `curl`. Instead of using curl, in fullstack open we focus on taking a look at using Postman for testing the application.

# Receiving data

We want to make it possible ot add new notes/resources to the server. Adding a note/resource happens by making an HTTP POST request to the address `https://localhost:3001/api/notes`, and by sending all the information for the new note in the request body in JSON format. To access the data easily, we need the help of the express json-parser that we can use with the command `app.use(express.json())`. With the json-parser defined we can have the following code:
```javascript
const express = require('express')
const app = express()


app.use(express.json())

//...


app.post('/api/notes', (request, response) => {
  const note = request.body
  console.log(note)
  response.json(note)
}) 
```

Without the json-parser, the body property would be undefined. The json-parser takes the JSON data of a request, transforms it into a javascript object and then attaches it to the body of the property opf the `request` object before the route handler is called.

# HTTP request types

The HTTP standard talks about two properties related to request types, safety and idempotency. 

## Safety
The HTTP GET request should be safe, in particular the convention has been established that the GET and HEAD methods should not have significance of taking an action other than retrieval. These methods are considered safe.

Safety means that executing the request must not carry any side effects on the server. By side effects, we mean that the state of the database must not change as a result of the request, and the response must only return the data that already exists on the server. Nothing can ever guarantee that a GET request is safe, this is just a recommendation that is defined in the HTTP standard. By adhering to RESTful principles in our API, GET requests are always used in a way that they are safe.

## Idempotency

All HTTP requests except POST should be idempotent. An idempotent request means sending the same identical request multiple times has the same effect as sending it just once. This means that if a request does generate side effects, then the result should be the same regardless of how many times the request is sent.

# Middleware

The express json-parser used earlier is a middleware. Middleware are functions that can be used for handling `request` and `response` objects. The json-parser we used earlier takes the raw data from the requests that are stored in the `request` object, parses it into a javascript object and assigns it to the `request` object as a new property body.

In practice you can use several middleware at the same time. When you have more than one, they're executed one by one in the order that they were listed in the application code.

For example we can implement our own middleware that prints information about every request that is sent to the server, the middleware is a function that receives three parameters:
```javascript
const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}
```

At the end of the function body, the `next` function that was passed as a parameter is called. The `next` function yields control to the next middleware. Middleware is used like this:
```javascript
app.use(requestLogger)
```

Note that middleware function are called in the order that they're encountered by the javascript engine. For the case of the middleware we created above we need to place `json-parser` above `requestLogger` otherwise `request.body` will not be initialized when the logger is executed.

# Same origin policy and CORS

If we try to connect out frontend to out backend we get this error: 

`Access to XMLHttpRequest at 'http://localhost:3001/api/notes' from origin 'http://localhost:5173' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.`

Out frontend currently runs on port 5173 and our backend runs on port 3001, when our frontend tries to retrieve data from the back end we encounter this error. This issue lies with a thing called `same origin policy`. A URL's origin is define dby the combination of protocol (AKA scheme), hostname, and port.

```
http://example.com:80/index.html
  
protocol: http
host: example.com
port: 80
```

When you visit a website (e.g. https://example.com), the browser issues a request to the server on which the website (example.com) is hosted. The response sent by the server is an HTML file that may contain one or more references to external assets/resources hosted either on the same server that example.com is hosted on or a different website. When the browser sees reference(s) to a URL in the source HTML, it issues a request, if the request is issued using the URL that the source HTML was fetched from, then the browser processes the response without any issues. However, if the resource is fetched using a URL that doesn't share the same origin (scheme, host, port) as the source HTML, the browser will have to check the `Access-Control-Allow-Origin` response header. IF it contains `*` on the URL of the source HTML, the browser will process the response, otherwise the browser will refuse to process it and throws an error.

The `same-origin-policy` is a security mechanism implemented by browsers in order to prevent session hijacking among other security vulnerabilities.

In order to enable legitimate cross-origin requests W3C came up with a mechanism called CORS (Cross-Origin Resource Sharing).

The problem that we encountered is that the javascript code of an application that runs in the browser can only communicate with a server in the same origin. Because our backend server is in localhost port 3001, while our frontend is in localhost port 5173, they do not have the same origin.

We can allow requests from other origins by using node's cors middleware, we will install this in the backend repository using the command:
```
npm install cors
```

# Application to the internet

Now that the whole stack is ready we can move out application to the internet. There are many services that can be used to host an app on the internet. In fullstack open we will use developer-friendly services like Paas (Platform as a service) which takes care of installing the execution environment (eg. Node.js) and could also provide various services such as databases.

In this part of full stack open we have two options, we can either use fly.io or render. I decided to use render as it was free and fly.io costed money. For both of the services we need to change the definition of the port that our application uses at the bottom of the `index.js` file in the backend like so:
```javascript
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
```

Now we are using the port defined in the environment variable `PORT` or port 3001 if the environment variable `PORT` is undefined.

To deploy using render all u have to do is sign into render using github, once your signed in you can click and create a new web service. In the settings of the web service you will first provide a public link to your github repository, then you will provide the necessary commands to run your build and where the location you want to run it from. For example in our case we want render to run our commands from:
```
part3/notes/backend
```
For our build command we want:
```
npm install
```
For our start command we want:
```
npm run dev
```

After defining these specifications in the setting our backend will be successfully deployed.

# Serving static files from the backend

One option for deploying the frontend is to copy the production build in the frontend to the backend. First start by running `npm run build`, this creates a folder named `dist` which is the frontend production build, we will then copy this folder into the backend folder.

TO make express show static content, the page index.html and the javascript etc., it fetches, we need a built-in middleware from express called `static`.

We will add the following amidst the declarations of middleware:
```
app.use(express.static('dist'))
```

Whenever express gets an HTTP GET request it will first check if the dist directory contains a file corresponding to the request's address. If a correct file is found, express will return it.

Now HTTP GET requests to the address `www.serveraddress.com/index.html` or `www.serveraddress.com` will show the react frontend. GET requests to the address `www.serveraddress.com/api/notes` will be handled by the backend code.

Because of out situation, both the frontend and backend are at the same address, we can declare `baseUrl` as a relative URL. This means we can leave out the part declaring the server
```javascript
const baseUrl = '/api/notes'
```

After creating this new change, we have to create a new production build of the frontend and copy it to the root of the backend directory, once it is deployed the frontend can be accessed at the root address of the hostname and the backend can be accessed via the root address `/api/notes`.

# Streamlining deployment of frontend

We can create a script to deploy out frontend easily. The script will delete the current dist folder in the backend, change directory to the front end and create a new production build then copy it over to the root of the backend directory.
```
  "scripts": {
    "start": "node index.js",
    "dev": "node --watch index.js",
    "test": "echo \"Error: no test specified\" && exit 1",
     "build:ui": "rm -rf dist && cd ../frontend && npm run build && cp -r dist ../backend",
    "deploy:full": "npm run build:ui && cd .. && git add . && git commit -m uibuild && git push"
  },
```

# Proxy

Changes on the frontend have caused it to no longer work in development mode, as the connection to the backend does not work. This is due to changing the backend address to a relative URL:
```javascript
const baseUrl = '/api/notes'
```

Because in development mode the frontend is at address localhost:5173, the requests to the backend go to the wrong address localhost:5173/api/notes. The backend is at localhost:3001. If the project is created using Vite, we can easily solve this with the following addition to the vite.config.js file of the frontend directory:
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy:  {
      '/api': {
        target: 'https://fullstackopen-2urr.onrender.com/',
        changeOrigin: true,
      }
    }
  }
})
```

After restarting, the react development environment will act as proxy. If the react code makes an HTTP request to a path starting with `http://localhost5713/api`, the request will be forwarded to the server at the backend. Request to other paths will be handled normally by the development server.

Now the frontend works correctly, it functions both in development mode and in production mode together with the server. Since from the frontend's perspective all requests are made to `http://localhost:5173`, which is the single origin, there is no longer a need for the backend cors middleware. Therefore, we can remove references to the cors library from the backend's index.js file and remove cors form the projects dependencies:
```
npm remove cors
```