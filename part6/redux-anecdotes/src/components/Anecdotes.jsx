import { useSelector, useDispatch } from 'react-redux'

const Anecdotes = () => {
  const dispatch = useDispatch()
  const anecdotes = useSelector(state => state)

  const incrementVote = (id) => {
    return {
      type: 'INCREMENT',
      payload: id
    }
  }

  const vote = id => {
    dispatch(incrementVote(id))
  }

  return (
    <div>
      <h2>Anecdotes</h2>
      {anecdotes.map(anecdote => (
        <div key={anecdote.id}>
          <div>{anecdote.content}</div>
          <div>
            has {anecdote.votes}
            <button onClick={() => vote(anecdote.id)}>vote</button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default Anecdotes
