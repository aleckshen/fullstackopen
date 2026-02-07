import { useState } from 'react'

const Blog = ({ blog, onLike, onDelete }) => {
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

  const handleDelete = () => {
    if (window.confirm(`Remove blog ${blog.title} by ${blog.author}?`)) {
      onDelete(blog)
    }
  }

  return (
    <div style={blogStyle}>
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
        <button onClick={handleDelete}>remove</button>
      </div>
    </div>
  )
}

export default Blog
