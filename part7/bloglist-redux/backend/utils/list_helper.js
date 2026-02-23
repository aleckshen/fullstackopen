const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favouriteBlog = (blogs) => {
  return blogs.reduce((max, blog) => blog.likes > max.likes ? blog : max, blogs[0])
}

module.exports = {
  totalLikes,
  favouriteBlog
}
