import { useEffect, useContext } from 'react'

import blogService from './services/blogs'

import BlogForm from './components/BlogForm'
import LoginForm from './components/LoginForm'
import UserContext from './contexts/UserContext'

const App = () => {
  const { userDispatch } = useContext(UserContext)

  useEffect(() => {
    const loggedUser = window.localStorage.getItem('loggedUser')
    if (loggedUser) {
      const user = JSON.parse(loggedUser)
      userDispatch({
        type: 'SET',
        payload: user
      })
      blogService.setToken(user.token)
    }
  }, [userDispatch])

  return (
    <div>
      <LoginForm />
      <BlogForm />
    </div>
  )
}

export default App
