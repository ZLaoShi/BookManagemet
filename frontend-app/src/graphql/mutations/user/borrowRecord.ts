import { gql } from "@apollo/client";

export const BORROW_BOOK = gql`
  mutation BorrowBook($input: BorrowBookInput!) {
    borrowBook(input: $input) {
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

export const RETURN_BOOK = gql`
  mutation ReturnBook($input: ReturnBookInput!) {
    returnBook(input: $input) {
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