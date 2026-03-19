# GraphQL

GraphQL is a query langauge for APIs and is used to replace restful APIs. The graphQL philosophy is very different from REST. REST is resource based. Every resource, for exmaple a user, has its own address which identifies it, for example `users/10`. All operations done to the resource are done with HTTP requests to its URL. The action depends on the HTTP method used. The resource-basedness of REST works well in most situations. However, it can be a bit awkward sometimes.

For example, consider a social media application, we would like to show a list of blogs that were added by users who have commented on any of the blogs of the users we follow. If the server implemented a RESTful API, we would probably have to do multiple HTTP requests from the browser before we had all the data we wanted. The requests would also return a lot of unnecessary data, and the code on the browser would probably be quite complicated.

If this was an often-used functionality, there could be a REST endpoint for it. If there were a lot of these kinds of scenarios however, it would become very laborious to implement REST endpoints for all of them.

A graphQL server is well-suited for these kinds of situations. The main principle of graphQL is that the code on the browser forms a query describing the data wanted, and sends it to the API with an HTTP POST request. Unlike REST, all graphQL queries are sent to the same adress, and their type is POST. The data described in the above scenario could be fetched with (roughly) the following query:
```
query FetchBlogsQuery {
  user(username: "mluukkai") {
    followedUsers {
      blogs {
        comments {
          user {
            blogs {
              title
            }
          }
        }
      }
    }
  }
}
```
The content of the `FetchBlogsQuery` can be roughly interpreted as: find a user named `"mluukkai"` and for each of his `followedUsers`, find all their `blogs`, and for each blog, all its `comments`, and for each `user` who wrote each comment, find their `blogs`, and return the `title` of each of them.

The servers response would be about the following JSON object:
```
{
  "data": {
    "followedUsers": [
      {
        "blogs": [
          {
            "comments": [
              {
                "user": {
                  "blogs": [
                    {
                      "title": "Goto considered harmful"
                    },
                    {
                      "title": "End to End Testing with Cypress is most enjoyable"
                    },
                    {
                      "title": "Navigating your transition to GraphQL"
                    },
                    {
                      "title": "From REST to GraphQL"
                    }
                  ]
                }
              }
            ]
          }
        ]
      }
    ]
  }
}
```
The application logic stays simple, and the code on the browser gets exactly the data it needs with a single query.

# Schemas and queries

In the heart of all graphQL applications is a schema, which describes the data sent between the client and the server. The intial schema for our phonebook is as follows:
```javascript
type Person {
  name: String!
  phone: String
  street: String!
  city: String!
  id: ID! 
}

type Query {
  personCount: Int!
  allPersons: [Person!]!
  findPerson(name: String!): Person
}
```
The schema describes two types. The first type, `Person`, determines that persons have five fields. Four of the fields are type `String`, which is one of the scalar types of graphQL. All of the string fields, except phone, must be given a value. This is marked by the exclamation makr on the schema. The type of the field `id` is ID. ID fields are strings, but graphQL ensures they are unique.

The second type is q `Query`. Practically every graphQL schema describes a Query, which tells what kind of queries can be made to the API. The phonebook describes three different queries. `personCount` returns an integer, `allPersons` returns a list of `Person` objects and `findPerson` is given a string parameter and it returns a `Person` object. The schemas essentially describes what queries the client can send to the server, what kind of parameters the queries can have, and what kind of data the queries return.

# Apollo server

We can implement a graphQL server with todays leading library Apollo Server. We will create a new npm project with `npm init` and install the required dependencies.
```
npm install npm install @apollo/server graphql
```
We will create a `index.js` file in the projects root directory with the following code:
```javascript
const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')

let persons = [
  {
    name: "Arto Hellas",
    phone: "040-123543",
    street: "Tapiolankatu 5 A",
    city: "Espoo",
    id: "3d594650-3436-11e9-bc57-8b80ba54c431"
  },
  {
    name: "Matti Luukkainen",
    phone: "040-432342",
    street: "Malminkaari 10 A",
    city: "Helsinki",
    id: '3d599470-3436-11e9-bc57-8b80ba54c431'
  },
  {
    name: "Venla Ruuska",
    street: "Nallemäentie 22 C",
    city: "Helsinki",
    id: '3d599471-3436-11e9-bc57-8b80ba54c431'
  },
]

const typeDefs = `
  type Person {
    name: String!
    phone: String
    street: String!
    city: String! 
    id: ID!
  }

  type Query {
    personCount: Int!
    allPersons: [Person!]!
    findPerson(name: String!): Person
  }
`

const resolvers = {
  Query: {
    personCount: () => persons.length,
    allPersons: () => persons,
    findPerson: (root, args) =>
      persons.find(p => p.name === args.name)
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

startStandaloneServer(server, {
  listen: { port: 4000 },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`)
})
```
The heart of the code is an ApolloServer, which is given two parameters. The first parameter, `typeDefs`, contains the grapgQL schema. The second parameter is an object, which contains the resolvers of the server. These are the code, which defines how graphQL queries are responded to. Resolvers correspond to the queries described in the schema. For example the query `query { personCount }` has the resolver `() => persons.length`.

# Apollo studio explorer

When apollo server is run in dev mode the page `http://localhost:4000` takes us to the `GraphOS Studio Explorer`. This is very useful for a developer, and can be used to make queries to the server.:w

Using the studio explorer we can create example queries to simulate the data fetching process for example:
```
query ExampleQuery {
  allPersons {
    name
    phone
  }
}
```
And the response will return:
```
{
  "data": {
    "allPersons": [
      {
        "name": "Arto Hellas",
        "phone": "040-123543"
      },
      {
        "name": "Matti Luukkainen",
        "phone": "040-432342"
      },
      {
        "name": "Venla Ruuska",
        "phone": null
      }
    ]
  }
}
```
At the left side of the explorer shows the API-documentation that it has automatically generated based on the schema.

# The default resolver

When we do a query, for example:
```javascript
query {
  findPerson(name: "Arto Hellas") {
    phone 
    city 
    street
  }
}
```
The server knows to send back exactly the fields required by the query. A graphQL server must defines resolvers for each field of each type in the schema. We have so far only defined resolvers for fieldds of the type Query, so for each query of the application.

Because we did not define resolvers for the fields of the type `Person`, Apollo has defined default resolvers for them. They work like the resolvers shown below:
```javascript
const resolvers = {
  Query: {
    personCount: () => persons.length,
    allPersons: () => persons,
    findPerson: (root, args) => persons.find(p => p.name === args.name)
  },

  Person: {
    name: (root) => root.name,
    phone: (root) => root.phone,
    street: (root) => root.street,
    city: (root) => root.city,
    id: (root) => root.id
  }
}
```
The default resolver returns the value of the corresponding field of the object. The object itself can be accessed through the first parameter of the resolver `root`. If the functionality of the default resolver is enough, you dont need to define your own. It is also possible to ddefine resolvers for only some fields of a type, and let default resolvers handle the rest.

# Mutations

