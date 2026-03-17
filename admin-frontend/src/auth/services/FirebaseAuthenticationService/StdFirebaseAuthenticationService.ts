import firebase from "firebase/compat/app";
import { firebaseAuth, firebaseFirestore } from "src/auth/firebaseConfig";
import { AdminUser, Token } from "src/auth/auth.types";
import AuthenticationStateService from "src/auth/services/AuthenticationState.service";
import { FirebaseError, FirebaseErrorFactory } from "src/error/FirebaseError/firebaseError";
import { FirebaseErrorCodes } from "src/error/FirebaseError/firebaseError.constants";
import { AccessRole, buildAccessRole } from "src/auth/services/FirebaseAuthenticationService/types";

export interface FirebaseToken extends Token {
  name: string;
  aud: string;
  auth_time: number;
  user_id: string;
  sub: string;
  email: string;
  email_verified: boolean;
  firebase: {
    identities: {
      email: string[];
    };
    sign_in_provider: string;
    tenant?: string;
  };
}

export enum FirebaseTokenProvider {
  GOOGLE = "google.com",
  PASSWORD = "password",
}

export enum FirebaseTokenValidationFailureCause {
  INVALID_FIREBASE_TOKEN = "INVALID_FIREBASE_TOKEN",
  INVALID_FIREBASE_SIGN_IN_PROVIDER = "INVALID_FIREBASE_SIGN_IN_PROVIDER",
  INVALID_FIREBASE_USER_ID = "INVALID_FIREBASE_USER_ID",
}

/**
 * Standard Firebase Authentication Service that provides common functionality
 * for Firebase authentication operations like logout, token refresh, and session validation.
 */
class StdFirebaseAuthenticationService {
  private readonly FIREBASE_DB_NAME = "firebaseLocalStorageDb";
  private static instance: StdFirebaseAuthenticationService;

  private constructor() {}

  static getInstance(): StdFirebaseAuthenticationService {
    if (!this.instance) {
      this.instance = new this();
    }
    return this.instance;
  }

  /**
   * Logs out the user from Firebase authentication.
   */
  async logout(): Promise<void> {
    try {
      await firebaseAuth.signOut();
    } catch (error) {
      console.warn("An error occurred while logging out from firebase. Cleaning firebase DB explicitly.", error);
      await this.deleteFirebaseDB();
    }
  }

  /**
   * Deletes the Firebase IndexedDB.
   */
  private deleteFirebaseDB(): Promise<void> {
    return new Promise((resolve) => {
      console.debug("Attempting to delete Firebase IndexedDB");

      const DBDeleteRequest = window.indexedDB.deleteDatabase(this.FIREBASE_DB_NAME);
      const timeoutDuration = 1000;

      const timeoutId = setTimeout(() => {
        console.warn("Firebase IndexedDB deletion timed out or blocked");
        resolve();
      }, timeoutDuration);

      DBDeleteRequest.onerror = (event) => {
        console.warn("Error deleting Firebase IndexedDB", event);
        clearTimeout(timeoutId);
        resolve();
      };

      DBDeleteRequest.onsuccess = () => {
        clearTimeout(timeoutId);
        resolve();
      };

      DBDeleteRequest.onblocked = (event) => {
        console.warn("Firebase IndexedDB deletion blocked", event);
      };
    });
  }

  /**
   * Refreshes the user's token if a current user exists.
   */
  public async refreshToken(): Promise<string> {
    console.debug("Attempting to refresh token");
    const oldToken = AuthenticationStateService.getInstance().getToken();
    console.debug("Old token", "..." + oldToken?.slice(-20));

    return new Promise<string>((resolve, reject) => {
      const unsubscribeFunction = firebaseAuth.onAuthStateChanged(async (currentUser) => {
        if (currentUser) {
          try {
            const newToken = await currentUser.getIdToken(true);
            console.debug("New token obtained", "..." + newToken.slice(-20));
            AuthenticationStateService.getInstance().setToken(newToken);
            resolve(newToken);
          } catch (error) {
            console.error("Error refreshing token:", error);
            reject(error as Error);
          }
        } else {
          console.debug("No current user to refresh token");
          reject(new Error("No current user to refresh token"));
        }

        unsubscribeFunction();
      });
    });
  }

