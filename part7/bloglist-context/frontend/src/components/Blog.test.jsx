import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import Blog from './Blog'

test('renders title and author, but not url or likes by default', () => {
  const blog = {
    title: 'Testing React components',
    author: 'Test Author',
    url: 'https://example.com',
    likes: 5
  }

  render(
    <Blog
      blog={blog}
      onLike={vi.fn()}
      onDelete={vi.fn()}
    />
  )

  const titles = screen.getAllByText('Testing React components')
  expect(titles).toHaveLength(2)

  const url = screen.getByText('https://example.com')
  const likes = screen.getByText('likes 5')

  expect(url).not.toBeVisible()
  expect(likes).not.toBeVisible()
})

test('url and likes are shown when view button is clicked', async () => {
  const blog = {
    title: 'Testing React components',
    author: 'Test Author',
    url: 'https://example.com',
    likes: 5
  }

  render(
    <Blog
      blog={blog}
      onLike={vi.fn()}
      onDelete={vi.fn()}
    />
  )

  const user = userEvent.setup()
  const button = screen.getByText('view')
  await user.click(button)


  const url = screen.getByText('https://example.com')
  const likes = screen.getByText('likes 5')

  expect(url).toBeVisible()
  expect(likes).toBeVisible()
})

test('like button is clicked twice', async () => {
  const blog = {
    title: 'Testing React components',
    author: 'Test Author',
    url: 'https://example.com',
    likes: 5
  }

  const mockHandler = vi.fn()

  render(
    <Blog
      blog={blog}
      onLike={mockHandler}
      onDelete={vi.fn()}
    />
  )

  const user = userEvent.setup()
  const button = screen.getByText('like')
  await user.click(button)
  await user.click(button)

  expect(mockHandler.mock.calls).toHaveLength(2)
})
