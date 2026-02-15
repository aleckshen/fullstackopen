import { useSelector, useDispatch } from 'react-redux'

const Anecdotes = () => {
  const dispatch = useDispatch()
  const anecdotes = useSelector(({ anecdotes, filter }) => {
    return anecdotes.filter(a => a.content.includes(filter))
  })

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
