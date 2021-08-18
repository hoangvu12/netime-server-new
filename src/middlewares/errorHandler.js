const RequestError = require("../errors/RequestError");

const errorHandler = (err, _req, res, _next) => {
  console.error(err);

  if (err instanceof RequestError) {
    return res.json({
      success: false,
      error: err.message,
      message: err.userMessage,
    });
  }

  return res.json({
    success: false,
    error: err.message,
    message: `Lỗi server [${err.message}]`,
  });
};

module.exports = errorHandler;
