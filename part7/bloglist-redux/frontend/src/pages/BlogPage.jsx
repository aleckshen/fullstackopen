import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { initializeBlogs } from '../reducers/blogReducer'
import { likeBlog as likeBlogAction } from '../reducers/blogReducer'

const BlogPage = () => {
  const { id } = useParams()
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(initializeBlogs())
  }, [dispatch])

  const blog = useSelector(state =>
    state.blogs.find(b => b.id === id)
  )

  console.log(blog)
  if (!blog) {
    return <div>loading...</div>
  }

  const likeBlog = () => {
    dispatch(likeBlogAction(blog))
  }

  return (
    <div>
      <h2>{blog.title}</h2>
      <div>{blog.url}</div>
      <div>
        {blog.likes} likes
        <button onClick={likeBlog}>like</button>
      </div>
      <div>added by {blog.author}</div>
    </div>
  )
}

export default BlogPage