  /**
   * Cleans up the Firebase authentication service.
   */
  public cleanup(): void {
    console.debug("Cleaning up FirebaseAuthService");
  }

  public getUserFromDecodedToken(decodedToken: FirebaseToken): AdminUser {
    return {
      id: decodedToken.user_id,
      name: decodedToken.name || decodedToken.email,
      email: decodedToken.email,
    };
  }

  /**
   * Checks if a given decoded token is a valid firebase token.
   */
  public isFirebaseTokenValid(
    decodedToken: FirebaseToken,
    expectedTokenProvider: FirebaseTokenProvider
  ): { isValid: boolean; failureCause?: FirebaseTokenValidationFailureCause } {
    if (!decodedToken.firebase) {
      console.debug("Firebase Token Validation Failed: Token is not a valid firebase token");
      return { isValid: false, failureCause: FirebaseTokenValidationFailureCause.INVALID_FIREBASE_TOKEN };
    }
    if (decodedToken.firebase.sign_in_provider !== expectedTokenProvider) {
      console.debug(
        `Firebase Token Validation Failed: Token does not have the expected sign in provider: expected ${expectedTokenProvider}, got ${decodedToken.firebase.sign_in_provider}`
      );
      return { isValid: false, failureCause: FirebaseTokenValidationFailureCause.INVALID_FIREBASE_SIGN_IN_PROVIDER };
    }
    if (!decodedToken.user_id) {
      console.debug("Firebase Token Validation Failed: Token does not have a user ID");
      return { isValid: false, failureCause: FirebaseTokenValidationFailureCause.INVALID_FIREBASE_USER_ID };
    }
    return { isValid: true };
  }

  /**
   * Returns the current firebase user if logged in, or null if not logged in.
   */
  public getCurrentUser(): Promise<firebase.User | null> {
    return new Promise((resolve, reject) => {
      const unsubscribe = firebaseAuth.onAuthStateChanged(
        (user) => {
          if (user) {
            resolve(user);
          } else {
            resolve(null);
          }
          unsubscribe();
        },
        (firebaseError) => {
          const error = new FirebaseError(
            "StdFirebaseAuthenticationService",
            "getCurrentUser",
            "auth/auth-user-is-null",
            "Failed to get current user from Firebase Auth",
            firebaseError
          );
          reject(error);
          unsubscribe();
        }
      );
    });
  }

  /**
   * Checks if a firebase active session exists in IndexedDB.
   */
  public async isAuthSessionValid(): Promise<boolean> {
    try {
      const currentUser = await this.getCurrentUser();
      return currentUser != null;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  public async getUserRole(userId: string): Promise<AccessRole | null> {
    try {
      const accessRoleDoc = await firebaseFirestore.collection("access_role").doc(userId).get();

      if (!accessRoleDoc.exists) {
        return null;
      }

      const document = accessRoleDoc.data();
      if (!document?.enabled) {
        return null;
      }

      return buildAccessRole(document);
    } catch (error) {
      console.error("Error checking user access:", error);
      return null;
    }
  }

  /**
   * Retrieves the user's access profile from Firestore and verifies they are enabled.
   * @param userId - The user's ID to check access for.
   * @param errorFactory - Factory function to create FirebaseError instances.
   * @returns The user's access role.
   * @throws FirebaseError if the user's access is disabled or profile cannot be retrieved.
   */
  public async getProfile(userId: string, errorFactory: FirebaseErrorFactory): Promise<AccessRole> {
    try {
      const accessRoleDoc = await firebaseFirestore.collection("access_roles").doc(userId).get();

      console.debug("accessRoleDoc", accessRoleDoc);

      if (!accessRoleDoc.exists) {
        throw errorFactory(FirebaseErrorCodes.USER_ACCESS_DISABLED, "User access role not found", { userId });
      }

      const accessRoleData = accessRoleDoc.data();
      const accessRole = accessRoleData ? buildAccessRole(accessRoleData) : null;
      if (!accessRole) {
        throw errorFactory(FirebaseErrorCodes.USER_ACCESS_DISABLED, "Invalid access role configuration", { userId });
      }

      return accessRole;
    } catch (e) {
      console.debug("Error getting user profile", e);
      throw e;
    }
  }
}

export default StdFirebaseAuthenticationService;
