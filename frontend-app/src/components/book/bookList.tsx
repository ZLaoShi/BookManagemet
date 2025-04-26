import { Book } from '../../types/book';
import { BookCard } from './bookCard';
import { Button, Flex } from '@radix-ui/themes';
import './bookList.scss';

interface BookListProps {
  books: Book[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const BookList = ({ 
  books, 
  currentPage, 
  totalPages, 
  onPageChange 
}: BookListProps) => {
  return (
    <>
      <div className="book-list">
        {books.map((book) => (
          <BookCard key={book.id} {...book} />
        ))}
      </div>
      
      <Flex className="pagination" justify="center" gap="2" mt="4">
        <Button 
          variant="soft" 
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          上一页
        </Button>
        
        <Flex gap="1" align="center">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "solid" : "soft"}
              onClick={() => onPageChange(page)}
            >
              {page}
            </Button>
          ))}
        </Flex>

        <Button 
          variant="soft"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          下一页
        </Button>
      </Flex>
    </>
  );
};