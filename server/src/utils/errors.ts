import { StatusCodes } from "http-status-codes";
import { ApiError } from "./ApiError";

/**
 * Thrown when a requested resource cannot be found (HTTP 404).
 * Callers can distinguish this from other errors via `instanceof NotFoundError`
 * or by checking `error.name === "NotFoundError"`.
 */
export class NotFoundError extends ApiError {
  readonly name = "NotFoundError";

  constructor(message: string) {
    super(StatusCodes.NOT_FOUND, message);
  }
}

/**
 * Thrown when a state transition is attempted that is not permitted by the
 * domain state machine (HTTP 409).
 * e.g. closing an already-closed maintenance record.
 */
export class InvalidStateTransitionError extends ApiError {
  readonly name = "InvalidStateTransitionError";

  constructor(message: string) {
    super(StatusCodes.CONFLICT, message);
  }
}

/**
 * Thrown when a business rule is violated that is not purely a state-machine
 * concern (HTTP 422).
 * e.g. attempting to create maintenance for a vehicle that is ON_TRIP or RETIRED.
 */
export class BusinessRuleViolationError extends ApiError {
  readonly name = "BusinessRuleViolationError";

  constructor(message: string) {
    super(StatusCodes.UNPROCESSABLE_ENTITY, message);
  }
}
