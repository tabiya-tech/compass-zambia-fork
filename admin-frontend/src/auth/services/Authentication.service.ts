import AuthenticationStateService from "./AuthenticationState.service";
import { AdminUser, Token, TokenHeader } from "src/auth/auth.types";
import { jwtDecode } from "jwt-decode";
import { PersistentStorageService } from "src/app/PersistentStorageService/PersistentStorageService";

export const CLOCK_TOLERANCE = 10; // 10 second buffer for expiration and issuance time

export enum TokenValidationFailureCause {
  TOKEN_EXPIRED = "TOKEN_EXPIRED",
  TOKEN_NOT_YET_VALID = "TOKEN_NOT_YET_VALID",
  TOKEN_NOT_A_JWT = "TOKEN_NOT_A_JWT",
  TOKEN_NOT_SIGNED = "TOKEN_NOT_SIGNED",
  TOKEN_DOES_NOT_HAVE_A_KEY_ID = "TOKEN_DOES_NOT_HAVE_A_KEY_ID",
  ERROR_DECODING_TOKEN = "ERROR_DECODING_TOKEN",
}

/**
 * Abstract class representing an authentication service.
 *
 * Provides a common interface for authentication services and manages application state.
 * All instances should be singletons.
 */
abstract class AuthenticationService {
  protected readonly authenticationStateService: AuthenticationStateService;

  protected constructor() {
    this.authenticationStateService = AuthenticationStateService.getInstance();
  }

  /**
   * Refreshes the authentication token.
   */
  abstract refreshToken(): Promise<void>;

  /**
   * Performs cleanup operations when the application unmounts.
   */
  abstract cleanup(): void;

  /**
   * Logs out the current user.
   */
  abstract logout(): Promise<void>;

  /**
   * Retrieves user information based on the provided token.
   */
  abstract getUser(token: string): AdminUser | null;

  /**
   * Checks if an active session exists with the authentication provider.
   */
  abstract isProviderSessionValid(): Promise<boolean>;

  /**
   * Updates the application state when a successful logout occurs
   */
  async onSuccessfulLogout(): Promise<void> {
    this.authenticationStateService.clearUser();
    this.authenticationStateService.clearToken();
    PersistentStorageService.clearLoginMethod();
  }

  /**
   * Updates the application state when a successful login occurs
   */
  async onSuccessfulLogin(token: string): Promise<void> {
    const user = this.getUser(token);
    if (!user) {
      throw Error("User not found in the token");
    }
    this.authenticationStateService.setUser(user);
    this.authenticationStateService.setToken(token);
  }

  /**
   * Updates the application state when a successful refresh occurs
   */
  async onSuccessfulRefresh(token: string): Promise<void> {
    const user = this.getUser(token);
    if (!user) {
      throw Error("User not found in the token");
    }
    this.authenticationStateService.setUser(user);
    this.authenticationStateService.setToken(token);
  }

  /**
   * Checks the header and payload of the token to ensure it is a valid JWT
   */
  public isTokenValid(token: string): { isValid: boolean; decodedToken: Token | null; failureCause?: string } {
    try {
      // Decode the header and validate it
      const decodedHeader: TokenHeader = jwtDecode(token, { header: true });
      if (decodedHeader.typ !== "JWT") {
        console.debug("Token is not a JWT");
        return { isValid: false, decodedToken: null, failureCause: TokenValidationFailureCause.TOKEN_NOT_A_JWT };
      }
      if (!decodedHeader.alg) {
        console.debug("Token is not signed");
        return { isValid: false, decodedToken: null, failureCause: TokenValidationFailureCause.TOKEN_NOT_SIGNED };
      }
      if (!decodedHeader.kid) {
        console.debug("Token does not have a key ID (kid)");
        return {
          isValid: false,
          decodedToken: null,
          failureCause: TokenValidationFailureCause.TOKEN_DOES_NOT_HAVE_A_KEY_ID,
        };
      }

      // Decode the token and validate it
      const decodedToken: Token = jwtDecode(token);
      const currentTime = Math.floor(Date.now() / 1000);

      // Check expiration with buffer
      if (currentTime > decodedToken.exp + CLOCK_TOLERANCE) {
        console.debug("Token is expired: ", { exp: decodedToken.exp, currentTime });
        return { isValid: false, decodedToken: null, failureCause: TokenValidationFailureCause.TOKEN_EXPIRED };
      } else if (currentTime > decodedToken.exp) {
        console.warn(
          "Warning: token expiration time has elapsed, but is still within the acceptable tolerance period",
          {
            exp: decodedToken.exp,
            currentTime,
          }
        );
      }

      // Check issued time with buffer
      if (currentTime < decodedToken.iat - CLOCK_TOLERANCE) {
        console.debug("Token issued in the future: ", { iat: decodedToken.iat, currentTime });
        return { isValid: false, decodedToken: null, failureCause: TokenValidationFailureCause.TOKEN_NOT_YET_VALID };
      } else if (currentTime < decodedToken.iat) {
        console.warn("Warning: token issued at time was after the current time, but within the acceptable tolerance", {
          iat: decodedToken.iat,
          currentTime,
        });
      }
      return { isValid: true, decodedToken: decodedToken };
    } catch (error) {
      return { isValid: false, decodedToken: null, failureCause: TokenValidationFailureCause.ERROR_DECODING_TOKEN };
    }
  }
}

export default AuthenticationService;
