const handleError = (nodeEnv = "dev") => (err, req, res, next) => {
  if (err) {
    const response = {
      status: "fail",
      error: {
        code: err.code,
        name: err.name,
        message: err.message
      }
    };
    if (nodeEnv === "dev") response.error.stack = err.stack;
    const statusCode = err.code < 600 ? err.code : 400;
    return res.status(statusCode).json(response);
  }
  return next();
};

export default handleError;