We can add some functionality for adding new persons to the phonebook. In graphQL, all operations which cause a change are done with mutations. Mutations are described in the schema as the keys of type `Mutation`. The schema for a mutation for adding a new person looks as follows:
```javascript
type Mutation {
  addPerson(
    name: String!
    phone: String
    street: String!
    city: String!
  ): Person
}
```
The mutation is given the details of the person as parameters. The parameter phone is the only one which is nullable. The mutation also has a return value. The return value is type `Person`, the idea being that the details of the added person are returned if the operation is successful and if not, null. Value for the field `id` is not given as a parameter. Generating an id is better left for the server. Mutations alos require a resolver:
```javascript
const { v1: uuid } = require('uuid')

// ...

const resolvers = {
  Query: {
    // ...
  },
  Person: {
    // ...
  },

  Mutation: {
    addPerson: (root, args) => {
      const person = { ...args, id: uuid() }
      persons = persons.concat(person)
      return person
    }
  }
}

// ...
```
The mutation adds the object given to it as a parameter `args` to the array `persons`, and returns the object it added to the array. The `id` field is given a unique value using the uuid library. A new person can be added with the following mutation:
```javascript
mutation {
  addPerson(
    name: "Pekka Mikkola"
    phone: "045-2374321"
    street: "Vilppulantie 25"
    city: "Helsinki"
  ) {
    name
    phone
    address {
      city
      street
    }
    id
  }
}
```

# Error handling

If we try to create a new person, but the parameters do not correspond with the schema description, the server gives an error message. Some of the error handling can be automatically done with graphQL validation. However graphQL cannot handle everything automatically. For example, stricter rules for data sent to a mutation have to be added manmually. An error could be handled by throwing `GraphQLError` with a proper error code. We can prevent adding the same name to the phonebook multiple times:
```javascript
const { GraphQLError } = require('graphql')

// ...

const resolvers = {
  // ..
  Mutation: {
    addPerson: (root, args) => {

      if (persons.find(p => p.name === args.name)) {
        throw new GraphQLError(`Name must be unique: ${args.name}`, {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.name
          }
        })
      }

      const person = { ...args, id: uuid() }
      persons = persons.concat(person)
      return person
    }
  }
}
```
So if the name to be added already exists in the phonebook we will throw `GraphQLError`.

# Enum

We can add the possibility to filter the query returning all persons with the parameter phone so that it returns only persons with a phone number:
```javascript
query {
  allPersons(phone: YES) {
    name
    phone 
  }
}
```
The schema changes like so:
```javascript
enum YesNo {
  YES
  NO
}

type Query {
  personCount: Int!

  allPersons(phone: YesNo): [Person!]!
  findPerson(name: String!): Person
}
```
The type `YesNo` is a graphQL enum, or an enumerable, with two possible values: `YES` or `NO`. in the qeury `allPersons`, the parameter `phone` has the type `YesNo`, but is nullable.

The resolver then changes to:
```javascript
Query: {
  personCount: () => persons.length,

  allPersons: (root, args) => {
    if (!args.phone) {
      return persons
    }
    const byPhone = (person) =>
      args.phone === 'YES' ? person.phone : !person.phone
    return persons.filter(byPhone)
  },
  findPerson: (root, args) =>
    persons.find(p => p.name === args.name)
},
```

# More on queries

With graphQL, it is possible to combine multiple fields of type `Query`m or "seperate queries" into one qeury. For example, the following query returns both the amount of persons in the phonebook and their names:
```javascript
query {
  personCount
  allPersons {
    name
  }
}
```
The response looks like this:
```javascript
{
  "data": {
    "personCount": 3,
    "allPersons": [
      {
        "name": "Arto Hellas"
      },
      {
        "name": "Matti Luukkainen"
      },
      {
        "name": "Venla Ruuska"
      }
    ]
  }
}
```
Combined query can also use the same query multiple times. However the queries alternative names like this:
```javascript
query {
  havePhone: allPersons(phone: YES){
    name
  }
  phoneless: allPersons(phone: NO){
    name
  }
}
```

# Sending graphQL queries

We will implement a react app that uses the graphQL server we created. In theory, we could use graphQL with HTTP POST requests. For example we could send a POST request with the body:
```
{
  "query": "query { allPersons{ name } }"
}
```
The communication works by sending HTTP POST requests to `http://localhost:4000/graphql`. The query itself is a string sent as the value of the key query. We could take care of the communication between the react app and graphQL by using axios. However, most of the time, it is not sensible to do so. It is a better idea to use a higher-order library capable of abstracting the unncessary details of the communication.

At the moment, there are two good: Relay Facebook and Apollo Client, which is the client side of the same library we used in the previous section. Apollo is absolutely the most popular of the two, and we will use it in this section as well.

# Apollo client

We can create a new react app and install apollo client with the following command:
```
npm install @apollo/client graphql
```
We will replace the default contents of the file `main.jsx` with the following program skeleton:
```javascript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

import { ApolloClient, gql, HttpLink, InMemoryCache } from '@apollo/client'

const client = new ApolloClient({
  link: new HttpLink({
    uri: 'http://localhost:4000',
  }),
  cache: new InMemoryCache(),
})

const query = gql`
  query {
    allPersons {
      name
      phone
      address {
        street
        city
      }
      id
    }
  }
`

client.query({ query }).then((response) => {
  console.log(response.data)
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```
The beginning of the code creates a new client object, which is then used to send a query to the server:
```javascript
client.query({ query }).then((response) => {
  console.log(response.data)
})
```
The application can communicate with a graphQL server using the `client` object. The client can be made accessible for all components of the application by wrapping the `App` component with `ApolloProvider`:
```javascript
import { ApolloProvider } from '@apollo/client/react'

const client = new ApolloClient({
  link: new HttpLink({
    uri: 'http://localhost:4000',
  }),
  cache: new InMemoryCache(),
})

// ...

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </StrictMode>,
)
```

# Making queries

We can now implement the main view of the application, which shows a list of person's name and phone number. Apollo client offers a few alternative for making queries. Currently, the use of the hook function `useQeury` is the dominant practice.

The query is made by the app component, the code of which is as follows:
```javascript
import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'

const ALL_PERSONS = gql`
  query {
    allPersons {
      name
      phone
      id
    }
  }
`

const App = () => {
  const result = useQuery(ALL_PERSONS)

  if (result.loading) {
    return <div>loading...</div>
  }

  return (
    <div>
      {result.data.allPersons.map(p => p.name).join(', ')}
    </div>
  )
}

export default App
```
When called, `useQuery` makes the query it receives as a parameter. It returns an object with multiple fields. The field `loading` is true if the query has not received a response yet. When a response is receivedd, the result of the `allPersons` query can be found in the data field, and we can render the list of names to the screen with the map function.

# Named queries and variables

We can implement functionality for viewing the adress details of a person. The `findPerson` query is well-suited for this. The queries we did in the last chapter had the parameter hardcoded into the query:
```javascript
query {
  findPerson(name: "Arto Hellas") {
    phone 
    city 
    street
    id
  }
}
```
When we do queries programmatically, we must be able to give them parameters dynamically. GraphQL variables are well-suited fpr this. TO be able to use variables, we must also name our queries. A good format for the query is this:
```javascript
query findPersonByName($nameToSearch: String!) {
  findPerson(name: $nameToSearch) {
    name
    phone 
    address {
      street
      city
    }
  }
}
```
The name of the query is `findPersonByName`, and it is given a string `$nameToSearch` as a parameter. It is also possible to do queries with parameters with the apollo explorer. The parameters are given in `Variables`.

The `useQuery` hook is well-suited for situations where the query is done when the compoennt is rendered. However, we now want to make the query only when a user wants to see the details of a specific person, so the query is done only as required.

One possibility for this kind of situation is the hook function `useLazyQuery` that would make it possible to define a query which is executed when the user wants to see the detailed information of a person. However, in our case we can stick to `useQuery` and use the option skip, which makes it possible to do the query only if a set condition is true.

With the use of the skip option we can have the following code:
```javascript
const result = useQuery(FIND_PERSON, {
  variables: { nameToSearch },

  skip: !nameToSearch,
})
```
When the user is not interested in seeing the detailed info of any person, the state variable `nameToSearch` is null and the query is not executed.

