import { gql } from '@apollo/client';

export const GET_BOOKS = gql`
  query GetBooks($page: Int, $size: Int) {
    books(page: $page, size: $size) {
      content {
        id
        isbn
        title
        author
        publisher
        publishDate
        category
        description
        totalCopies
        availableCopies
        location
      }
      pageInfo {
        totalPages
        hasNext
      }
    }
  }
`;