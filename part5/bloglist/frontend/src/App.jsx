import { useState, useEffect } from 'react'
import Blog from './components/Blog'
import blogService from './services/blogs'
import loginService from './services/login'
import Notification from './components/Notification'
import BlogForm from './components/BlogForm'
import Togglable from './components/Togglable'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    blogService.getAll().then(blogs =>
      setBlogs(sortBlogs(blogs))
    )
  }, [])

  useEffect(() => {
    const loggedUser = window.localStorage.getItem('loggedUser')
    if (loggedUser) {
      const user = JSON.parse(loggedUser)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  const sortBlogs = (blogs) => {
    return [...blogs].sort((a, b) => b.likes - a.likes)
  }

  const handleLogin = async event => {
    event.preventDefault()

    try {
      const user = await loginService.login({ username, password })
      window.localStorage.setItem(
        'loggedUser', JSON.stringify(user)
      )

      blogService.setToken(user.token)
      setUser(user)
      setUsername('')
      setPassword('')
    } catch (error) {
      setNotification('wrong username or password')
      setTimeout(() => {
        setNotification(null)
      }, 4000)
      console.log(error)
    }
  }

  const handleLogout = () => {
    window.localStorage.removeItem('loggedUser')
    window.location.reload()
  }

  const loginForm = () => (
    <div>
      <h2>log in to application</h2>
      <Notification message={notification} />
      <form onSubmit={handleLogin}>
        <div>
          <label>
            username
            <input
              type="text"
              value={username}
              onChange={({ target }) => setUsername(target.value)}
            />
          </label>
        </div>
        <div>
          <label>
            password
            <input
              type="password"
              value={password}
              onChange={({ target }) => setPassword(target.value)}
            />
          </label>
        </div>
        <button type="submit">login</button>
      </form>
    </div>
  )

  const createBlog = async blog => {
    try {
      const createdBlog = await blogService.create(blog)
      setBlogs(sortBlogs(blogs.concat(createdBlog)))

      setNotification('blog created successfully')
      setTimeout(() => setNotification(null), 4000)
    } catch {
      setNotification('invalid fields')
      setTimeout(() => setNotification(null), 4000)
    }
  }

  const likeBlog = async blog => {
    const updatedblog = {
      ...blog,
      likes: blog.likes + 1
    }

    const returnedBlog = await blogService.update(blog.id, updatedblog)

    setBlogs(sortBlogs(
      blogs.map(b =>
        b.id === returnedBlog.id ? returnedBlog : b
      )
    ))
  }

  const deleteBlog = async (blog) => {
    await blogService.remove(blog.id)

    setBlogs(blogs.filter(b => b.id !== blog.id))
  }

  return (
    <div>
      {!user && loginForm()}
      {user && (
        <div>
          <h2>blogs</h2>
          <Notification message={notification} />
          <p>{user.name} logged in</p>
          <button onClick={() => handleLogout()}>logout</button>
          <Togglable buttonLabel="create new blog">
            <BlogForm createBlog={createBlog} />
          </Togglable>
          {blogs.map(blog =>
            <Blog key={blog.id} blog={blog} user={user} onLike={likeBlog} onDelete={deleteBlog} />
          )}
        </div>
      )}
    </div>
  )
}

export default App