# Cache

When we do multiple queires, for example with the adress details of Arto Hellas, we notice something interesting: the query to the backend is done only the first time around. After this, despite the same qeury being done again by the code, the qeury is not sent to the backend.

Apollo client saves the response of queries to cache. To optimize performance if the response to a query is already in the cache, the query is not sent to the server at all.

# Doing mutations

In the previous chapter, we hardcoded the parameters for mutations. Now, we need a version of the addPerson mutation which uses variables:
```javascript
const CREATE_PERSON = gql`
  mutation createPerson(
    $name: String!
    $street: String!
    $city: String!
    $phone: String
  ) {
    addPerson(name: $name, street: $street, city: $city, phone: $phone) {
      name
      phone
      id
      address {
        street
        city
      }
    }
  }
`
```
The hook function `useMutation` provides the functionality for making mutations. We can create a new component `PersonForm` for adding a new person to the application. The contents of the file `src/components/PersonForm.jsx` are as follows:
```javascript
import { useState } from 'react'
import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

const CREATE_PERSON = gql`
  mutation createPerson(
    $name: String!
    $street: String!
    $city: String!
    $phone: String
  ) {
    addPerson(name: $name, street: $street, city: $city, phone: $phone) {
      name
      phone
      id
      address {
        street
        city
      }
    }
  }
`

const PersonForm = () => {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [street, setStreet] = useState('')
  const [city, setCity] = useState('')


  const [createPerson] = useMutation(CREATE_PERSON)

  const submit = (event) => {
    event.preventDefault()


    createPerson({ variables: { name, phone, street, city } })

    setName('')
    setPhone('')
    setStreet('')
    setCity('')
  }

  return (
    <div>
      <h2>create new</h2>
      <form onSubmit={submit}>
        <div>
          name <input value={name}
            onChange={({ target }) => setName(target.value)}
          />
        </div>
        <div>
          phone <input value={phone}
            onChange={({ target }) => setPhone(target.value)}
          />
        </div>
        <div>
          street <input value={street}
            onChange={({ target }) => setStreet(target.value)}
          />
        </div>
        <div>
          city <input value={city}
            onChange={({ target }) => setCity(target.value)}
          />
        </div>
        <button type='submit'>add!</button>
      </form>
    </div>
  )
}

export default PersonForm
```
We can define mutatio functions using the `useMutation` hook. The hook returns an array, the first element of which contains the function to cause the mutation.
```javascript
const [createPerson] = useMutation(CREATE_PERSON)
```
The query variables receive values when the query is made:
```javascript
createPerson({ variables: { name, phone, street, city } })
```
New persons are added just fine, but the screen is not updated. This is because apollo client cannot automatically update the cache of an application, so it still contains the state from before the mutation. We could update the screen by reloading the page, as the cahse is emptied when the page is reloaded. However, there must be a better way to do this.

# Updating the cache

There are a few different solutions for this. One way is to make the query for all persons poll the server, or make the query repeadtedly. The change is small. Lets set the query to poll every two seconds.
```javascript
const App = () => {
  const result = useQuery(ALL_PERSONS, {

    pollInterval: 2000
  })

  if (result.loading)  {
    return <div>loading...</div>
  }

  return (
    <div>
      <Persons persons = {result.data.allPersons}/>
      <PersonForm />
    </div>
  )
}

export default App
```
The solution is simple, and every time a user adds a new person, it appears immediately on the screen of all users. The downside of polling is, of course, the unnecessary network traffic it causes. In addition, the page may start to flicker, since the component is re-rendered with each query update and `result.loading` is true for a breif moment so a `loading...` text flashes on the screen for an instant.

Another easy way to keep the cache in sync is to use the `useMutation` hooks `refetchQueries` parameter to define that the query fetching all persons is done again whenever a new person is created.
```javascript
// ...


const ALL_PERSONS = gql`
  query {
    allPersons {
      name
      phone
      id
    }
  }
`


const PersonForm = () => {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [street, setStreet] = useState('')
  const [city, setCity] = useState('')


  const [createPerson] = useMutation(CREATE_PERSON, {
    refetchQueries: [{ query: ALL_PERSONS }],
  })

  // ...
}
```
The pros and cons of this solution are almost oppoisite of the previous one. THere is no extra web traffic because queries are not done just in case. However, if one user now updates the state of the server, the changes do not show to other users immediately. If you want to do multiple queries, you can pass multiple objects inside refetchQueries. This will allow you to update different parts of your app at the same time, for example:
```javascript
const [createPerson] = useMutation(CREATE_PERSON, {
  refetchQueries: [
    { query: ALL_PERSONS },
    { query: OTHER_QUERY },
    { query: ANOTHER_QUERY },
  ], // pass as many queries as you need
})
```

# Handling mutation errors

If we try to create an invalid person, for example by using a name that already exists in the application, nothing happens. The person is not added to the application, but we alos do not receive any error message.

Earlier, we defined a check on the server that prevents adding another person with the same name and throws and error in such situation. However, if the error is not yet handled in the frontend. Using the `onError` option of the `useMutation` hook, it is possible to register an error handler function for mutations.

We can register an error handler for the mutation. The `PersonForm` component receives a `setError` fuinction as a prop, which is used to set a message indicating the error:
```javascript
const PersonForm = ({ setError }) => {
  // ... 

  const [ createPerson ] = useMutation(CREATE_PERSON, {
    refetchQueries: [  {query: ALL_PERSONS } ],

    onError: (error) => setError(error.message),
  })

  // ...
}
```
We also need to create a seperate component for the notification in the file `src/components/Notify.jsx`:
```javascript
const Notify = ({ errorMessage }) => {
  if (!errorMessage) {
    return null
  }
  return (
    <div style={{ color: 'red' }}>
      {errorMessage}
    </div>
  )
}

export default Notify
```
The component receives a possible error message as a prop. If an error message is set, it is rendered on the screen. We can render the `Notify` component that displays the error message in the file `App.jsx`:
```javascript
import Notify from './components/Notify'

// ... 

const App = () => {

  const [errorMessage, setErrorMessage] = useState(null)

  const result = useQuery(ALL_PERSONS)

  if (result.loading)  {
    return <div>loading...</div>
  }


  const notify = (message) => {
    setErrorMessage(message)
    setTimeout(() => {
      setErrorMessage(null)
    }, 10000)
  }

  return (
    <div>

      <Notify errorMessage={errorMessage} />
      <Persons persons = {result.data.allPersons} />

      <PersonForm setError={notify} />
    </div>
  )
}
```

# Updating a phone number

We also want to be able to update phone numbers in our application. The solution is almost identical to the one we used for adding new persons. The mutation again requires the use of variables. We can update our queries.js file with the following query:
```javasciprt
export const EDIT_NUMBER = gql`
  mutation editNumber($name: String!, $phone: String!) {
    editNumber(name: $name, phone: $phone) {
      name
      phone
      address {
        street
        city
      }
      id
    }
  }
`
```
We can create a new component `PhoneForm` that allows us to update the phone number:
```javascript
import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { EDIT_NUMBER } from '../queries'

const PhoneForm = () => {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')


  const [ changeNumber ] = useMutation(EDIT_NUMBER)

  const submit = (event) => {
    event.preventDefault()


    changeNumber({ variables: { name, phone } })

    setName('')
    setPhone('')
  }

  return (
    <div>
      <h2>change number</h2>

      <form onSubmit={submit}>
        <div>
          name <input
            value={name}
            onChange={({ target }) => setName(target.value)}
          />
        </div>
        <div>
          phone <input
            value={phone}
            onChange={({ target }) => setPhone(target.value)}
          />
        </div>
        <button type='submit'>change number</button>
      </form>
    </div>
  )
}

export default PhoneForm
```
Suprisingly, when a persons number is changed, the new number automatically appears on the list of persons rendered by the `Persons` component. This happens because each person has an identifying field of type ID, so the persons details saved to the cache update automatically when they are changed with the mutation.

