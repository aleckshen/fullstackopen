const assert = require('node:assert')
const { test, after, beforeEach } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const Blog = require('../models/blog')
const User = require('../models/user')

const api = supertest(app)

beforeEach(async () => {
  await User.deleteMany({})
  await Blog.deleteMany({})
  await Blog.insertMany(helper.initialBlogs)

  await api.post('/api/users').send({
    name: 'test',
    username: 'test',
    password: 'test'
  })

})

test('correct amount of blogs in database', async () => {
  const blogs = await api.get('/api/blogs')
  assert.strictEqual(blogs.body.length, helper.initialBlogs.length)
})

test('unique identifier property is named id', async () => {
  const blogs = await api.get('/api/blogs')
  const blog = blogs.body[0]

  assert(blog['id'])
})

test('creates a new blog post', async () => {
  const blog = {
    title: 'test post',
    author: 'john',
    url: 'link',
    likes: 5,
  }

  const login = await api.post('/api/login')
    .send({
      username: 'test',
      password: 'test'
    })

  const token = login.body.token

  await api
    .post('/api/blogs')
    .send(blog)
    .set('Authorization', `Bearer ${token}`)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()
  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)
})

test('verify that like property missing defaults to value 0', async () => {
  const blog = {
    title: 'test post',
    author: 'john',
    url: 'link'
  }

  const login = await api.post('/api/login')
    .send({
      username: 'test',
      password: 'test'
    })

  const token = login.body.token

  await api
    .post('/api/blogs')
    .send(blog)
    .set('Authorization', `Bearer ${token}`)
    .expect(201)

  const response = await api.get('/api/blogs')
  const addedBlog = response.body.find(b => b.title === 'test post')

  assert.strictEqual(addedBlog.likes, 0)
})

test('if title or url props are missing then backend responds 400', async () => {
  const blog = {
    title: 'test post',
    author: 'john',
    likes: 5,
  }

  const login = await api.post('/api/login')
    .send({
      username: 'test',
      password: 'test'
    })

  const token = login.body.token

  await api
    .post('/api/blogs')
    .send(blog)
    .set('Authorization', `Bearer ${token}`)
    .expect(400)
})

test('deleting a single blog resource', async () => {
  const login = await api.post('/api/login')
    .send({
      username: 'test',
      password: 'test'
    })

  const token = login.body.token

  const newBlog = {
    title: 'Blog to delete',
    author: 'test',
    url: 'http://example.com',
    likes: 0
  }

  const createdBlog = await api
    .post('/api/blogs')
    .send(newBlog)
    .set('Authorization', `Bearer ${token}`)
    .expect(201)

  const blogsAtStart = await helper.blogsInDb()

  await api
    .delete(`/api/blogs/${createdBlog.body.id}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(204)

  const blogsAtEnd = await helper.blogsInDb()
  assert.strictEqual(blogsAtEnd.length, blogsAtStart.length - 1)

  const titles = blogsAtEnd.map(b => b.title)
  assert(!titles.includes('Blog to delete'))
})

test('updating a blog resource', async () => {
  const blogsAtStart = await helper.blogsInDb()
  const blogToUpdate = blogsAtStart[0]

  const updatedBlog = { ...blogToUpdate, likes: blogToUpdate.likes + 1 }

  await api
    .put(`/api/blogs/${updatedBlog.id}`)
    .send(updatedBlog)
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('invalid token', async () => {
  const login = await api.post('/api/login')
    .send({
      username: 'invalid',
      password: 'invalid'
    })
    .expect(401)
})

after(async () => {
  await mongoose.connection.close()
})
