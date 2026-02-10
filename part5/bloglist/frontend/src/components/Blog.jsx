import { useState } from 'react'
import blogService from '../services/blogs'

const Blog = ({ blog, user, onLike, onDelete }) => {
  const [visible, setVisible] = useState(true)

  const hide = { display: visible ? 'none' : '' }
  const show = { display: visible ? '' : 'none' }

  const toggleVisibility = () => {
    setVisible(!visible)
  }

  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5
  }

  return (
    <div style={blogStyle} className='blog'>
      <div style={show}>
        {blog.title}
        <button onClick={() => toggleVisibility()}>view</button>
      </div>
      <div style={hide}>
        {blog.title}
        <button onClick={() => toggleVisibility()}>hide</button>
        <div>{blog.url}</div>
        <div>
          likes {blog.likes}
          <button onClick={() => onLike(blog)}>like</button>
        </div>
        <div>{blog.author}</div>
        {blog.user && user.username === blog.user.username && (
          <button onClick={() => onDelete(blog)} >remove</button>
        )}
      </div>
    </div>
  )
}

export default Blog
