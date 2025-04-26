import { gql } from '@apollo/client';

export const CREATE_BOOK = gql`
  mutation CreateBook($input: CreateBookInput!) {
    createBook(input: $input) {
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
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_BOOK = gql`
  mutation UpdateBook($id: ID!, $input: CreateBookInput!) {
    updateBook(id: $id, input: $input) {
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
      updatedAt
    }
  }
`;

export const DELETE_BOOK = gql`
  mutation DeleteBook($id: ID!) {
    deleteBook(id: $id)
  }
`;