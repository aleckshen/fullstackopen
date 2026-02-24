import { useState, useContext } from 'react'

import Notification from './Notification'
import UserContext from '../contexts/UserContext.jsx'
import NotificationContext from '../contexts/NotificationContext.jsx'

import loginService from '../services/login'
import blogService from '../services/blogs'

const LoginForm = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const { user, userDispatch } = useContext(UserContext)
  const { notification, setNotification } = useContext(NotificationContext)

  const handleLogin = async event => {
    event.preventDefault()

    try {
      const user = await loginService.login({ username, password })
      window.localStorage.setItem(
        'loggedUser', JSON.stringify(user)
      )

      blogService.setToken(user.token)
      userDispatch({
        type: 'SET',
        payload: user
      })
      setUsername('')
      setPassword('')
    } catch (error) {
      setNotification('wrong username or password')
      console.log(error)
    }
  }

  if (user) {
    return null
  }

  return (
    <div>
      <h2>log in to application</h2>
      <Notification message={notification} />
      <form onSubmit={handleLogin}>
        <div>
          <label>
            username
            <input
              type="text"
              value={username}
              onChange={({ target }) => setUsername(target.value)}
            />
          </label>
        </div>
        <div>
          <label>
            password
            <input
              type="password"
              value={password}
              onChange={({ target }) => setPassword(target.value)}
            />
          </label>
        </div>
        <button type="submit">login</button>
      </form>
    </div>
  )
}

export default LoginForm
