import { NotificationContextProvider } from './NotificationContext'
import { UserContextProvider } from './UserContext'

const ContextWrapper = (props) => {
  return (
    <div>
      <NotificationContextProvider>
        <UserContextProvider>
          {props.children}
        </UserContextProvider>
      </NotificationContextProvider>
    </div>
  )
}

export default ContextWrapper
