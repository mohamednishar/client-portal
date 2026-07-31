import { UserRole } from './role.enum';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  dob: string;
  department: string;
  role: UserRole | string;
}

export interface UserSearchFilter {
  department: string;
  searchText: string;
}
