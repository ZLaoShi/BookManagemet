import { gql } from '@apollo/client';

export const SEARCH_BOOKS = gql`
  query SearchBooks($keyword: String!, $page: Int, $size: Int) {
    searchBooks(keyword: $keyword, page: $page, size: $size) {
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
      }
      pageInfo {
        totalPages
        hasNext
      }
    }
  }
`;