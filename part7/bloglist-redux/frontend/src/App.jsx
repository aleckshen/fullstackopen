import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { Routes, Route } from 'react-router-dom'
import { setCurrentUser } from './reducers/userReducer'

import blogService from './services/blogs'

import Home from './pages/Home'
import Users from './pages/Users'
import User from './pages/User'
import BlogPage from './pages/BlogPage'
import NavBar from './components/NavBar'

const App = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    const loggedUser = window.localStorage.getItem('loggedUser')
    if (loggedUser) {
      const user = JSON.parse(loggedUser)
      dispatch(setCurrentUser(user))
      blogService.setToken(user.token)
    }
  }, [dispatch])

  return (
    <div>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/users" element={<Users />} />
        <Route path="/users/:id" element={<User />} />
        <Route path="/:id" element={<BlogPage />} />
      </Routes>
    </div>
  )
}

export default App