Our application still has a small flaw, if we try to change the number of a person who doesnt exist, nothing happens. Since this isn't considered an error state from graphQLs point of view, registering an `onError` error handler wouldnt be useful in this situation. However, we can add an `onCompleted` callback to the `useMutation` hook, where we can generate a potential error message:
```javascript
const PhoneForm = ({ setError }) => {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')


  const [changeNumber] = useMutation(EDIT_NUMBER, {
    onCompleted: (data) => {
      if (!data.editNumber) {
        setError('person not found')
      }
    }
  })

  // ...
}
```

# Refactoring the backend

So far we've written all the code in the `index.js` files. As the application grows, this is no longer sensible. Its also good programming practicet so separate different responsibilities of the application into their own modules. We can refactor our backend by splitting it into multiple files, we will start by extracting the applications typeDefs into a file called `schema.js`.

Next we will move the code responsible for the resolvers into its own module, `resolvers.js`. For simplicity the persons array holding the people data is now placed in the same file as the resolvers. This array will soon be removed when we switch to using a database for storing data.

Finally we will move the code responsible for starting the apollo server into its own file `server.js`.
```javascript
const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')

const resolvers = require('./resolvers')
const schema = require('./schema')

const startServer = (port) => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  })

  startStandaloneServer(server, {
    listen: { port: port },
  }).then(({ url }) => {
    console.log(`Server ready at ${url}`)
  })
}

module.exports = startServer
```
Starting the apollo server is now handled inside the `startServer` function we defined ourselves. We can export the function and start the server from outside the module, from the `index.js` file. The function takes as a parameter the port that apollo server will listen on.

We can install dotevn library so that we can define environment variables in a `.env` file:
```
npm install dotenv
```
Now our `index.js` file will look like this:
```javascript
const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')

const resolvers = require('./resolvers')
const schema = require('./schema')

const startServer = (port) => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  })

  startStandaloneServer(server, {
    listen: { port: port },
  }).then(({ url }) => {
    console.log(`Server ready at ${url}`)
  })
}

module.exports = startServer
```

# Mongoose and apollo

We will now start using a mongoDB database in our application. We will introduce the database by following the approach used in parts 3 and 4 earlier. We will first install mongoose:
```
npm install mongoose
```
We can define the schema in the file `models/person.js` as follows:
```javascript
const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 5
  },
  phone: {
    type: String,
    minlength: 5
  },
  street: {
    type: String,
    required: true,
    minlength: 5
  },
  city: {
    type: String,
    required: true,
    minlength: 3
  },
})

module.exports = mongoose.model('Person', schema)
```
We also included a few validations. `required = ture`, which makes sure that a value exists, is actually redundant, we already ensure that the fields exist with graphQL. However, it is good to also keep validation in the database.

We can create a seperate module `db.js` for the code that establishes the database connection:
```javascript
const mongoose = require('mongoose')

const connectToDatabase = async (uri) => {
  console.log('connecting to database URI:', uri)

  try {
    await mongoose.connect(uri)
    console.log('connected to MongoDB')
  } catch (error) {
    console.log('error connection to MongoDB:', error.message)
    process.exit(1)
  }
}

module.exports = connectToDatabase
```
The module defines the function `connectToDatabase`, which receives the database URI as a parameter and takes care of connecting to the database. We can now use this module in the `index.js` file.
```javascript
require('dotenv').config()


const connectToDatabase = require('./db')
const startServer = require('./server')


const MONGODB_URI = process.env.MONGODB_URI
const PORT = process.env.PORT || 4000


const main = async () => {
  await connectToDatabase(MONGODB_URI)
  startServer(PORT)
}

main()
```
Because the async/await syntax can only be used inside functions, we now define a simple `main` function that handles starting the application. This allows us to call the function that creates the database connection using the `await` keyword.

The value of the `MONGODB_URI` os obtained from an environment variable, so we need to add an appropriate value for in the `.env` file. The application first calls the function that creates the database connection, and once the database connection has been established, it starts the graphQL server.

The content of `resolver.js`, which is responsible for the application logic, will change almost completely. We can get the application to work largely by mkaing the following changes:
```javascript
const { GraphQLError } = require('graphql')
const Person = require('./models/person')

const resolvers = {
  Query: {
    personCount: async () => Person.collection.countDocuments(),
    allPersons: async (root, args) => {
      // filters missing
      return Person.find({})
    },
    findPerson: async (root, args) => Person.findOne({ name: args.name }),
  },
  Person: {
    address: ({ street, city }) => {
      return {
        street,
        city,
      }
    },
  },
  Mutation: {
    addPerson: async (root, args) => {
      const nameExists = await Person.exists({ name: args.name })

      if (nameExists) {
        throw new GraphQLError(`Name must be unique: ${args.name}`, {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.name,
          },
        })
      }

      const person = new Person({ ...args })
      return person.save()
    },
    editNumber: async (root, args) => {
      const person = await Person.findOne({ name: args.name })

      if (!person) {
        return null
      }

                  person.phone = args.phone
      return person.save()
    },
  },
}

module.exports = resolvers
```
The changes are pretty straight forward. There are a few noteworthy things. As we remember, in Mongo, the identifying field of an object is called `_id` and we previously had to parse the name of the field to `id` ourselves. Now graphQL can do this automatically.

Another noteworthy thing is that the resolver function now returns a promise, when they previously returned normal objects. When a resolver returns a promise, apollo server sends back the value which to the promise resolves to.

For example, if the following resolver function is executed,
```javascript
allPersons: async (root, args) => {
  return Person.find({})
},
```
Apollo server waits for the promise to resolve, and returns the result. So apollo works roughly like this:
```javascript
allPersons: async (root, args) => {
  const result = await Person.find({})
  return result
}
```
We can complete the `allPersons` resolver so it takes the optional parameter `phone` into account:
```javascript
Query: {
  // ..
  allPersons: async (root, args) => {
    if (!args.phone) {
      return Person.find({})
    }

    return Person.find({ phone: { $exists: args.phone === 'YES' } })
  },
},
```
If the query has not been given a parameter `phone`, all persons are returned. If the parameter has the value `YES`, the result of the query
```javascript
Person.find({ phone: { $exists: true }})
```
is returned, so the objects in which the fieldn `phone` has a value.
If the parameter has the value `NO`, the query returns the objects in which `phone` field has no value:
```javascript
Person.find({ phone: { $exists: false }})
```

# Validation

As well as in graphQL, the input is now validated using the validations defined in the mongoose schema. For handling possible validation errors in the schema, we must add an error-handling `try/catch` block to the `save` method. When we end up in the catch, we throw an exceptioj `GraphQLError` with error code:
```javascript
Mutation: {
  addPerson: async (root, args) => {
      const nameExists = await Person.exists({ name: args.name })

      if (nameExists) {
        throw new GraphQLError(`Name must be unique: ${args.name}`, {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.name,
          },
        })
      }

      const person = new Person({ ...args })


      try {
        await person.save()
      } catch (error) {
        throw new GraphQLError(`Saving person failed: ${error.message}`, {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.name,
            error
          }
        })
      }
 
      return person
  },
    editNumber: async (root, args) => {
      const person = await Person.findOne({ name: args.name })

      if (!person) {
        return null
      }

      person.phone = args.phone


      try {
        await person.save()
      } catch (error) {
        throw new GraphQLError(`Saving number failed: ${error.message}`, {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.name,
            error
          }
        })
      }
 
      return person
    }
}
```
We have also added the mongoose error and the data that caused the error to the extensions object that is used to convey more info about the cause of the error to the caller. The frontend can then display this information to the user, who can try the operation again with a better input.

