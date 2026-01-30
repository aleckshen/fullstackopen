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

# User administration

We want to add user authentication and authorization to our app. Users should be stored in the database and every note should be linked to the user who created it. Deleting and editing resources should only be allowed for the user who created it. We know that there is a one-to-many relationship between the user (User) and notes (Note). If we were working with a relational database then the implementation would be pretty straight forward. However we are working with document databases which makes things different.

The existing solution saves every note in the notes collection in the database. If we do not want to change this exisiting collection, then the natural choice is to save users in their own collection, users for example. Like with all document databases, we can use object IDs in Mongo to reference documents in other collections. This is similar to using foreign keys in relational databases.

# References across collections 

If we were using a relational database the note would contain a reference key to the user who created it. In document databases, we can do the same thing. Lets assume the `users` collection contains two users:
```javascript
[
  {
    username: 'mluukkai',
    _id: 123456,
  },
  {
    username: 'hellas',
    _id: 141414,
  },
]
```
The notes collection contains three notes that all have a user field that references a user in the users collections:
```javascript
[
  {
    content: 'HTML is easy',
    important: false,
    _id: 221212,
    user: 123456,
  },
  {
    content: 'The most important operations of HTTP protocol are GET and POST',
    important: true,
    _id: 221255,
    user: 123456,
  },
  {
    content: 'A proper dinosaur codes with Java',
    important: false,
    _id: 221244,
    user: 141414,
  },
]
```
Document databases do not demand the foreign key to be stored in the note resources, it could also be stored in the users collection, or even both:
```javascript
[
  {
    username: 'mluukkai',
    _id: 123456,
    notes: [221212, 221255],
  },
  {
    username: 'hellas',
    _id: 141414,
    notes: [221244],
  },
]
```
Since users can have many notes, the realted ids are stored in an array in the notes field.

# Mongoose schema for users

In this case, we decide to store the ids of the notes created by the user in the user docuement. We can define the model for representing a user in the `models/user.js` file:
```javascript
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username: String,
  name: String,
  passwordHash: String,
  notes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Note'
    }
  ],
})

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    // the passwordHash should not be revealed
    delete returnedObject.passwordHash
  }
})

const User = mongoose.model('User', userSchema)

module.exports = User
```
The ids of the notes are stored within the user docuemnt as an array of Monogp ids. The definition is as follows:
```javascript
{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Note'
}
```
The field type is `ObjectId`, meaning it refers to another document. The ref field specifies the name of the model being referenced. Mongo does not inherently know that this is a field that references notes, the syntax is purely related to and defined by Mongoose. We can expand the schema of the note defined in the `models/note.js` file so that the note contains information about the user who created it:
```javascript
const noteSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    minlength: 5
  },
  important: Boolean,

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
})
```
In stark contrast to the conventions of relational databases, references are now stored in both documents: the note references the user who created it, and the user has an array of references to all of the notes created by them.

# Creating users

We can now implement a route for creating new users. Users have a unique username, a name and something called a passwordHash. The password hash is the output of a one-way hash function applied to the users password. It is never wise to store unencrypted plain text passwords in the database. We can install the bycrypt package for generating password hashes:
```
npm install bcrypt
```
We can define a seperate router for dealing with users in a new `controllers/users.js` file. We can take the router into use in our application in the app.js file, so that it handles requests made to the `/api/users` url:
```javascript
// ...
const notesRouter = require('./controllers/notes')
const usersRouter = require('./controllers/users')

// ...

app.use('/api/notes', notesRouter)
app.use('/api/users', usersRouter)

// ...
```
The contents of the file, `controllers/users.js` containts the following:
```javascript
const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    name,
    passwordHash,
  })

  const savedUser = await user.save()

  response.status(201).json(savedUser)
```
The password sent in the request is not stored in the database, we store the hash of the password that is generated with the `bcrypt.hash` function.

We can then create some test cases that ensure that we can add users to the database and also that a user with the same name cannot be added to the database. Currently the tests will fail as we havent added functionality for handling unique usernames. Mongoose validation do not provide a direct way to check the uniqueness of a field value. However, it is possile to acheive uniqueness by defining uniqueness index for a field. The definition is done as follows:
```javascript
username: {
    type: String,
    required: true,
    unique: true // this ensures the uniqueness of username
  },
```
However, we want to be creaful when using the uniqueness index. If there are already documents in the database that violate the uniqueness condition, no index will be created. So when addy a uniqueness index, ensure that the database is in a healthy state. Mongoose validation do not detect the index violation, and instead of `ValidationError` they return an error of type `MonogoServerError`. We therefore need to extend the error handler for that case:
```javascript
const errorHandler = (error, request, response, next) => {
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })

  } else if (error.name === 'MongoServerError' && error.message.includes('E11000 duplicate key error')) {
    return response.status(400).json({ error: 'expected `username` to be unique' })
  }

  next(error)
}
```

# Populate

We would like our API to work in such a way, that whne an HTTP GET request is made to the `/api/users` route, the user objects would also contain the contents of the users notes and not just their id. In a relation database, this functionality would be implemented with a join query. 

As previously mentioned, document databases do not properly support join queries between collections, but the mongoose libriary can do some of these joins for us. With join queries in mongoose, nothing can guarentee that the state between the collections being joined is consistent, meaning that if we make a query that joins the user and notes collection, the state of the collections may change during the query.

The mongoose join is done with the populate method. We can update the route that returns all users in `controllers/users/js` file:
```javascript
usersRouter.get('/', async (request, response) => {

  const users = await User
    .find({}).populate('notes')

  response.json(users)
})
```
The populate method is chained after the find method making the initial query. The argument given to the populate method defines that the ids referencing note objects in the notes field of the user document will be replaced by the referenced note documents. Mongoose first queries the users collection for the list of users, and then queries the collection corresponding to the model object specified by the ref property in the users schema for data with the given object id.

We can also use the populate method to choose what fields we want to inlude from the documents. For example:
```javascript
usersRouter.get('/', async (request, response) => {
  const users = await User
    .find({}).populate('notes', { content: 1, important: 1 })

  response.json(users)
})
```

# Token authentication


