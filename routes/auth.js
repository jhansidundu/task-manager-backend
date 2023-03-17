const express = require("express");
const { register, login } = require("../controllers/auth");

const router = express.Router();

router.post("/register", (req, res) => {
  return register(req, res);
})

router.post("/login", (req, res) => {
  return login(req, res)
})

module.exports = router