# User and log in

Let's add user management to our application. For simplicity's sake, let's assume that all users have the same password which is hardcoded to the system. It would be straightforward to save individual passwords for all users following the principles from part 4, but because our focus is on GraphQL, we will leave out all that extra hassle this time. We can create the user schema in the file `models/user.js`:
```javascript
const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    minlength: 3
  },
  friends: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Person'
    }
  ],
})

module.exports = mongoose.model('User', schema)
```
Every user is connected to a bunch of other persons in the system through the `friends` field. The idea is that when a user, e.g. `mluukai`, adds a person, e.g. `Arto Hellas`, to the list, the person is added to their `friends` list. This way, logged-in users can have their own personalized view in the application.

Logging in and identifying the user are handled the same way we used in part4 when we used REST, by using tokens. We can extend the graphQL schema like so:
```javascript
type User {
  username: String!
  friends: [Person!]!
  id: ID!
}

type Token {
  value: String!
}

type Query {
  // ..
  me: User
}

type Mutation {
  // ...
  createUser(username: String!): User
  login(username: String!, password: String!): Token
}
```
The query `me` returns the currently logged-in user. New users are created the `createUser` mutation, and loggin in happens with the `login` mutation. Lets install the jsonwebtoken library:
```
npm install jsonwebtoken
```
The resolvers of the new mutations are as follows:
```javascript
const jwt = require('jsonwebtoken')
const User = require('./models/user')

Mutation: {
  // ..
  createUser: async (root, args) => {
    const user = new User({ username: args.username })

    return user.save()
      .catch(error => {
        throw new GraphQLError(`Creating the user failed: ${error.message}`, {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.username,
            error
          }
        })
      })
  },
  login: async (root, args) => {
    const user = await User.findOne({ username: args.username })

    if ( !user || args.password !== 'secret' ) {
      throw new GraphQLError('wrong credentials', {
        extensions: {
          code: 'BAD_USER_INPUT'
        }
      })        
    }

    const userForToken = {
      username: user.username,
      id: user._id,
    }

    return { value: jwt.sign(userForToken, process.env.JWT_SECRET) }
  },
},
```
The new user mutation is pretty straight forward. The login mutation check if the usernamne/password pair is valid. And if it is indeed valid, it returns a jswt token familiar from part4. Note that the `JWT_SECRET` must be defined in the `.env` file.

User creation is done now as follows:
```javascript
mutation {
  createUser (
    username: "mluukkai"
  ) {
    username
    id
  }
}
```
The mutation for logging in looks like this:
```javascript
mutation {
  login (
    username: "mluukkai"
    password: "secret"
  ) {
    value
  }
}
```
Just like in the previous case with REST, the idea now is that a logged-in user adds a token they receive upon login to all their requests. And just like with REST, the token is added to graphQL queries using the authorization header.

On the backend, the most convenient way to pass the token that arrives with the request to the resolvers is to use apollo servers context. With the context, we can perform thing that are common to all queries and mutations, for example identifying the user associated with the request.

We can change the backend startup so that the object passed as the second parameter to the `startStandaloneServer` function inlcudes a context field, and we can create a helper function `getUserFromAuthHeader` to verify the validity of the token and to find the user from the database:
```javascript
const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')

const jwt = require('jsonwebtoken')

const resolvers = require('./resolvers')
const typeDefs = require('./schema')

const User = require('./models/user')


const getUserFromAuthHeader = async (auth) => {
  if (!auth || !auth.startsWith('Bearer ')) {
    return null
  }
 
  const decodedToken = jwt.verify(auth.substring(7), process.env.JWT_SECRET)
  return User.findById(decodedToken.id).populate('friends')
}

const startServer = (port) => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  })

  startStandaloneServer(server, {
    listen: { port },

    context: async ({ req }) => {
      const auth = req.headers.authorization
      const currentUser = await getUserFromAuthHeader(auth)
      return { currentUser }
    },
  }).then(({ url }) => {
    console.log(`Server ready at ${url}`)
  })
}

module.exports = startServer
```
The code we defined first extracts the token contained in the requests `Authorization` header. The helper function `getUserFromAuthHeader` decodes the token and loops up the corresponding user from the database. If the token is not valid or the user cannot be found, the function returns null.

Finally, the context field `currentUser` is set to the user object corresnponding to the requester, or to null if no user was found.

The context value is passed to resolvers as the `third` parameter. The resolver for the `me` query is very simple: it only returns the currently logged-in user, which it gets from the resolver parameter `context`, from the field `currentUser`:
```javascript
Query: {
  // ...
  me: (root, args, context) => {
    return context.currentUser
  }
},
```
If the header contains a valid token, the query returns the details of the user identified by the token.

# Friends list

We can complete the applications backend so that adding and editing persons require logging in, and added persons are automatically added to the friends list of the user. We can first remove all persons not in anyones friends list from the database. `addPerson` mutation changes like so:
```javascript
Mutation: {

  addPerson: async (root, args, context) => {
    const currentUser = context.currentUser
 
    if (!currentUser) {
      throw new GraphQLError('not authenticated', {
        extensions: {
          code: 'UNAUTHENTICATED',
        }
      })
    }

    const nameExists = await Person.exists({ name: args.name })

    if (nameExists) {
      throw new GraphQLError(`Name must be unique: ${args.name}`, {
        extensions: {
          code: 'BAD_USER_INPUT',
          invalidArgs: args.name,
        },
      })
    }

    const person = new Person({ ...args })

    try {
      await person.save()

      currentUser.friends = currentUser.friends.concat(person)
      await currentUser.save()
    } catch (error) {
      throw new GraphQLError(`Saving person failed: ${error.message}`, {
        extensions: {
          code: 'BAD_USER_INPUT',
          invalidArgs: args.name,
          error
        }
      })
    }

    return person
  },
  //...
}
```
If a logged-in user cannot be found from the context, an `GraphQLError` with a proper message is thrown. Creating new persons is now done with `async/await` syntax, because if the operation is successful, the created person is added to the friends list of the user.

We can alos add the ability to add a person to your own friends list. The mutation schema is as follows:
```javascript
type Mutation {
  // ...
  addAsFriend(name: String!): User
}
```
And the mutations resolver:
```javascript
  addAsFriend: async (root, args, { currentUser }) => {
    if (!currentUser) {
      throw new GraphQLError('not authenticated', {
        extensions: { code: 'UNAUTHENTICATED' },
      })
    }

    const nonFriendAlready = (person) =>
      !currentUser.friends
        .map((f) => f._id.toString())
        .includes(person._id.toString())

    const person = await Person.findOne({ name: args.name })

    if (!person) {
      throw new GraphQLError("The name didn't found", {
        extensions: {
          code: 'BAD_USER_INPUT',
          invalidArgs: args.name,
        },
      })
    }

    if (nonFriendAlready(person)) {
      currentUser.friends = currentUser.friends.concat(person)
    }

    await currentUser.save()

    return currentUser
  },
```
The following query now returns the users friends list:
```javascript
query {
  me {
    username
    friends{
      name
      phone
    }
  }
}
```

