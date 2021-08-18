class RequestError extends Error {
  constructor(code, devMessage, userMessage = "Lỗi server, vui lòng thử lại!") {
    super(devMessage);

    this.code = code;
    this.userMessage = userMessage;
  }
}

module.exports = RequestError;
