import { gql } from '@apollo/client';

export const LOGIN = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      token
      username
    }
  }
`;

export const REGISTER = gql`
  mutation Register($input: AccountInput!) {
    register(input: $input) {
      id
      username
      email
    }
  }
`;