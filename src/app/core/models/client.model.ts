import { User } from './user.model';
import { UserRole } from './role.enum';

export interface ClientTheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  headerBg: string;
}

export interface MockCredential {
  username: string;
  password: string;
  role: UserRole | string;
}

export interface ClientConfig {
  clientId: string;
  clientName: string;
  theme: ClientTheme;
  logo: string;
  departments: string[];
  roles: (UserRole | string)[];
  mockCredentials: MockCredential[];
  users: User[];
}
