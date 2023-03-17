class Response {
  constructor(success = false, message = null, data = null) {
    this.success = success,
      this.message = message,
      this.data = data
  }
}

module.exports = Response