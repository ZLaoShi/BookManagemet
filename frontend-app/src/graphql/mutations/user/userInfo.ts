import { gql } from '@apollo/client';

export const CREATE_USER_INFO = gql`
  mutation CreateUserInfo($input: UserInfoInput!) {
    createUserInfo(input: $input) {
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

export const UPDATE_USER_INFO = gql`
  mutation UpdateUserInfo($input: UserInfoInput!) {
    updateUserInfo(input: $input) {
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