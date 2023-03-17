const express = require('express')
const router = express.Router()

const { addOrUpdateTask, findAllTasks } = require('../controllers/task')

router.post('/get-tasks', (req, res) => {
  findAllTasks(req, res)
})
router.post('/', (req, res) => {
  addOrUpdateTask(req, res)
})
router.delete('/:taskId', (req, res) => { })

module.exports = router