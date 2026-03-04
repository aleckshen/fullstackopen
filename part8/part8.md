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
