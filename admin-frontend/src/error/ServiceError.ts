export class ServiceError extends Error {
  serviceName: string;
  serviceFunction: string;

  constructor(serviceName: string, serviceFunction: string, message: string, cause?: unknown) {
    super(message);
    this.serviceName = serviceName;
    this.serviceFunction = serviceFunction;

    if (typeof cause === "string") {
      try {
        this.cause = JSON.parse(cause);
      } catch (e) {
        this.cause = cause;
      }
    } else {
      this.cause = cause;
    }
  }
}
