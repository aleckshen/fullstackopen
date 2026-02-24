import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { initializeUsers } from '../reducers/userReducer'
import { Link } from 'react-router-dom'

import Notification from '../components/Notification'

const Users = () => {
  const dispatch = useDispatch()
  const notification = useSelector(state => state.notification)
  const user = useSelector(state => state.users.currentUser)
  const users = useSelector(state => state.users.users)

  console.log(users)

  useEffect(() => {
    dispatch(initializeUsers())
  }, [dispatch])

  return (
    <div>
      <h2>blogs</h2>
      <Notification message={notification} />
      <p>{user?.name} logged in</p>
      <h2>Users</h2>
      <table>
        <thead>
          <tr>
            <th></th>
            <th>blogs created</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>
                <Link to={`/users/${u.id}`}>
                  {u.name}
                </Link>
              </td>
              <td>{u.blogs.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Users
