import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { initializeBlogs } from '../reducers/blogReducer'

import LoginForm from '../components/LoginForm'
import BlogForm from '../components/BlogForm'

const Home = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(initializeBlogs())
  }, [dispatch])

  return (
    <div>
      <LoginForm />
      <BlogForm />
    </div>
  )
}

export default Home
