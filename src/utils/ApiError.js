class ApiError extends Error {
  constructor(statusCode, message = 'Something went wrong', errors = [], stat = "") {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    this.data = null;
    this.errors = errors;
    this.message = message;

    if(stat){
      this.stat = stat
    }else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default ApiError