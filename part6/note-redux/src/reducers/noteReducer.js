import { createSlice, current } from '@reduxjs/toolkit'

const noteSlice = createSlice({
  name: 'notes',
  initialState: [],
  reducers: {
    createNote(state, action) {
      state.push(action.payload)
    },
    toggleImportanceOf(state, action) {
      const id = action.payload
      const noteToChange = state.find(n => n.id === id)
      const changedNote = {
        ...noteToChange,
        important: !noteToChange.important
      }
      console.log(current(state))
      return state.map(note =>
        note.id !== id ? note : changedNote
      )
    },
    setNotes(state, action) {
      return action.payload
    }
  },
})


export const { createNote, toggleImportanceOf, setNotes } = noteSlice.actions
export default noteSlice.reducer
