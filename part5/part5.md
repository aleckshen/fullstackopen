# Saving tokens to local storage

Our applciation currently has a small flaw, if the browser is refreshed, the users login information disappears. The problem is easily solved by saving the login details to local storage. Local storage is a key-value database in the browser. It is very easy to use. A value corresponding to a certain key is saved to the database with the method `setItem`. For example:
```javascript
window.localStorage.setItem('name', 'aleck shen')
```
This saves the string given as the second parameter as the valye of the key name. The value of a key can be found with the method `getItem`:
```javascript
window.localStorage.getItem('name')
```
While `removeItem` removes a key from local storage.

Values in the local storage are persisted even when the page is re-rendered. The storage is origin-specific so each web application has its own storage. We can extend our application so that it saves the details of a logged-in user to the local storage. Values saved to the storage are DOMstrings, so we cannot save a js object as it is. The object has to be parsed to JSON first, with the method `JSON.stringify`. Correspondingly, when a JSON object is read from the local storage, it has to be parsed back to javascript with `JSON.parse`.

We will make the following changing to our login form:
```javascript
  const handleLogin = async (event) => {
    event.preventDefault()
    try {
      const user = await loginService.login({ username, password })


      window.localStorage.setItem(
        'loggedNoteappUser', JSON.stringify(user)
      ) 
      noteService.setToken(user.token)
      setUser(user)
      setUsername('')
      setPassword('')
    } catch (exception) {
      // ...
    }
  }
```
After doing this we still need ot modify our application so that when we enter the page, the application checks if user details of a logged-in user can already be found on the local storage. If they are there, the details are saved to the state of the application and to `noteService`. The right way to do this is with an effect hook: a mechanism we first encountered in part2, and used to fetch notes from the server. We can have mutliple effect hooks, so we can create a second one to handle the first loading of the page:
```javascript
  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedNoteappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      noteService.setToken(user.token)
    }
  }, [])
}
```