# User login

We need to ensure that we can log in since our actions need to be authenticated in order to make actions such as creating a new people. We can first define the user mutation for loggin in at `src/queries.js`:
```javascript
export const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password)  {
      value
    }
  }
```
We will then define the `LoginForm` component responsible for logging in in the file `src/components/LoginForm.jsx`.
```javascript
import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { LOGIN } from '../queries'

const LoginForm = ({ setError, setToken }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const [ login ] = useMutation(LOGIN, {
    onCompleted: (data) => {
      const token = data.login.value
      setToken(token)
      localStorage.setItem('phonebook-user-token', token)
    },
    onError: (error) => {
      setError(error.message)
    }
  })

  const submit = (event) => {
    event.preventDefault()
    login({ variables: { username, password } })
  }
// .....
```
The component receives the functions `setError` and `setToken` as props, which can be used to change the application state. Defining state management is left to the `App` component. For the `useMutation` function that performs the login, an `onCompleted` callback function is defined.

In the app component we will initialize the token with:
```javascript
const [token, setToken] = useState(localStorage.getItem('phonebook-user-token'))
```
And also have the following check:
```javascript
if (!token) {
    return (
      <div>
        <Notify errorMessage={errorMessage} />
        <h2>Login</h2>
        <LoginForm
          setToken={setToken}
          setError={notify}
        />
      </div>
    )
  }

```
The token is now initalized from a token value that may be found in local storage. This was the token is also restored when the page is reloaded, and the user stays logged in. If local storage does not contain a value for the key `phone-book-user`, the token value will be `null`.

We will also add a button that allows a logged-in user to log out. In the buttons click handler, we set token to null, remove the token from local stoarge, and reset the apollo client cache:
```javascript
import { useApolloClient, useQuery } from '@apollo/client/react'
// ...
const client = useApolloClient()
// ...
const onLogout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
  }
//...
<button onClick={onLogout}>logout</button>
```
Resetting the cache is done using the apollo `client` objects `resetStore` method, and the client itself can be accessed with the `useApolloClient` hook. Clearing the cache is important, because some queires may have fetched data into the cache that only an authenticated user is allowed to access.

# Adding a token header

After the backend changes, creating new persons require that a valid user token is sent with the request. This requires changes to the apollo client configuration in the `main.jsx` file.
```javascript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'
import { ApolloProvider } from '@apollo/client/react'

import { SetContextLink } from '@apollo/client/link/context'


const authLink  = new SetContextLink(({ headers }) => {
  const token = localStorage.getItem('phonebook-user-token')
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : null,
    }
  }
})


const httpLink = new HttpLink({ uri: 'http://localhost:4000' })


const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: authLink.concat(httpLink)
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </StrictMode>,
)
```
As before, the server URL is wrapped using the HttpLink constructor to create a suitable `httpLink` object. This time, however, it is modified using the `context` defined y the `authLink` object so that, for each request, the authorizaiton header is set to the token that may be stored in local storage. Creating new persons and changing numbers work again.

# Fixing validation

In the application, it should be possible to add a person without a phone number. However currently it doesn't work. Validation fails because frontend sends an empty string as the value of `phone`. Lets change the function creating new persons so that it sets `phone` to `undefined` if user has not given a value:
```javascript
 createPerson({
      variables: {
        name,
        street,
        city,
        phone: phone.length > 0 ? phone : undefined,
      },
    })
```
From the perspective of the backend and the database, the `phone` attribute now has no value if the user leaves the field empty. Adding a person without a phone number works again.

There is also an issue with the functionality for changing a phone number. The database validations require that the phone number must be at least 5 characters long, but if we try to update an existing persons phone number to one that is too short, nothing seems to happen. The persons phone number is not updated, but on the other hand no error message is shown either.

We can modify the application so that validation errors are also shwon when changing a phone number:
```javascript
const PhoneForm = ({ setError }) => {
  // ...

  const submit = async (event) => {
    event.preventDefault()

    try {
      await changeNumber({ variables: { name, phone } })
    } catch (error) {
      setError(error.message)
    }

    setName('')
    setPhone('')
  }

  // ...
}
```
The request that updates the number, `changeNumber`, is now executed inside a `try` block. If the database validations fail, execution ends up in a catch block, where an appropriate error message is set in the application using the `setErrror` function.

# Updating cache, revisited

We have to update the cache of the apollo client on creating new persons. We can update it using the mutations `refetchQueries` option to define that the `ALL_PERSONS` query is done again.
```javascript
const PersonForm = ({ setError }) => {
  // ...

  const [createPerson] = useMutation(CREATE_PERSON, {
    onError: (error) => setError(error.message),

    refetchQueries: [{ query: ALL_PERSONS }],
  })

// ...
}
```
This approach is pretty good, the drawback being that the qeury is always rerun with any updates. It is possible to optimize the solution by updating the cache manually. This is done by defining ab appropriate update callback for the mutations instead of using the `refetchQueries` attribute. Apollo executes this callback after mutation completes:
```javascript
const PersonForm = ({ setError }) => {
  // ...

  const [createPerson] = useMutation(CREATE_PERSON, {
    onError: (error) => setError(error.message),

    update: (cache, response) => {
      cache.updateQuery({ query: ALL_PERSONS }, ({ allPersons }) => {
        return {
          allPersons: allPersons.concat(response.data.addPerson),
        }
      })
    },
  })
 
  // ..
}
```
The callback function is given a reference to the cache and the data returned by the mutation as parameters. For example, in our case, this would be the created person.

Using the function `updateQuery` the code updates the query `ALL_PERSONS` in the cache by adding the new person to the cached data. In some situations, the only sensible way to keep the cache up to date is using the `update` callback.

When necessary, it is possible to disable cache for the whole application or single queries by setting the field managing the use of cache, `fetchPolicy` as `no-cache`. 

Be diligent with the cache. Old data in the cache can cause hard to find bugs. As we know, keeping the cache up to date is very challenging.

# Fragments

It is pretty common in grapghQL that multiple queries return similar results. When choosing the fields to return, both queries have to define exactly the same fields. Such situations can be simplified by using fragments. A fragment that select all of a persons details looks like this:
```javascript
fragment PersonDetails on Person {
  name
  phone 
  address {
    street 
    city
  }
}
```
With the fragment, we can do the queries in a compact form:
```javascript
query {
  allPersons {

    ...PersonDetails
  }
}

query {
  findPerson(name: "Pekka Mikkola") {

    ...PersonDetails
  }
}
```
The fragments are not defined in the graphQL schema, bbut in the client. The fragments must be declared when the client uses them for queries. We will store the fragment once and store it in a variable. For example we will add the fragment definition to the beginning of the `queries.js` file.
```javascript
const PERSON_DETAILS = gql`
  fragment PersonDetails on Person {
    id
    name
    phone 
    address {
      street 
      city
    }
  }
`
```
The fragment can now bbe embedded into all queries and mutations that need it using the dollar curly braces operation:
```javascript
export const FIND_PERSON = gql`
  query findPersonByName($nameToSearch: String!) {
    findPerson(name: $nameToSearch) {
      ...PersonDetails
    }
  }

  ${PERSON_DETAILS}
`
```

# Subscriptions

Along with query and mutation types, graphQL offers a third operation type: subscriptions. With subscriptions, clients can subscribe to updates about changes in the server

Subscriptions are different from anything learnt so far. Until now, all interaction between browser and the server was due to the react application in the browser making HTTP requests to the server. GraphQL queries and mutations have also been done this way. With subscriptions, the situation is the opposite. After an application has made a subscription, it starts to listen to the server. When changes occur on the sever, it sends a notification to all of its subscribers.

