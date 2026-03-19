const { GraphQLError } = require('graphql')
const { PubSub } = require('graphql-subscriptions')
const jwt = require('jsonwebtoken')
const Book = require('./models/book')
const Author = require('./models/author')
const User = require('./models/user')

const pubsub = new PubSub()

const resolvers = {
  Query: {
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: async () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      const { author, genre } = args

      const query = {}

      if (author) {
        const authorObj = await Author.findOne({ name: author })
        if (!authorObj) {
          return []
        }
        query.author = authorObj._id
      }

      if (genre) {
        query.genres = genre
      }

      return Book.find(query).populate('author')
    },
    allAuthors: async () => {
      // Solve n+1: fetch all books once and compute counts in memory
      const authors = await Author.find({})
      const books = await Book.find({}, 'author')

      const bookCountMap = {}
      books.forEach(book => {
        const id = book.author.toString()
        bookCountMap[id] = (bookCountMap[id] || 0) + 1
      })

      return authors.map(author => ({
        ...author.toObject({ virtuals: true }),
        bookCount: bookCountMap[author._id.toString()] || 0,
      }))
    },
    me: (root, args, context) => {
      return context.currentUser
    },
  },

  Author: {
    bookCount: (root) => {
      // Use precomputed value from allAuthors; fall back to 0
      return root.bookCount ?? 0
    }
  },

  Mutation: {
    addBook: async (root, args, context) => {
      const currentUser = context.currentUser

      if (!currentUser) {
        throw new GraphQLError('not authenticated', {
          extensions: {
            code: 'UNAUTHENTICATED'
          }
        })
      }

      try {
        let author = await Author.findOne({ name: args.author })

        if (!author) {
          author = new Author({ name: args.author })
          await author.save()
        }

        const book = new Book({ ...args, author: author._id })

        await book.save()
        const populatedBook = await book.populate('author')

        pubsub.publish('BOOK_ADDED', { bookAdded: populatedBook })

        return populatedBook
      } catch (error) {
        throw new GraphQLError(error.message, {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args,
            error
          }
        })
      }
    },

    editAuthor: async (root, args, context) => {
      const currentUser = context.currentUser

      if (!currentUser) {
        throw new GraphQLError('not authenticated', {
          extensions: {
            code: 'UNAUTHENTICATED'
          }
        })
      }

      try {
        const author = await Author.findOne({ name: args.name })

        if (!author) {
          return null
        }

        author.born = args.setBornTo
        await author.save()

        return author
      } catch (error) {
        throw new GraphQLError(error.message, {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args,
            error
          }
        })
      }
    },
    createUser: async (root, args) => {
      const user = new User({
        username: args.username,
        favoriteGenre: args.favoriteGenre
      })

      return user.save()
        .catch(error => {
          throw new GraphQLError(`Creating the user failed ${error.message}`, {
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

      if (!user || args.password !== 'secret') {
        throw new GraphQLError('wrong credentials', {
          extensions: {
            code: 'BAD_USER_INPUT',
          }
        })
      }

      const userForToken = {
        username: user.username,
        id: user._id
      }

      return { value: jwt.sign(userForToken, process.env.JWT_SECRET) }
    },
  },

  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterableIterator('BOOK_ADDED')
    },
  },
}

module.exports = resolvers
