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
