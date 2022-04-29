class ValueError extends Error {
  constructor(message, code = 400) {
    super(message);
    if (Error.captureStackTrace) Error.captureStackTrace(this, this.constructor);
    this.code = code;
    this.name = "ValueError";
  }
}

export default ValueError;
