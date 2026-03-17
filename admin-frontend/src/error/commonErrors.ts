enum CommonError {
  ENV_ERROR = "EnvError",
  CONFIGURATION_ERROR = "ConfigurationError",
  TOKEN_ERROR = "TokenError",
}

export class EnvError extends Error {
  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = CommonError.ENV_ERROR;
    this.cause = cause;
  }
}

export class ConfigurationError extends Error {
  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = CommonError.CONFIGURATION_ERROR;
    this.cause = cause;
  }
}

export class TokenError extends Error {
  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = CommonError.TOKEN_ERROR;
    this.cause = cause;
  }
}
