import { User } from './user.model';

export interface AuthSession {
  token: string;
  tenant: string;
  user: User;
  role: string;
  loginTimestamp: number;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  tenant?: string;
  user?: User;
  errorKey?: string;
}
