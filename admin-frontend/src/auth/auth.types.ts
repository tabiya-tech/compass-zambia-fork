/**
 * Represents an authenticated admin user
 */
export type AdminUser = {
  id: string;
  name: string;
  email: string;
};

/**
 * Represents the header of a JWT token
 */
export interface TokenHeader {
  alg: string;
  typ: string;
  kid: string;
}

/**
 * Represents the payload of a JWT token
 */
export interface Token {
  iss: string;
  aud: string;
  exp: number;
  iat: number;
  sub: string;
}
