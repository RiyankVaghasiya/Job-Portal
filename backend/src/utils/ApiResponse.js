import { ApiError } from "./ApiError.js";

class ApiResponse {
  constructor(statusCode, data, message = "success") {
    if (
      typeof statusCode !== "number" ||
      statusCode < 100 ||
      statusCode > 599
    ) {
      throw new ApiError("Invalid HTTP status code");
    }
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}

export { ApiResponse };
