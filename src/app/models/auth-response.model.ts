export interface AuthResponse {
  token: string;
  expiresAtUtc: string;
  username: string;
  email: string;
  roles: string[];
  firstName?: string | null;   // <-- add
  lastName?: string | null;    // <-- add
}