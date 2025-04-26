import { gql } from '@apollo/client';

export const GET_USER_INFO = gql`
  query GetUserInfo($id: ID!) {
    userInfo(id: $id) {
      id
      fullName
      phone
      address
      maxBorrowBooks
      createdAt
      updatedAt
    }
  }
`;