Technically speaking, the HTTP protocol is not well-suited for communication from the server to the browser. So, under the hood, Apollo uses websocks for server subscriber communication.

# expressMiddleware

Starting from version 3.0, apollo server no longer provides direct support for subscriptions. We then need to make a number of changes to the backend code in order to get subscriptions working. So far, we have started the application with the easy to use function `startStandaloneServer`, thanks to which the application has not had to be configured much

Unfortunately, `startStandaloneServer` does not allow adding subscriptions to the application, so we have to switch the more robust `expressMiddleware` function. We will first install express and the apollo server integrations package:
```
npm install express cors @as-integrations/express5
```
and make the changes to the `server.js` file:
```javascript
const { ApolloServer } = require('@apollo/server')

const {
  ApolloServerPluginDrainHttpServer,
} = require('@apollo/server/plugin/drainHttpServer')
const { expressMiddleware } = require('@as-integrations/express5')
const cors = require('cors')
const express = require('express')
const { makeExecutableSchema } = require('@graphql-tools/schema')
const http = require('http')
const jwt = require('jsonwebtoken')

const resolvers = require('./resolvers')
const typeDefs = require('./schema')
const User = require('./models/user')

const getUserFromAuthHeader = async (auth) => {
  if (!auth || !auth.startsWith('Bearer ')) {
    return null
  }

  const decodedToken = jwt.verify(auth.substring(7), process.env.JWT_SECRET)
  return User.findById(decodedToken.id).populate('friends')
}


const startServer = async (port) => {
  const app = express()
  const httpServer = http.createServer(app)
 
  const server = new ApolloServer({
    schema: makeExecutableSchema({ typeDefs, resolvers }),
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  })
 
  await server.start()
 
  app.use(
    '/',
    cors(),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        const auth = req.headers.authorization
        const currentUser = await getUserFromAuthHeader(auth)
        return { currentUser }
      },
    }),
  )
 
  httpServer.listen(port, () =>
    console.log(`Server is now running on http://localhost:${port}`),
  )
}

module.exports = startServer
```
The graphQL server in the `server` variable is now connected to listen to the root of the server, i.e. to the `/` route, using the `expressMiddleware` object. Information about the loggined-in user is set in the context using the function we defined earlier. Since it is an express server, the middlewars express-json and cors are also needed so that the data included in the requests is correctly parsed and so that CORS problems do not appear.

The graphQL server must bbe started before the express application can bbegin listening on the specified part, so the `startServer` function has been made an async function in order to be able to wati for the graphQL server to start.
The following plugin:
```javascript
plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
```
ensures that the server is shut down cleanly when the server process is stopped. For example, it makes it possible to finish processing in-flight requests and close client connections so that they dont get left hanging.

# Subbscriptions on the server

We can implement subscriptions for notifications about new persons added. We need to change the schema:
```javascript
type Subscription {
  personAdded: Person!
}
```
When a new person is added, all of its details are sent to all subscribers. We also need to install packages for adding subscriptions to graphQL and a node.js websocket library:
```
npm install graphql-ws ws @graphql-tools/schema
```
We can now add this to `server.js`:
```javascript
const { WebSocketServer } = require('ws')
const { useServer } = require('graphql-ws/use/ws')

// ...

const startServer = async (port) => {
  const app = express()
  const httpServer = http.createServer(app)


  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/',
  })
 
  const schema = makeExecutableSchema({ typeDefs, resolvers })
  const serverCleanup = useServer({ schema }, wsServer)

  const server = new ApolloServer({

    schema, 
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          }
        },
      },
    ],
  })

  await server.start()

  // ...
}
```
When queries and mutations are used, graphQL uses the HTTP protocol in the communication. In the case of subscriptions, the communication between client and server happens with web sockets.

The configuration above creates, alongside the HTTP request listener, a service that listens for websocksets and binds it to the servers graphQL schema. The second part of the setup registers a function that closes the webbsocket connection when the server is shut down. 

Unlike with HTTP, when using websockets the server can also take the initiative in sending data. Therefore, websockets are well suited for graphQL subscriptions, where the server must be able to notify all clients that have made a particular subscription when the corresponding event (e.g. creating a person) occurs.

The subscription `personAdded` needs a resolver. The `addPerson` resolver also has top be modified so that it sends a notification to subscribers. 

We first need to install a library that provides publish-subscribe functionality:
```
npm install graphql-subscriptions
```
We can then make the changes to the `resolvers.js` file:
```javascript
const { GraphQLError } = require('graphql')

const { PubSub } = require('graphql-subscriptions')
const jwt = require('jsonwebtoken')

const Person = require('./models/person')
const User = require('./models/user')


const pubsub = new PubSub()

const resolvers = {
  // ...
  Mutation: {
    addPerson: async (root, args, context) => {
        const currentUser = context.currentUser

        if (!currentUser) {
          throw new GraphQLError('not authenticated', {
            extensions: {
              code: 'UNAUTHENTICATED',
            },
          })
        }

        const nameExists = await Person.exists({ name: args.name })

        if (nameExists) {
          throw new GraphQLError(`Name must be unique: ${args.name}`, {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args.name,
            },
          })
        }

      const person = new Person({ ...args })

      try {
        await person.save()
        currentUser.friends = currentUser.friends.concat(person)
        await currentUser.save()
      } catch (error) {
        throw new GraphQLError(`Saving person failed: ${error.message}`, {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.name,
            error,
          },
        })
      }



      pubsub.publish('PERSON_ADDED', { personAdded: person })

      return person
    },
    // ...
  },

  Subscription: {
    personAdded: {
      subscribe: () => pubsub.asyncIterableIterator('PERSON_ADDED')
    },
  },
}
```
With subscriptions, communication follows the publish-subscribe pattern using the `PubSub` object.

There are only a few lines of code added, but quite a lot is happening under the hood. The resolver of the `personAdded` subscription registers and saves info about all the clients that do the subscription. The clients are saved to an "iterator object" called `PERSON_ADDED`.

The iterator name is an arbitary string, but to follow the convention, it is the suibbscription name written in all capital letters.

Adding a new person publishes a notification about the operation to all subscribers with `PubSu`'s method `publish`:
```javascript
pubsub.publish('PERSON_ADDED', { personAdded: person })
```
Execution of this line sends a websocket message about the person added to all the clients registered in the iterator `PERSON_ADDED`. We can also test the subscription in apollo explorer with:
```javascript
subscription Subscription {
  personAdded {
    phone
    name
  }
}
```

# Subscriptions on the client

In order to use subscriptions in our react application, we have to do some changes, especially to its configuration. We first will add the `graphql-ws` library as a frontend dependency. It enables websocket connections for graphQL subscriptions:
```
npm install graphql-ws
```
We also need to make the changes to `main.jsx`:
```javascript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

import {
  ApolloClient,

  ApolloLink,
  HttpLink,
  InMemoryCache,
} from '@apollo/client'
import { ApolloProvider } from '@apollo/client/react'
import { SetContextLink } from '@apollo/client/link/context'

import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { getMainDefinition } from '@apollo/client/utilities'
import { createClient } from 'graphql-ws'

const authLink = new SetContextLink(({ headers }) => {
  const token = localStorage.getItem('phonebook-user-token')
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : null,
    },
  }
})

const httpLink = new HttpLink({ uri: 'http://localhost:4000' })


const wsLink = new GraphQLWsLink(
  createClient({
    url: 'ws://localhost:4000',
  }),
)


