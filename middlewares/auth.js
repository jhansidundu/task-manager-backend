const jwt = require('jsonwebtoken')
const Response = require('../util/response')

const authenticateJwtToken = (req, res, next) => {
  if (req.path === '/api/auth/register' || req.path === '/api/auth/login')
    return next()

  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  const response = new Response()

  if (!token) {
    response.message = 'Token not provided'
    return res.status(401).json(response)
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
    if (err) {
      response.message = "Unauthorized"
      return res.status(403).json(response)
    }
    req.user = user
    next()
  })
}

module.exports = authenticateJwtToken