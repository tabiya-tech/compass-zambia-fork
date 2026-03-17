import { buildAccessRole, Role, AccessRole } from "./types";

describe("buildAccessRole", () => {
  describe("should return null for invalid inputs", () => {
    test.each([
      ["null", null],
      ["undefined", undefined],
      ["string", "not an object"],
      ["number", 123],
      ["boolean", true],
      ["array", []],
      ["empty object", {}],
      ["object with no role", { institutionId: "inst-123" }],
      ["object with null role", { role: null }],
      ["object with undefined role", { role: undefined }],
      ["object with empty string role", { role: "" }],
    ])("%s", (_description: string, givenInput: any) => {
      // GIVEN an invalid input (provided via test.each)

      // WHEN buildAccessRole is called
      const actualResult = buildAccessRole(givenInput);

      // THEN expect null to be returned
      expect(actualResult).toBeNull();
    });
  });

  describe("should return null and log error for institution staff without institution ID", () => {
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    });

    afterEach(() => {
      consoleErrorSpy.mockRestore();
    });

    test.each([
      ["role only", { role: Role.INSTITUTION_STAFF }],
      ["role with null institutionId", { role: Role.INSTITUTION_STAFF, institutionId: null }],
      ["role with undefined institutionId", { role: Role.INSTITUTION_STAFF, institutionId: undefined }],
      ["role with empty string institutionId", { role: Role.INSTITUTION_STAFF, institutionId: "" }],
    ])("%s", (_description: string, givenInput: any) => {
      // GIVEN an institution staff role without valid institution ID (provided via test.each)

      // WHEN buildAccessRole is called
      const actualResult = buildAccessRole(givenInput);

      // THEN expect null to be returned
      expect(actualResult).toBeNull();
      // AND expect an error to be logged
      expect(consoleErrorSpy).toHaveBeenCalledWith("Institution staff role requires an institution ID");
    });
  });

  describe("should return admin role only and log warning when admin has institution ID", () => {
    let consoleWarnSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();
    });

    afterEach(() => {
      consoleWarnSpy.mockRestore();
    });

    test.each([
      ["with institutionId", { role: Role.ADMIN, institutionId: "inst-123" }],
      ["with different institutionId", { role: Role.ADMIN, institutionId: "inst-456" }],
    ])("%s", (_description: string, givenInput: any) => {
      // GIVEN an admin role with institution ID (provided via test.each)

      // WHEN buildAccessRole is called
      const actualResult = buildAccessRole(givenInput);

      // THEN expect admin role without institutionId to be returned
      const expectedResult: AccessRole = { role: Role.ADMIN };
      expect(actualResult).toEqual(expectedResult);
      // AND expect the institutionId to not be present
      expect(actualResult).not.toHaveProperty("institutionId");
      // AND expect a warning to be logged
      expect(consoleWarnSpy).toHaveBeenCalledWith("Admin role does not require institution ID, ignoring it");
    });
  });

  describe("should return valid admin role", () => {
    test.each([
      ["role only", { role: Role.ADMIN }],
      ["role with null institutionId", { role: Role.ADMIN, institutionId: null }],
      ["role with undefined institutionId", { role: Role.ADMIN, institutionId: undefined }],
      ["role with empty string institutionId", { role: Role.ADMIN, institutionId: "" }],
    ])("%s", (_description: string, givenInput: any) => {
      // GIVEN a valid admin role (provided via test.each)

      // WHEN buildAccessRole is called
      const actualResult = buildAccessRole(givenInput);

      // THEN expect admin role to be returned
      const expectedResult: AccessRole = { role: Role.ADMIN };
      expect(actualResult).toEqual(expectedResult);
      // AND expect the institutionId to not be present
      expect(actualResult).not.toHaveProperty("institutionId");
    });
  });

  describe("should return valid institution staff role", () => {
    test.each([
      ["with institutionId", { role: Role.INSTITUTION_STAFF, institutionId: "inst-123" }],
      ["with different institutionId", { role: Role.INSTITUTION_STAFF, institutionId: "inst-456" }],
      [
        "with UUID institutionId",
        { role: Role.INSTITUTION_STAFF, institutionId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890" },
      ],
    ])("%s", (_description: string, givenInput: any) => {
      // GIVEN a valid institution staff role with institution ID (provided via test.each)

      // WHEN buildAccessRole is called
      const actualResult = buildAccessRole(givenInput);

      // THEN expect institution staff role with institutionId to be returned
      const expectedResult: AccessRole = {
        role: Role.INSTITUTION_STAFF,
        institutionId: givenInput.institutionId,
      };
      expect(actualResult).toEqual(expectedResult);
    });
  });

  describe("should return null for unrecognized roles", () => {
    test.each([
      ["invalid role string", { role: "invalid_role" }],
      ["invalid role with institutionId", { role: "invalid_role", institutionId: "inst-123" }],
      ["numeric role", { role: 123 }],
      ["object role", { role: {} }],
    ])("%s", (_description: string, givenInput: any) => {
      // GIVEN an unrecognized role (provided via test.each)

      // WHEN buildAccessRole is called
      const actualResult = buildAccessRole(givenInput);

      // THEN expect null to be returned
      expect(actualResult).toBeNull();
    });
  });
});
