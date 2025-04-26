import { useAtom } from 'jotai';
import { useMutation } from '@apollo/client';
import { Flex, Text, Button, Card, Badge } from "@radix-ui/themes";
import { Book } from '../../types/book';
import { BORROW_BOOK } from '../../graphql/mutations/user/borrowRecord';
import { authAtom } from '../../stores/authAtoms';
import { useNavigate } from 'react-router-dom';
import './bookCard.scss'; 

type BookCardProps = Book;

export const BookCard = ({ 
  id,
  title, 
  author, 
  isbn, 
  publishDate, 
  publisher, 
  availableCopies,
  totalCopies,
  category
}: BookCardProps) => {
  const [auth] = useAtom(authAtom);
  const navigate = useNavigate();
  
  const [borrowBook, { loading }] = useMutation(BORROW_BOOK, {
    onCompleted: () => {
      // 借书成功后跳转到我的借阅页面
      navigate('/my-books');
    }
  });

  const handleBorrow = async () => {
    if (!auth.isAuthenticated) {
      // 未登录，跳转到登录页面
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    try {
      await borrowBook({
        variables: {
          input: {
            bookId: id
          }
        }
      });
    } catch (error) {
      console.error('借书失败:', error);
    }
  };

  return (
    <Card className="book-card">
      <Flex direction="column" gap="2">
        <Flex justify="between" align="center">
          <Text size="5" weight="bold">{title}</Text>
          <Badge color={availableCopies > 0 ? "green" : "red"}>
            {availableCopies > 0 ? "可借阅" : "已借完"}
          </Badge>
        </Flex>
        
        <Flex direction="column" gap="1">
          <Text>作者: {author}</Text>
          <Text>ISBN: {isbn}</Text>
          <Text>出版社: {publisher}</Text>
          <Text>出版日期: {new Date(publishDate).toLocaleDateString()}</Text>
          <Text>分类: {category}</Text>
          <Text>可借数量: {availableCopies}/{totalCopies}</Text>
        </Flex>

        <Button 
          variant="solid" 
          disabled={availableCopies === 0 || loading}
          onClick={handleBorrow}
        >
          {loading ? '借阅中...' : '借阅'}
        </Button>
      </Flex>
    </Card>
  );
};