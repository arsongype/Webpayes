export interface UserDTO {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  enabled: boolean;
  createdAt?: string;
}