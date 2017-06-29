export class BaseError {
  constructor(message) {
    this.message = message;
    const error = new Error();
    this.stack = error.stack;
  }
}
