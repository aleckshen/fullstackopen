const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
  {
    title: "Alecks blog",
    author: "Aleck",
    url: "https://www.aleckshen.com/",
    likes: 4
  },
  {
    title: "Ashlees blog",
    author: "Ashlee",
    url: "https://www.ashleeshum.com/",
    likes: 8
  }
]

const initialUsers = [
  {
    username: "aleckshen",
    name: "aleck",
    password: "shen"
  },
  {
    username: "ashleeshum",
    name: "ashlee",
    password: "shum"
  }
]

const nonExistingId = async () => {
  const blog = new Blog({
    title: "temp",
    author: "random",
    url: "https;//google.com",
    likes: 0
  })

  await blog.save()
  await blog.deleteOne()

  return blog._id.toString()
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

module.exports = {
  initialBlogs,
  nonExistingId,
  blogsInDb,
  initialUsers
}
