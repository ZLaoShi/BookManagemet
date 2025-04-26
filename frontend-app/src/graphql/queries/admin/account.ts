import { gql } from '@apollo/client';

export const GET_ACCOUNTS = gql`
  query GetAccounts($page: Int, $size: Int, $orderBy: String) {
    accounts(page: $page, size: $size, orderBy: $orderBy) {
      content {
        id
        username
        email
        createdAt
        lastLogin
        status
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

export const SEARCH_ACCOUNTS = gql`
  query SearchAccounts($keyword: String!, $page: Int, $size: Int) {
    searchAccounts(keyword: $keyword, page: $page, size: $size) {
      content {
        id
        username
        email
        createdAt
        lastLogin
        status
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