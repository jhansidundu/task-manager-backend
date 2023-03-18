const Joi = require('joi')
const Task = require('../models/task')
const Response = require('../util/response')

const addOrUpdateTaskSchema = Joi.object({
  _id: Joi.string(),
  __v: Joi.number(),
  user_id: Joi.string(),
  title: Joi.string().required(),
  description: Joi.string().required(),
  due_date: Joi.date().allow(null, ''),
  status: Joi.string().valid('IN_PROGRESS', 'COMPLETED', 'NOT_STARTED').allow(null, '')
})

// const getTasksSchema = Joi.object({
//   date: Joi.date(),
//   thisWeek: Joi.boolean(),
//   thisMonth: Joi.boolean()
// })

const addOrUpdateTask = async (req, res) => {
  const { error, value } = addOrUpdateTaskSchema.validate(req.body)
  // const user = await User.findById(req.user.id)
  const response = new Response()
  if (error) {
    response.message = error.details
    return res.status(400).json(response)
  }
  const user = req.user
  if (!user) {
    response.message = 'Unauthorized'
    return res.status(403).json(response)
  }
  let task = value._id ? await Task.findOne({ _id: value._id }) : new Task()
  task.title = value.title
  task.description = value.description
  task.due_date = value.due_date
  if (!!value.status) task.status = value.status
  task.user_id = user.id

  try {
    task = await task.save()
    response.success = true
    if (value._id) response.message = "Task Updated"
    else response.message = "Task Created"
    response.data = { task }
    res.status(200).json(response)
  } catch (err) {
    response.message = err
    res.status(500).json(response)
  }

}

const findAllTasks = async (req, res) => {
  const user = req.user
  const value = req.body
  let tasks
  const response = new Response()
  try {
    if (value.date) {
      const today = new Date(value.date)
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      tasks = await Task.find({ user_id: user.id, due_date: { $gte: today, $lt: tomorrow } })
      response.success = true
      response.data = { tasks }
      res.json(response)
    } else if (value.thisWeek) {
      // get current date
      const current = new Date()

      // get the day of the week (0-6) 0 is sunday and 6 is saturday 
      const currentDayOfWeek = current.getDay()

      // get the date of the month
      const currentDayOfMonth = current.getDate()

      const startDate = new Date()
      startDate.setDate(currentDayOfMonth - currentDayOfWeek + 1)
      startDate.setHours(0, 0, 0, 0)

      const endDate = new Date(startDate)
      endDate.setDate(currentDayOfMonth + 6 - currentDayOfWeek)
      endDate.setHours(23, 59, 59, 999)

      tasks = await Task.find({
        user_id: user.id, due_date: {
          $gte: startDate, $lt: endDate
        }
      })
      response.success = true
      response.data = { tasks }
      return res.json(response)

    } else if (value.thisMonth) {
      const currentDate = new Date();
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 2, 0, 0, 0, 0)
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1, 23, 59, 59, 999)
      tasks = await Task.find({
        user_id: user.id,
        due_date: {
          $gte: startDate,
          $lte: endDate
        }
      })
      response.success = true
      response.data = { tasks }
      return res.send(response)
    } else {
      tasks = await Task.find({ user_id: user.id })
      response.success = true
      response.data = { tasks }
      res.json(response)
    }
  } catch (err) {
    response.message = err
    res.status(500).json(response)
  }
}

module.exports = {
  addOrUpdateTask,
  findAllTasks
}