import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { initializeBlogs } from './reducers/blogReducer'
import { setUser } from './reducers/userReducer'

import blogService from './services/blogs'

import BlogForm from './components/BlogForm'
import LoginForm from './components/LoginForm'

const App = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(initializeBlogs())
  }, [dispatch])

  useEffect(() => {
    const loggedUser = window.localStorage.getItem('loggedUser')
    if (loggedUser) {
      const user = JSON.parse(loggedUser)
      dispatch(setUser(user))
      blogService.setToken(user.token)
    }
  }, [])

  return (
    <div>
      <LoginForm />
      <BlogForm />
    </div>
  )
}

export default App
