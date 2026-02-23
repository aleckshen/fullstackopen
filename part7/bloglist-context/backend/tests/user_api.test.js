const assert = require('node:assert')
const { test, after, beforeEach } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('../tests/test_helper')
const User = require('../models/user')

const api = supertest(app)

beforeEach(async () => {
  await User.deleteMany({})
  await User.insertMany(helper.initialUsers)
})

test('invalid username', async () => {
  const user = {
    username: 'ab',
    name: 'abcde',
    passwordHash: 'abcde'
  }

  await api
    .post('/api/users')
    .send(user)
    .expect(400)
})

test('invalid password', async () => {
  const user = {
    username: 'abcde',
    name: 'abcde',
    passwordHash: 'ab'
  }

  await api
    .post('/api/users')
    .send(user)
    .expect(400)
})

after(async () => {
  await mongoose.connection.close()
})
