import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { initializeUsers } from '../reducers/userReducer'
import { Link } from 'react-router-dom'

const User = () => {
  const { id } = useParams()
  const dispatch = useDispatch()
  const users = useSelector(state => state.users.users)

  useEffect(() => {
    if (!users.length) {
      dispatch(initializeUsers())
    }
  }, [dispatch, users.length])


  if (!users.length) {
    return <div>loading...</div>
  }

  const user = users.find(u => u.id === id)

  if (!user) {
    return <div>User not found</div>
  }

  return (
    <div>
      <h2>{user.name}</h2>
      <h3>Added blogs</h3>
      <ul>
        {user.blogs.map(blog => (
          <li key={blog.id}>
            <Link to={`/${blog.id}`}>
              {blog.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default User
