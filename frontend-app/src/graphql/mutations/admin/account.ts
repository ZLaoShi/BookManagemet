import { gql } from '@apollo/client';

export const UPDATE_ACCOUNT_STATUS = gql`
  mutation UpdateAccountStatus($id: ID!, $status: Int!) {
    updateAccountStatus(id: $id, status: $status) {
      id
      username
      status
    }
  }
`;

export const UPDATE_ACCOUNT_TYPE = gql`
  mutation UpdateAccountType($id: ID!, $userType: Int!) {
    updateAccountType(id: $id, userType: $userType) {
      id
      username
    }
  }
`;

export const RESET_PASSWORD = gql`
  mutation ResetPassword($id: ID!, $newPassword: String!) {
    resetPassword(id: $id, newPassword: $newPassword)
  }
`;