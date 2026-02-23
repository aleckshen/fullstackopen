import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setNotification } from '../reducers/notificationReducer'
import { createBlog as createBlogAction, likeBlog as likeBlogAction, deleteBlog as deleteBlogAction } from '../reducers/blogReducer'
import { setUser } from '../reducers/userReducer'

import Togglable from './Togglable'
import Notification from './Notification'
import Blog from './Blog'

const BlogForm = () => {
  const dispatch = useDispatch()

  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [url, setUrl] = useState('')
  const blogs = useSelector(state => state.blogs)
  const notification = useSelector(state => state.notification)
  const user = useSelector(state => state.user)

  const createBlog = async blog => {
    try {
      await dispatch(createBlogAction(blog))
      dispatch(setNotification('blog created successfully'))
      setTimeout(() => dispatch(setNotification(null)), 4000)
    } catch {
      dispatch(setNotification('invalid fields'))
      setTimeout(() => dispatch(setNotification(null)), 4000)
    }
  }

  const likeBlog = blog => {
    dispatch(likeBlogAction(blog))
  }

  const deleteBlog = (blog) => {
    dispatch(deleteBlogAction(blog.id))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    createBlog({
      title,
      author,
      url
    })

    setTitle('')
    setAuthor('')
    setUrl('')
  }

  const handleLogout = () => {
    window.localStorage.removeItem('loggedUser')
    dispatch(setUser(null))
  }

  if (!user) {
    return null
  }

  return (
    <div>
      <h2>blogs</h2>
      <Notification message={notification} />
      <p>{user?.name} logged in</p>
      <button onClick={handleLogout}>logout</button>
      <Togglable buttonLabel="create new blog">
        <div>
          <h2>create new</h2>
          <form onSubmit={handleSubmit}>
            <div>
              <label>
                title:
                <input
                  type="text"
                  value={title}
                  onChange={({ target }) => setTitle(target.value)}
                />
              </label>
            </div>
            <div>
              <label>
                author:
                <input
                  type="text"
                  value={author}
                  onChange={({ target }) => setAuthor(target.value)}
                />
              </label>
            </div>
            <div>
              <label>
                url:
                <input
                  type="text"
                  value={url}
                  onChange={({ target }) => setUrl(target.value)}
                />
              </label>
            </div>
            <button type="submit">create</button>
          </form>
        </div>
      </Togglable>
      {[...(blogs || [])]
        .sort((a, b) => b.likes - a.likes)
        .map(blog => (
          <Blog
            key={blog.id}
            blog={blog}
            user={user}
            onLike={likeBlog}
            onDelete={deleteBlog}
          />
        ))}
    </div>
  )
}

export default BlogForm
