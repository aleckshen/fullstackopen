import { ALL_BOOKS } from '../queries'
import { useQuery } from '@apollo/client/react'
import { useState } from 'react'

const Books = (props) => {
  const [selectedGenre, setSelectedGenre] = useState(null)

  const { loading, data, refetch } = useQuery(ALL_BOOKS, {
    variables: { genre: selectedGenre },
  })

  const { data: allData } = useQuery(ALL_BOOKS)

  if (!props.show) return null
  if (loading) return <div>loading...</div>

  const books = data.allBooks
  const genres = allData
    ? [...new Set(allData.allBooks.flatMap((b) => b.genres))]
    : []

  const selectGenre = (genre) => {
    setSelectedGenre(genre)
    refetch({ genre })
  }

  return (
    <div>
      <h2>books</h2>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map((a) => (
            <tr key={a.id}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div>
        {genres.map((g) => (
          <button key={g} onClick={() => selectGenre(g)}>{g}</button>
        ))}
        <button onClick={() => selectGenre(null)}>all genres</button>
      </div>
    </div>
  )
}

export default Books
