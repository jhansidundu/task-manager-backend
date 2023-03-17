const mongoose = require('mongoose')

const taskSchema = mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  due_date: {
    type: Date
  },
  status: {
    type: String,
    enum: ['IN_PROGRESS', 'COMPLETED', 'NOT_STARTED'],
    default: 'NOT_STARTED'
  }
})

const Task = mongoose.model('Task', taskSchema)

module.exports = Task