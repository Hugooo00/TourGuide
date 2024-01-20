// 这是一个ES6 class
class AppError extends Error {
  // Remember the constructor() method is calle deach time that we create a new object out of this class
  constructor(message, statusCode) {
    //  when we extend a parent class, we call super in order to call the parent constructor
    super(message); // By doing this parent call we already set the message property to our incoming message.因为message就是Error的内置property
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
