export interface Book {
    id: string;
    isbn: string;
    title: string;
    author: string;
    publisher: string;
    publishDate: string;
    category: string;
    description: string;
    totalCopies: number;
    availableCopies: number;
    location: string;
    createdAt: string;
    updatedAt: string;
  }