import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { setCurrentUser } from '../reducers/userReducer'

const NavBar = () => {
  const dispatch = useDispatch()
  const user = useSelector(state => state.users.currentUser)

  if (!user) {
    return null
  }

  const handleLogout = () => {
    window.localStorage.removeItem('loggedUser')
    dispatch(setCurrentUser(null))
  }

  return (
    <div style={{ display: "flex", gap: "4px", backgroundColor: "#9ca3af" }}>
      <Link to="/">blogs</Link>
      <Link to="/users">users</Link>
      {user.name}
      <button onClick={handleLogout}>logout</button>
    </div>
  )
}

export default NavBar
