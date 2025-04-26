import { gql } from '@apollo/client';

export const GET_MY_BORROW_RECORDS = gql`
  query GetMyBorrowRecords($page: Int, $size: Int) {
    myBorrowRecords(page: $page, size: $size) {
      content {
        id
        book {
          id
          title
          author
        }
        borrowDate
        dueDate
        returnDate
        status
        remarks
      }
      pageInfo {
        currentPage
        pageSize
        totalPages
        totalElements
        hasNext
      }
    }
  }
`;

