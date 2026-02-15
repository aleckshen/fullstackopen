const anecdoteReducer = (state = [], action) => {
  switch (action.type) {
    case 'INCREMENT':
      return state.map(anecdote =>
        anecdote.id === action.payload
          ? { ...anecdote, votes: anecdote.votes + 1 }
          : anecdote
      )
        .sort((a, b) => b.votes - a.votes)

    case 'NEW_ANECDOTE':
      return [...state, action.payload]
        .sort((a, b) => b.votes - a.votes)
    default:
      return state
  }
}

const getId = () => (100000 * Math.random()).toFixed(0)

export const createAnecdote = (content) => {
  return {
    type: "NEW_ANECDOTE",
    payload: {
      content,
      id: getId(),
      votes: 0
    }
  }
}

export default anecdoteReducer
