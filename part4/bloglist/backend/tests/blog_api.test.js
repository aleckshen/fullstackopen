const assert = require('node:assert')
const { test, after, beforeEach } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const Blog = require('../models/blog')

const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.initialBlogs)
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

  await api
    .post('/api/blogs')
    .send(blog)
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

  await api
    .post('/api/blogs')
    .send(blog)
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

  await api
    .post('/api/blogs')
    .send(blog)
    .expect(400)
})

test('deleting a single blog resource', async () => {
  const blogsAtStart = await helper.blogsInDb()
  const blogToDelete = blogsAtStart[0]

  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .expect(204)
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

after(async () => {
  await mongoose.connection.close()
})
