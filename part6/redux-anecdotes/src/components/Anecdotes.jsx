import { useSelector, useDispatch } from 'react-redux'
import { showNotification } from '../reducers/notificationReducer'
import { addVote } from '../reducers/anecdoteReducer'

const Anecdotes = () => {
  const dispatch = useDispatch()
  const anecdotes = useSelector(({ anecdotes, filter }) => {
    return anecdotes.filter(a => a.content.includes(filter))
  })

  const vote = (anecdote) => {
    dispatch(addVote(anecdote))

    dispatch(showNotification(`You liked ${anecdote.content}`, 3))
  }

  return (
    <div>
      {anecdotes.map(anecdote => (
        <div key={anecdote.id}>
          <div>{anecdote.content}</div>
          <div>
            has {anecdote.votes}
            <button onClick={() => vote(anecdote)}>vote</button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default Anecdotes
