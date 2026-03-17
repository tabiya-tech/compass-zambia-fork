import { AdminUser } from "src/auth/auth.types";
import { PersistentStorageService } from "src/app/PersistentStorageService/PersistentStorageService";

/**
 * AuthenticationStateService manages the authentication state of the admin application.
 * It provides methods to get, set, and clear the current user, as well as to manage
 * the authentication token.
 *
 * This is a singleton service that acts as the centralized store for authentication state.
 */
export default class AuthenticationStateService {
  private static instance: AuthenticationStateService;
  private user: AdminUser | null = null;
  private token: string | null = null;

  private constructor() {}

  /**
   * Returns the singleton instance of AuthenticationStateService.
   * Creates a new instance if one doesn't exist.
   *
   * @returns {AuthenticationStateService} The singleton instance.
   */
  public static getInstance(): AuthenticationStateService {
    if (!AuthenticationStateService.instance) {
      AuthenticationStateService.instance = new AuthenticationStateService();
    }
    return AuthenticationStateService.instance;
  }

  /**
   * Retrieves the current user.
   *
   * @returns {AdminUser | null} The current user object or null if no user is authenticated.
   */
  public getUser(): AdminUser | null {
    return this.user;
  }

  /**
   * Sets the current user.
   *
   * @param {AdminUser | null} user - The user object to set.
   */
  public setUser(user: AdminUser | null): AdminUser | null {
    this.user = user;
    return this.user;
  }

  /**
   * Clears the current user and removes the authentication token from storage.
   */
  public clearUser(): void {
    console.debug("AuthenticationStateService: Clearing user");
    this.clearToken();
    this.setUser(null);
  }

  /**
   * Retrieves the current authentication token from state.
   *
   * @returns {string | null} The current authentication token or null if no token is present.
   */
  public getToken(): string | null {
    return this.token;
  }

  /**
   * Loads the token from persistent storage into state.
   *
   * @returns {void}
   */
  public loadToken(): void {
    this.token = PersistentStorageService.getToken();
    if (!this.token) {
      console.debug("AuthenticationStateService: No token found in persistent storage");
    }
  }

  /**
   * Sets the authentication token in both state and persistent storage.
   *
   * @param {string} token - The token to set.
   */
  public setToken(token: string): void {
    if (!token) {
      console.warn("AuthenticationStateService: Attempted to set an empty token");
    }

    this.token = token;
    PersistentStorageService.setToken(token);
  }

  /**
   * Clears the token from both state and persistent storage.
   */
  public clearToken(): void {
    console.debug("AuthenticationStateService: Clearing token");
    this.token = null;
    PersistentStorageService.clearToken();
  }
}
