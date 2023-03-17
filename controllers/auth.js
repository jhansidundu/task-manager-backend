const Joi = require('joi')
const User = require('../models/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Response = require('../util/response')

const registerSchema = Joi.object({
  username: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().max(255).required(),
  password: Joi.string().min(8).max(255).required()
})

const loginSchema = Joi.object({
  email: Joi.string().email().max(255).required(),
  password: Joi.string().min(8).max(255).required()
})

const register = async (req, res) => {
  const { error, value } = registerSchema.validate(req.body)
  const response = new Response()
  if (error) {
    response.message = error.details
    return res.status(400).json(response)
  }

  const existingUser = await User.findOne({ email: value.email })
  if (existingUser) {
    response.message = "Email is already registered"
    return res.status(409).json(response)
  }

  // hash the password
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(value.password, salt)

  // create a new user document
  let user = new User({
    username: value.username,
    email: value.email,
    password: hashedPassword
  });

  user = await user.save()

  // generate a jwt token
  const token = generateToken(user)
  response.success = true
  response.message = 'User created successfully'
  response.data = { token, username: user.username }
  return res.status(201).json(response)

}

const login = async (req, res) => {
  // validate the request 
  const { error, value } = loginSchema.validate(req.body)
  const response = new Response()
  if (error) {
    response.message = error.details
    return res.status(400).json(response)
  }

  // find the user
  const user = await User.findOne({ email: value.email })
  if (!user) {
    response.message = "Invalid username or password"
    return res.status(401).json(response)
  }

  // check if the password is valid
  const validPassword = await bcrypt.compare(value.password, user.password)
  if (!validPassword) {
    response.message = "Invalid username or password"
    return res.status(401).json(response)
  }

  // Generate a token
  const token = generateToken(user)
  response.success = true
  response.message = "Logged in successfully"
  response.data = { token, username: user.username }

  return res.json(response)
}

const generateToken = (user) => {
  const payload = {
    id: user._id,
    username: user.username,
    email: user.email
  }
  const options = { expiresIn: '1h' }
  return jwt.sign(payload, process.env.JWT_SECRET_KEY, options)
}

module.exports = { register, login }