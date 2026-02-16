import { createSlice } from '@reduxjs/toolkit'

const anecdoteSlice = createSlice({
  name: 'anecdotes',
  initialState: [],
  reducers: {
    incrementVote(state, action) {
      const anecdote = state.find(a => a.id === action.payload)
      anecdote.votes += 1
      state.sort((a, b) => b.votes - a.votes)
    },
    createAnecdote(state, action) {
      state.push(action.payload)
    }
  }
})

export const { incrementVote, createAnecdote } = anecdoteSlice.actions
export default anecdoteSlice.reducer
