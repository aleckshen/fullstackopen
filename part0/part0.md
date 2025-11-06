# HTTP GET

The server and the web browser communicate with each other using the HTTP protocol. The network
tab in chrome developer tools shows how the browser and server communicate.

When you reload the page you can see two events that happened in this [web application](https://studies.cs.helsinki.fi/exampleapp/)
- The browser has fetched the contents of the page **studies.cs.helsinki.fi/exampleapp** from the server
- And also the browser has downloaded the image **kuva.png**

Clicking on the event itself, we can look at more information about what happened during the refresh. After clicking onto the headers section we can see the HTTP protocols used to fetch information, the request URL's, status codes, and several other
headers.

In this refresh all the events that occur are are:
1. Browser sends HTTP GET request to the server to fetch HTML code
2. Server sends back HTML document
3. The img tag in the HTML prompts the browser to fetch the image
4. The server sends back the png picture

Note that the HTML page begins to render before the image has been fetched from the server.

# Document Object Model

We can think of HTML pages as implicit tree structures, this tree like structure can be seen in the elements tab of the chrome
developer tools and is know as the DOM. the DOM, is an Application Programming Interface (API) that enables programmatic modification of the element trees corresponding to web pages.

## Manipulating the DOM

The topmost node of the DOM tree of an HTML document is called the document object. We can perform various operations on a webpage using the DOM-API. You can access the `document` object by typing `document` into the Console tab.

We can manipulate the DOM using the console. For example we can add a new note onto the page:
```javascript
list = document.getElementsByTagName('ul')[0]
newElement = document.createElement('li')
newElement.textContent = 'Page manipulation from console is easy'
list.appendChild(newElement)
```

We can see that the changes now appear on browser, however the document object model changes don't directly affect your source code. Upon refresh the new note will disappear, this is because the changes were not pushed to the server. 

# Single page app

In the example used, the home page works like a traditional web app. All the logic is handled on the server side and the client side/web browser only handles the HTML rendering as instructed.

In recent years, the Single-page application (SPA) style of creating web applications has emerged. SPA-style websites don't fetch all of their pages separately from the server like our sample application does, but instead comprise only one HTML page fetched from the server, the contents of which are manipulated with JavaScript that executes in the browser.