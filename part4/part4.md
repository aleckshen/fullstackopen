# Testing node applications

For testing we can create a file `for_testing.js` under `./utils` for some simple unit tests. There are a large number of test libraries or test runner available for javascript. Previously one of the best testing libraries was Mocha, which was replaced a few years ago by Jest. A newcomer and a more modern day testing library is called Vitest.

Nowadays, node also has a built-in test library `node-test`, which is well suited to the needs of the course. We can define the npm script `test` for the test execution:
```javascript
{
  // ...
  "scripts": {
    "start": "node index.js",
    "dev": "node --watch index.js",
    "test": "node --test",
    "lint": "eslint ."
  },
  // ...
}
```
We can create a seperate directorty for our tests called tests and create a new file called `reverse.test.js` to test for reversing a string.

# Test environment

Previously we have deployed our application using render, when the backend server is running on render it is in production mode.

The convention in node is to define the execution mode of the application with `NODE_ENV` environment variable. In our current application, we only load the environment variables defined in the `.env` file if the application is not in production mode.

It is common practice to define seperate modes for development and testing, we can change the scripts in our applications `package.json` file, so that when tests are run, `NODE_ENV` gets the value test:
```
{
  // ...
  "scripts": {
    "start": "cross-env NODE_ENV=production node index.js",
    "dev": "cross-env NODE_ENV=development node --watch index.js",
    "test": "cross-env  NODE_ENV=test node --test",
    "lint": "eslint ."
  }
  // ...
}
```
Note that we have to install cross-env by running `npm install cross-env` to ensure that it works on windows aswell.

Now we can modify the way that our application runs in different modes. As an example of this, we could define the application to use a seperate database when it is running tests. We can create our seperate database in MongoDB Atlas. However note that this solution is not optimal when many people are developing the same application. It would be ideal to test using a database that is installed and running on the developers local machine. Many ways to acheive this such as running `Mongo in-memory` or `Docker` containers. For this part of fullstackopen we will not complicate things and use MongoDB Atlas database.

We can now make the following changes to our config file:
```javascript
require('dotenv').config()

const PORT = process.env.PORT

const MONGODB_URI = process.env.NODE_ENV === 'test' 
  ? process.env.TEST_MONGODB_URI
  : process.env.MONGODB_URI

module.exports = {
  MONGODB_URI,
  PORT
}
```
After adding this we need to create a new variable `TEST_MONGODB_URI` in our `.env` file. We can use the same cluster as we did for `MONGODB_URI` except we will add it to a seperate database and collection this time.

# Supertest

We will use supertest package to help us write our tests for testing the API. We will install the package as a development dependency:
```
npm install --save-dev supertest
```
We can write our first test in the `tests/note_api.test.js` file:
```javascript
const { test, after } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)

test('notes are returned as json', async () => {
  await api
    .get('/api/notes')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

after(async () => {
  await mongoose.connection.close()
})
```
The test imports the express application from the app.js module and wraps it with the supertest function into a so-called superagent object. This object is assigned to the api variable and tests can use it for making HTTP requests to the backend.

# Initializing the database before tests

Currently, our tests have an issue where their success depends on the state of the database. The tests pass if the database happens to contain two notes, one of which has the content 'HTML is easy'. To make them more robust, we have to reset the database and generate the needed test data in a controlled manner before we run the tests. 

Our tests are already using the after function to close the connection to the database after the tests are finishe executing. The library `node:test` offers many other functions that can be used for executing operations once before any test is run or every time before a test is run.

We can initialize the database before every test with the `beforeEach` function:
```javascript
const assert = require('node:assert')

const { test, after, beforeEach } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

const Note = require('../models/note')

const api = supertest(app)


const initialNotes = [
  {
    content: 'HTML is easy',
    important: false,
  },
  {
    content: 'Browser can execute only JavaScript',
    important: true,
  },
]


beforeEach(async () => {
  await Note.deleteMany({})
  let noteObject = new Note(initialNotes[0])
  await noteObject.save()
  noteObject = new Note(initialNotes[1])
  await noteObject.save()
})

// ...
```
The database is cleared out at the beginning, and after that we save two notes stored in the initialNotes array to the database.

# Running tests one by one

When we run `npm test` we run all possible tests, however sometimes we may only want to run a select few tests. We can do this by using the `only` keyword. Instead of `test(...)`, we would write `test.only(...)`. When tests are with option `--test-only`, that is with the command:
```
npm test -- --test-only
```
Only the marked tests will be executed. However the danger of `only` comes with forgetting to remove those from the code. Another options is to specify the tests that need to be run as arguments of the npm test command.

For example, the following command only runs tests found in the `tests/note_api.test.js` file:
```
npm test -- tests/notes_api.testjs
```

# Async/await

The async/await syntax makes it possible to use asynchronous functions that return a promise in a way that makes the code look synchronous.

For example we can fetch notes from the database with promises that look like this:
```javascript
Note.find({}).then(notes => {
  console.log('operation returned the following notes', notes)
})
```
The method above returns a promise and we can access the result of the operation by registering a callback function with the `then` method.

All of the code we want to execute once the operation finishes is written in the callback function. If we wanted to make several asynchronous function calls in sequence, the code could become messy. The asynchronous calls would have to be made in the callback, and would lead to really messy code.

By chaining promises we could keep the situation somewhat under control, and avoid callback hell by creating a fairly clean chain of `then` method calls. 

However using `async` and `await` keywords introduced in ES7, offers us a clean, understandable and syntactically cleaner way to handle promises. We can fetch all of the notes in the database by utilizing the `await` operator like this:
```javascript
const notes = await Note.find({})

console.log('operation returned the following notes', notes)
```
The code looks exeactly like synchronous code, the execution of the code pauses at `const notes = await Note.find({})` and waits until the related promise is fulfilled, and then continues its execution to the next line. When the execution continues, the result of the operation that returned a promise is assigned to the `notes` variable.

The `await` keyword can only be used for asynchronous operations, it cannot be used just anywhere in js code. Using `await` is only possible inside of an `async` function. This means that in order for the previous examples to work, we have to be using `async` functions like this:
```javascript
const main = async () => {
  const notes = await Note.find({})
  console.log('operation returned the following notes', notes)

  const response = await notes[0].deleteOne()
  console.log('the first note is removed')
}

main()
```
The code declares that the function assigned to `main` is asynchronous. After this, the code calls the function with `main()`.

