import { useState } from 'react'
import { Link } from 'react-router-dom'

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


  if (!user) {
    return null
  }


  return (
    <div style={blogStyle} className='blog'>
      <div style={show}>
        <Link to={`/${blog.id}`}>
          {blog.title}
        </Link>
      </div>
    </div>
  )
}

export default Blog
