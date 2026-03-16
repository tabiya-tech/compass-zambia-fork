enum CommonError {
  ENV_ERROR = "EnvError",
  CONFIGURATION_ERROR = "ConfigurationError",
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