const splitLink = ApolloLink.split(
  ({ query }) => {
    const definition = getMainDefinition(query)
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    )
  },
  wsLink,
  authLink.concat(httpLink),
)

const client = new ApolloClient({
  cache: new InMemoryCache(),

  link: splitLink,
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </StrictMode>,
)
```
The new configuration is due to the fact that the application must have an HTTP connection as well as a websocket connection to the graphQL server.

We can then modify the application so that it subbscribes to the information about new people from the server. We will add the following code that defines the subscriptions to the `queries.js` file:
```javascript
export const PERSON_ADDED = gql`
  subscription {
    personAdded {
      ...PersonDetails
    }
  }

  ${PERSON_DETAILS}
`
```
Subscriptions are created using the `useSubscription` hook function. We can create a subscription in the `App` component:
```javascript
import {
  useApolloClient,
  useQuery,

  useSubscription,
} from '@apollo/client/react'
import { useState } from 'react'
import LoginForm from './components/LoginForm'
import Notify from './components/Notify'
import PersonForm from './components/PersonForm'
import Persons from './components/Persons'
import PhoneForm from './components/PhoneForm'

import { ALL_PERSONS, PERSON_ADDED } from './queries'

const App = () => {
  const [token, setToken] = useState(
    localStorage.getItem('phonebook-user-token'),
  )
  const [errorMessage, setErrorMessage] = useState(null)
  const result = useQuery(ALL_PERSONS)
  const client = useApolloClient()


  useSubscription(PERSON_ADDED, {
    onData: ({ data }) => {
      console.log(data)
    },
  })

  if (result.loading) {
    return <div>loading...</div>
  }

  // ...
}
```
When a new person is now added to the phonebook, no matter where its done, the details of the new person are printed to the clients console. When a new person is added to the list, the server sends the details to the client, and the callback function definedd as the value off the `useSubscription` hooks `onData` attribute is called, with the person added on the server passed to it as a parameter.

We can show the user a notification when a new person is added aswell
```javascript
const App = () => {
  // ...

  useSubscription(PERSON_ADDED, {
    onData: ({ data }) => {

      const addedPerson = data.data.personAdded
      notify(`${addedPerson.name} added`)
    }
  })

  // ...
}
```
Now when a person is added via apollo studio explorer it is rendered immediately in the application view. However there is a small problem, the added person ends up in the cache twice because both the `useSubscription` hook and the `personForm` component add the new person to the cache.

One possible solution is to update the cache only in the `useSubscription` hook. But this is not recommended, as good practice, the user should see the changes they make in the application immediately. The cache update performed by the subscription may happen with a delay and cant be relied on. Therefore, we will stick with a solution where the cache is updated both in the `useSubscription` hook and in the `PersonForm` component.

We can solve the problem by ensuring that a person is added to the cache only if they havent already been added there. At the same time, we'll extract the cache update into its own helper function in the `utils/apolloCache.js` file.
```javascript
import { ALL_PERSONS } from '../queries'

export const addPersonToCache = (cache, personToAdd) => {
  cache.updateQuery({ query: ALL_PERSONS }, ({ allPersons }) => {
    const personExists = allPersons.some(
      (person) => person.id === personToAdd.id,
    )

    if (personExists) {
      return { allPersons }
    }

    return {
      allPersons: allPersons.concat(personToAdd),
    }
  })
}
```
The helper function `addPersonToCache` updates the cache using the familiar `cache.updateQuery` method. In the cache update logic, we first check whether the person has already been added to the cache. We look for the person to be added among the people currently in the cache using javascript arrays `some` method.

`some` is a method that searches a collection for an element that matches the given condition. It returns a boolean indicating whether a matching element was found. In our case, the method returns `True` if the cache already contains a person with that `id`, and otherwise it returns `False`.

If the person is already in the cache, we return the cache contents as-is and do not add the person again. Otherwise, we return the cache contens with the new person appended.

We can modify the `useSubscription` hook in the `App` component so that it updates the cache using the `addPersonToCache` helper function we created:
```javascript
import { addPersonToCache } from './utils/apolloCache'

const App = () => {
  const [token, setToken] = useState(
    localStorage.getItem('phonebook-user-token'),
  )
  const [errorMessage, setErrorMessage] = useState(null)
  const result = useQuery(ALL_PERSONS)
  const client = useApolloClient()

  useSubscription(PERSON_ADDED, {
    onData: ({ data }) => {
      const addedPerson = data.data.personAdded
      notify(`${addedPerson.name} added`)

      addPersonToCache(client.cache, addedPerson)
    },
  })

  // ...
}
```
And we will also use the function when updating the cache in connection with adding a new person:
```javascript
import { addPersonToCache } from '../utils/apolloCache'

const PersonForm = ({ setError }) => {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [street, setStreet] = useState('')
  const [city, setCity] = useState('')

  const [createPerson] = useMutation(CREATE_PERSON, {
    onError: (error) => setError(error.message),
    update: (cache, response) => {

      const addedPerson = response.data.addPerson
      addPersonToCache(cache, addedPerson)
    },
  })

  // ...
}
```
Now the cache update works correctly in all situations, meaning that a new person is added to the cache only if they havent already been there.

# n+1 problem

We want to add some things to the backend. We will modify the schema so that a `Person` type has a `friendOf` field, which tells whose friends list the person is on.
```javascript
type Person {
  name: String!
  phone: String
  address: Address!

  friendOf: [User!]!
  id: ID!
}
```
the application should support the following query:
```javascript
query {
  findPerson(name: "Leevi Hellas") {
    friendOf {
      username
    }
  }
}
```
Because `friendOf` is not a field of `Persons` objects on the database, we have to create a resolver for it, which can solve this issue. We will create a resolver that returns an empty list:
```javascript
Person: {
  address: ({ street, city }) => {
    return {
      street,
      city,
    }
  },

  friendOf: async (root) => {
    return []
  }
},
```
Now the application works. We can immediately do even more complicated queries. It is possible to find the friend of all users:
```javascript
query {
  allPersons {
    name
    friendOf {
      username
    }
  }
}
```
However the application now has one problem: an unreasonably large number of database queries are being made. If we add console.log statements in our queries we can see that there are give people in the database, the previously mentioned `allPersons` query causes the following database queries:
```javascript
Person.find
User.find
User.find
User.find
User.find
User.find
```
So even though we primarily do one query for all persons, every person causes one more queyr in their resolver.

This is a manifestation of the famous n+1 problem, which appears every once in a while in different contexts, and sometimes sneak up on developers without them noticing.

The right solution for the n+1 problem depends on the situation. Often, it requires using some kind of a join query instead of multiple seperate queires.

In our situation, the easiest solution would be to save whose friends list they are on each `Person` object:
```javascript
const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 5
  },
  phone: {
    type: String,
    minlength: 5
  },
  street: {
    type: String,
    required: true,
    minlength: 5
  },  
  city: {
    type: String,
    required: true,
    minlength: 3
  },

  friendOf: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ], 
})
```
Then we could do a "join query", or populate the `friendOf` fields of persons when we fetch the `Person` objects:
```javascript
Query: {
  allPersons: (root, args) => {    
    console.log('Person.find')
    if (!args.phone) {

      return Person.find({}).populate('friendOf')
    }

    return Person.find({ phone: { $exists: args.phone === 'YES' } })

      .populate('friendOf')
  },
  // ...
}
```
After the change, we would not need a seperate resolver for the `friendOf` field. The `allPersons` query does not cause an n+1 problem, if we only fetch the name and the phone number.
