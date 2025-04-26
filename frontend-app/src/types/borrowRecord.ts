import { Book } from './book';
import { UserInfo } from './userInfo';

export interface BorrowRecord {
  id: string;
  book: Book;
  userInfo?: UserInfo;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: BorrowStatus;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export enum BorrowStatus {
  BORROWED = 0,   // 借阅中
  RETURNED = 1,   // 已归还
  OVERDUE = 2,    // 逾期未还
  DAMAGED = 3     // 已损坏/丢失
}

export const getBorrowStatusText = (status: BorrowStatus): string => {
  switch (status) {
    case BorrowStatus.BORROWED:
      return '借阅中';
    case BorrowStatus.RETURNED:
      return '已归还';
    case BorrowStatus.OVERDUE:
      return '逾期未还';
    case BorrowStatus.DAMAGED:
      return '已损坏/丢失';
    default:
      return '未知状态';
  }
};

export const getBorrowStatusColor = (status: BorrowStatus): "blue" | "green" | "orange" | "red" | "gray" => {
  switch (status) {
    case BorrowStatus.BORROWED:
      return 'blue';
    case BorrowStatus.RETURNED:
      return 'green';
    case BorrowStatus.OVERDUE:
      return 'orange'; 
    case BorrowStatus.DAMAGED:
      return 'red';
    default:
      return 'gray';
  }
};