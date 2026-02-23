import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import BlogForm from './BlogForm'

test('creation of a new blog from blogform', async () => {
  const createBlog = vi.fn()

  render(
    <BlogForm createBlog={createBlog} />
  )

  const user = userEvent.setup()
  const titleInput = screen.getByLabelText(/title/i)
  const authorInput = screen.getByLabelText(/author/i)
  const urlInput = screen.getByLabelText(/url/i)
  const createButton = screen.getByText('create')

  await user.type(titleInput, 'test title')
  await user.type(authorInput, 'test author')
  await user.type(urlInput, 'testing.com')
  await user.click(createButton)

  expect(createBlog).toHaveBeenCalledTimes(1)
  expect(createBlog).toHaveBeenCalledWith({
    title: 'test title',
    author: 'test author',
    url: 'testing.com'
  })
})
