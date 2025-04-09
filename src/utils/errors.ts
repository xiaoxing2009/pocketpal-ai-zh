/**
 * Error classes for better error handling throughout the application
 */

/**
 * NetworkError - Used for connectivity-related errors
 * Examples: No internet connection, timeout, etc.
 */
export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

/**
 * AppCheckError - Used for Firebase App Check verification errors
 * Examples: App not installed from official store, verification failed, etc.
 */
export class AppCheckError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AppCheckError';
  }
}

/**
 * ServerError - Used for backend server errors
 * Examples: 500 errors, API unavailable, etc.
 */
export class ServerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ServerError';
  }
}
