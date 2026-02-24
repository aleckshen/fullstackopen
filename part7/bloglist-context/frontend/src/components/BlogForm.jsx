import { useState, useContext } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import blogService from '../services/blogs'

import Togglable from './Togglable'
import Blog from './Blog'
import Notification from './Notification'
import NotificationContext from '../contexts/NotificationContext'
import UserContext from '../contexts/UserContext'

const BlogForm = () => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [url, setUrl] = useState('')

  const { notification, setNotification } = useContext(NotificationContext)
  const { user, userDispatch } = useContext(UserContext)
  const queryClient = useQueryClient()

  const sortBlogs = (blogs) => {
    return [...blogs].sort((a, b) => b.likes - a.likes)
  }

  const result = useQuery({
    queryKey: ['blogs'],
    queryFn: blogService.getAll
  })

  const newBlogMutation = useMutation({
    mutationFn: blogService.create,
    onSuccess: (newBlog) => {
      const blogs = queryClient.getQueryData(['blogs']) || []
      queryClient.setQueryData(['blogs'], [...blogs, newBlog])
      setNotification('blog created successfully')
    },
    onError: () => {
      setNotification('invalid fields')
    }
  })

  const updateBlogMutation = useMutation({
    mutationFn: ({ id, updatedBlog }) =>
      blogService.update(id, updatedBlog),
    onSuccess: (returnedBlog) => {
      const blogs = queryClient.getQueryData(['blogs']) || []
      queryClient.setQueryData(
        ['blogs'],
        blogs.map(b =>
          b.id === returnedBlog.id ? returnedBlog : b
        )
      )
    }
  })

  const deleteBlogMutation = useMutation({
    mutationFn: blogService.remove,
    onSuccess: (_, deletedId) => {
      const blogs = queryClient.getQueryData(['blogs']) || []
      queryClient.setQueryData(
        ['blogs'],
        blogs.filter(b => b.id !== deletedId)
      )
    }
  })

  if (result.isLoading) {
    return <div>loading data...</div>
  }

  const blogs = sortBlogs(result.data || [])

  const likeBlog = (blog) => {
    updateBlogMutation.mutate({
      id: blog.id,
      updatedBlog: { ...blog, likes: blog.likes + 1 }
    })
  }

  const deleteBlog = (blog) => {
    deleteBlogMutation.mutate(blog.id)
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    newBlogMutation.mutate({
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
    userDispatch({ type: 'CLEAR' })
  }

  if (!user) {
    return null
  }

  return (
    <div>
      <h2>blogs</h2>
      <Notification message={notification} />
      <p>{user.name} logged in</p>
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
      {blogs.map(blog =>
        <Blog key={blog.id} blog={blog} user={user} onLike={likeBlog} onDelete={deleteBlog} />
      )}
    </div >
  )
}

export default BlogForm
