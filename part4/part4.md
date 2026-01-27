# Testing node applications

For testing we can create a file `for_testing.js` under `./utils` for some simple unit tests. There are a large number of test libraries or test runner available for javascript. Previously one of the best testing libraries was Mocha, which was replaced a few years ago by Jest. A newcomer and a more modern day testing library is called Vitest.

Nowadays, node also has a built-in test library `node-test`, which is well suited to the needs of the course. We can define the npm script `test` for the test execution:
```javascript
{
  // ...
  "scripts": {
    "start": "node index.js",
    "dev": "node --watch index.js",
    "test": "node --test",
    "lint": "eslint ."
  },
  // ...
}
```
We can create a seperate directorty for our tests called tests and create a new file called `reverse.test.js` to test for reversing a string.
