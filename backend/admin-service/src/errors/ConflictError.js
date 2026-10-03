import { AppError } from "./AppError.js";

export class ConflictError extends AppError {
  constructor(message = "Conflict") {
    super(message, 409);
  }
}
