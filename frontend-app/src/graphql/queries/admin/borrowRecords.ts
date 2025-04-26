import { gql } from '@apollo/client';

export const GET_ALL_BORROW_RECORDS = gql`
  query GetAllBorrowRecords($page: Int = 1, $size: Int = 10, $status: Int = -1, $keyword: String = "") {
    borrowRecords(page: $page, size: $size, status: $status, keyword: $keyword) {
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
        createdAt
        updatedAt
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