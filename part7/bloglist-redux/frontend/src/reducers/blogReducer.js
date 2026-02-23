import { createSlice } from '@reduxjs/toolkit'
import blogService from '../services/blogs'

const blogSlice = createSlice({
  name: 'blogs',
  initialState: [],
  reducers: {
    addBlog(state, action) {
      state.push(action.payload)
    },
    updateBlog(state, action) {
      const updatedBlog = action.payload

      return state.map(blog =>
        blog.id === updatedBlog.id
          ? updatedBlog
          : blog
      )
    },
    removeBlog(state, action) {
      const id = action.payload
      return state.filter(blog => blog.id !== id)
    },
    setBlogs(state, action) {
      return action.payload
    }
  }
})

const { addBlog, updateBlog, removeBlog, setBlogs } = blogSlice.actions

export const likeBlog = (blog) => {
  return async (dispatch) => {
    const updatedBlog = await blogService.like(blog)

    dispatch(updateBlog(updatedBlog))
  }
}

export const createBlog = (blog) => {
  return async (dispatch) => {
    const blogToAdd = await blogService.create(blog)

    dispatch(addBlog(blogToAdd))
  }
}

export const deleteBlog = (id) => {
  return async (dispatch) => {
    await blogService.remove(id)
    dispatch(removeBlog(id))
  }
}

export const initializeBlogs = () => {
  return async (dispatch) => {
    const blogs = await blogService.getAll()

    dispatch(setBlogs(blogs))
  }
}

export default blogSlice.reducer
