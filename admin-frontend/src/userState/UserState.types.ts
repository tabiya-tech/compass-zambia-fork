import { AccessRole } from "src/auth/services/FirebaseAuthenticationService/types";

export interface UserState {
  id: string;
  name: string;
  email: string;
  accessRole: AccessRole;
}

export function getInstitutionId(userState: UserState | null): string | null {
  if (!userState) {
    return null;
  }

  if ("institutionId" in userState.accessRole) {
    return userState.accessRole.institutionId;
  }

  return null;
}
