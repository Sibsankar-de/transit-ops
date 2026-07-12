import { StatusCodes } from "http-status-codes";
import { ApiError } from "./ApiError";

export class NotFoundError extends ApiError {
  readonly name = "NotFoundError";

  constructor(message: string) {
    super(StatusCodes.NOT_FOUND, message);
  }
}

export class InvalidStateTransitionError extends ApiError {
  readonly name = "InvalidStateTransitionError";

  constructor(message: string) {
    super(StatusCodes.CONFLICT, message);
  }
}

export class BusinessRuleViolationError extends ApiError {
  readonly name = "BusinessRuleViolationError";

  constructor(message: string) {
    super(StatusCodes.UNPROCESSABLE_ENTITY, message);
  }
}

export class InvalidInputError extends ApiError {
  readonly name = "InvalidInputError";

  constructor(message: string) {
    super(StatusCodes.BAD_REQUEST, message);
  }
}
