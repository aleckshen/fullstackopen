# Rendering collections

We can render list elements dynamically using array functions such as `array.map()`. For example we can have the following code block:
```javascript
const App = (props) => {
  const { notes } = props

  return (
    <div>
      <h1>Notes</h1>
      <ul>
        {notes.map(note => 
          <li key={note.id}>
            {note.content}
          </li>
        )}
      </ul>
    </div>
  )
}
```
This takes a a notes array as a property. The line `const { notes } = props` extracts the notes field using object destructuring and we can dynamically map every note within `<li>` brackets as shown in the code above. Each list item should include a key prop `key={note.id}`, which helps React identify and efficiently update individual items.

Note that another way to use the map function without directly including a key prop is by retrieving the index through a second parameter passed into the function such as:
```javascript
<ul>
  {notes.map((note, i) => 
    <li key={i}>
      {note.content}
    </li>
  )}
</ul>
```
However this is not entirely desirable.

# Map function

Map is a important javascript functions that takes a array and maps each variable to a desired output. Lets examine the following code:
```javascript
const result = notes.map(note => note.id)
console.log(result)
```
Essentially what this does is it takes a note object as a parameter and it returns the notes id as the result. This block of code is very simplified, the code within the map function is the same as:
```javascript
(note) => {
  return note.id
}
```

