export type UserRole = 'ADMIN' | 'VENDOR' | 'USER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  image?: string;
}