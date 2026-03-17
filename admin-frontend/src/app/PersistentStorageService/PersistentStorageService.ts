const PERSISTENT_STORAGE_VERSION = "0.0.1";
export const TOKEN_KEY = `admin_token_${PERSISTENT_STORAGE_VERSION}`;
export const LOGIN_METHOD_KEY = `admin_login_method_${PERSISTENT_STORAGE_VERSION}`;

/**
 * This class is used to store authentication data in localStorage.
 */
export class PersistentStorageService {
  static readonly storage = localStorage;

  /**
   * Returns the token from the storage
   * @returns string | null - The token
   */
  static getToken(): string | null {
    return this.storage.getItem(TOKEN_KEY);
  }

  /**
   * Clears the token from the storage
   */
  static clearToken(): void {
    this.storage.removeItem(TOKEN_KEY);
  }

  /**
   * Sets the token in the storage
   * @param token
   */
  static setToken(token: string): void {
    this.storage.setItem(TOKEN_KEY, token);
  }

  /**
   * Clears the user's login method from the storage
   */
  static clearLoginMethod(): void {
    this.storage.removeItem(LOGIN_METHOD_KEY);
  }

  /**
   * Clears all storage
   */
  static clear(): void {
    this.storage.clear();
  }
}
