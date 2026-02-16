import { useDispatch } from 'react-redux'
import { createAnecdote } from '../reducers/anecdoteReducer'
import { setNotification } from '../reducers/notificationReducer'

const AnecdoteForm = () => {
  const dispatch = useDispatch()

  const getId = () => (100000 * Math.random()).toFixed(0)

  const addAnecdote = event => {
    event.preventDefault()
    const content = event.target.anecdote.value
    event.target.anecdote.value = ''
    dispatch(createAnecdote({
      content,
      votes: 0,
      id: getId()
    }))

    dispatch(setNotification(`You created ${content}`))
    setTimeout(() => {
      dispatch(setNotification(''))
    }, 3000)
  }

  return (
    <div>
      <h2>create new</h2>
      <form onSubmit={addAnecdote} >
        <div>
          <input name="anecdote" />
        </div>
        <button>create</button>
      </form>
    </div>
  )
}

export default AnecdoteForm
