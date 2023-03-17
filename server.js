const express = require("express")
const mongoose = require("mongoose")
const cors = require('cors')
const authRoutes = require('./routes/auth')
const taskRoutes = require('./routes/task')

// middleware
const bodyParser = require("body-parser")
const authenticateJwtToken = require('./middlewares/auth')

require('dotenv').config({ path: __dirname + '/config/.env' });
const app = express()

app.use(cors())
app.use(bodyParser.json())
app.use(authenticateJwtToken)
app.use("/api/auth", authRoutes)
app.use("/api/task", taskRoutes)

// connect to database
const connectToDatabase = () => {
  mongoose.connect(process.env.DB_URL)
    .then(() =>
      // start the server 
      app.listen(port, () => {
        console.log(`Application server started on port ${port}`);
      }))
    .catch((err) => console.log(err))
}

const port = process.env.PORT || 3000

connectToDatabase()

app.get("/", (req, res) => {
  // console.log(req.headers)
  res.status(200).json({ user: req.user })
})