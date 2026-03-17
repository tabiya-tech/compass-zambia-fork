import { PersistentStorageService, TOKEN_KEY, LOGIN_METHOD_KEY } from "./PersistentStorageService";

describe("PersistentStorageService", () => {
  beforeEach(() => {
    // GIVEN a clean storage state before each test
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe("TOKEN_KEY and LOGIN_METHOD_KEY constants", () => {
    test("should have versioned TOKEN_KEY", () => {
      // GIVEN the TOKEN_KEY constant

      // THEN expect it to contain the version suffix
      expect(TOKEN_KEY).toBe("admin_token_0.0.1");
    });

    test("should have versioned LOGIN_METHOD_KEY", () => {
      // GIVEN the LOGIN_METHOD_KEY constant

      // THEN expect it to contain the version suffix
      expect(LOGIN_METHOD_KEY).toBe("admin_login_method_0.0.1");
    });
  });

  describe("storage property", () => {
    test("should use localStorage as storage", () => {
      // GIVEN the PersistentStorageService class

      // THEN expect the storage to be localStorage
      expect(PersistentStorageService.storage).toBe(localStorage);
    });
  });

  describe("Token methods", () => {
    describe("getToken", () => {
      test("should return null when no token is set", () => {
        // GIVEN no token is set in storage

        // WHEN getToken is called
        const actualToken = PersistentStorageService.getToken();

        // THEN expect null to be returned
        expect(actualToken).toBeNull();
      });

      test("should return the token when it is set", () => {
        // GIVEN a token is set in storage
        const givenToken = "test-auth-token-123";
        localStorage.setItem(TOKEN_KEY, givenToken);

        // WHEN getToken is called
        const actualToken = PersistentStorageService.getToken();

        // THEN expect the token to be returned
        expect(actualToken).toBe(givenToken);
      });
    });

    describe("setToken", () => {
      test("should set the token in storage", () => {
        // GIVEN a token to store
        const givenToken = "test-auth-token-456";

        // WHEN setToken is called
        PersistentStorageService.setToken(givenToken);

        // THEN expect the token to be stored in localStorage
        const actualStoredToken = localStorage.getItem(TOKEN_KEY);
        expect(actualStoredToken).toBe(givenToken);
      });

      test("should overwrite an existing token", () => {
        // GIVEN an existing token in storage
        const givenOldToken = "old-token";
        localStorage.setItem(TOKEN_KEY, givenOldToken);
        // guard
        expect(localStorage.getItem(TOKEN_KEY)).toBe(givenOldToken);

        // AND a new token to store
        const givenNewToken = "new-token";

        // WHEN setToken is called with the new token
        PersistentStorageService.setToken(givenNewToken);

        // THEN expect the new token to be stored
        const actualStoredToken = localStorage.getItem(TOKEN_KEY);
        expect(actualStoredToken).toBe(givenNewToken);
      });
    });

    describe("clearToken", () => {
      test("should remove the token from storage", () => {
        // GIVEN a token is set in storage
        const givenToken = "token-to-clear";
        localStorage.setItem(TOKEN_KEY, givenToken);
        // guard
        expect(localStorage.getItem(TOKEN_KEY)).toBe(givenToken);

        // WHEN clearToken is called
        PersistentStorageService.clearToken();

        // THEN expect the token to be removed from storage
        const actualStoredToken = localStorage.getItem(TOKEN_KEY);
        expect(actualStoredToken).toBeNull();
      });

      test("should not throw when no token exists", () => {
        // GIVEN no token is set in storage
        // guard
        expect(localStorage.getItem(TOKEN_KEY)).toBeNull();

        // WHEN clearToken is called
        // THEN expect no error to be thrown
        expect(() => PersistentStorageService.clearToken()).not.toThrow();
      });
    });
  });

  describe("Login Method methods", () => {
    describe("clearLoginMethod", () => {
      test("should remove the login method from storage", () => {
        // GIVEN a login method is set in storage
        const givenLoginMethod = "facebook";
        localStorage.setItem(LOGIN_METHOD_KEY, givenLoginMethod);
        // guard
        expect(localStorage.getItem(LOGIN_METHOD_KEY)).toBe(givenLoginMethod);

        // WHEN clearLoginMethod is called
        PersistentStorageService.clearLoginMethod();

        // THEN expect the login method to be removed from storage
        const actualStoredLoginMethod = localStorage.getItem(LOGIN_METHOD_KEY);
        expect(actualStoredLoginMethod).toBeNull();
      });

      test("should not throw when no login method exists", () => {
        // GIVEN no login method is set in storage
        // guard
        expect(localStorage.getItem(LOGIN_METHOD_KEY)).toBeNull();

        // WHEN clearLoginMethod is called
        // THEN expect no error to be thrown
        expect(() => PersistentStorageService.clearLoginMethod()).not.toThrow();
      });
    });
  });

  describe("clear", () => {
    test("should clear all items from storage", () => {
      // GIVEN multiple items are set in storage
      const givenToken = "test-token";
      const givenLoginMethod = "email";
      const givenOtherKey = "other-key";
      const givenOtherValue = "other-value";

      localStorage.setItem(TOKEN_KEY, givenToken);
      localStorage.setItem(LOGIN_METHOD_KEY, givenLoginMethod);
      localStorage.setItem(givenOtherKey, givenOtherValue);

      // guard
      expect(localStorage.length).toBe(3);

      // WHEN clear is called
      PersistentStorageService.clear();

      // THEN expect all items to be removed from storage
      expect(localStorage.length).toBe(0);
      expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
      expect(localStorage.getItem(LOGIN_METHOD_KEY)).toBeNull();
      expect(localStorage.getItem(givenOtherKey)).toBeNull();
    });

    test("should not throw when storage is already empty", () => {
      // GIVEN storage is empty
      // guard
      expect(localStorage.length).toBe(0);

      // WHEN clear is called
      // THEN expect no error to be thrown
      expect(() => PersistentStorageService.clear()).not.toThrow();
    });
  });

  describe("Integration: Token and Login Method operations", () => {
    test("should clear token independently without affecting other storage items", () => {
      // GIVEN token and another item are set in storage
      const givenToken = "token-to-clear";
      const givenLoginMethod = "email";
      localStorage.setItem(TOKEN_KEY, givenToken);
      localStorage.setItem(LOGIN_METHOD_KEY, givenLoginMethod);
      // guard
      expect(localStorage.getItem(TOKEN_KEY)).toBe(givenToken);
      expect(localStorage.getItem(LOGIN_METHOD_KEY)).toBe(givenLoginMethod);

      // WHEN clearToken is called
      PersistentStorageService.clearToken();

      // THEN expect token to be cleared but login method to remain
      expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
      expect(localStorage.getItem(LOGIN_METHOD_KEY)).toBe(givenLoginMethod);
    });

    test("should clear login method independently without affecting token", () => {
      // GIVEN both token and login method are set in storage
      const givenToken = "persistent-token";
      const givenLoginMethod = "google";
      localStorage.setItem(TOKEN_KEY, givenToken);
      localStorage.setItem(LOGIN_METHOD_KEY, givenLoginMethod);
      // guard
      expect(localStorage.getItem(TOKEN_KEY)).toBe(givenToken);
      expect(localStorage.getItem(LOGIN_METHOD_KEY)).toBe(givenLoginMethod);

      // WHEN clearLoginMethod is called
      PersistentStorageService.clearLoginMethod();

      // THEN expect login method to be cleared but token to remain
      expect(localStorage.getItem(TOKEN_KEY)).toBe(givenToken);
      expect(localStorage.getItem(LOGIN_METHOD_KEY)).toBeNull();
    });
  });
});
