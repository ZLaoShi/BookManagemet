export interface UserInfo {
  id: string;
  fullName: string;
  phone?: string;
  address?: string;
  maxBorrowBooks: number;
  createdAt: string;
  updatedAt: string;
}