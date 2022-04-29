class AuthError extends Error {
  constructor(message, code = 401) {
    super(message);
    if (Error.captureStackTrace) Error.captureStackTrace(this, this.constructor);
    this.code = code;
    this.name = "AuthError";
  }
}

export default AuthError;
