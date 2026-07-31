import { User } from './user.model';

export interface AuthSession {
  token: string;
  user: User;
  role: string;
  clientId: string;
  loginTimestamp: number;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: User;
  errorKey?: string;
}
