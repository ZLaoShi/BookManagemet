import { gql } from '@apollo/client';

export const ADMIN_BORROW_BOOK = gql`
  mutation AdminBorrowBook($userId: ID!, $input: BorrowBookInput!) {
    adminBorrowBook(userId: $userId, input: $input) {
      id
      book {
        id
        title
        availableCopies
      }
      borrowDate
      dueDate
      status
    }
  }
`;

export const ADMIN_RETURN_BOOK = gql`
  mutation AdminReturnBook($userId: ID!, $input: ReturnBookInput!) {
    adminReturnBook(userId: $userId, input: $input) {
      id
      book {
        id
        title
        availableCopies
      }
      returnDate
      status
    }
  }
`;

export const ADMIN_FORCE_RETURN = gql`
  mutation AdminForceReturn($recordId: ID!, $status: Int!, $remarks: String) {
    adminForceReturn(recordId: $recordId, status: $status, remarks: $remarks) {
      id
      book {
        id
        title
        availableCopies
      }
      returnDate
      status
      remarks
    }
  }
`;