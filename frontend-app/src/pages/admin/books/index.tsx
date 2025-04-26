import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { Box, Button, Card, Flex, Text } from '@radix-ui/themes';
import { GET_BOOKS } from '../../../graphql/queries/books';
import { AdminBookList } from '../../../components/admin/book/adminBoosList';
import { AdminBookCreate } from '../../../components/admin/book/adminBookCreate';
import { Book } from '../../../types/book';
import { Message } from '../../../components/common/message';
import './index.scss';

interface BooksData {
  books: {
    content: Book[];
    pageInfo: {
      currentPage: number;
      pageSize: number;
      totalPages: number;
      totalElements: number;
      hasNext: boolean;
    };
  };
}

export const AdminBooks = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [isCreating, setIsCreating] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [isSuccess, setIsSuccess] = useState(true);

  const { loading, error, data, refetch } = useQuery<BooksData>(GET_BOOKS, {
    variables: { page: currentPage, size: pageSize },
    fetchPolicy: 'network-only'
  });

  const books = data?.books?.content || [];
  const pageInfo = data?.books?.pageInfo;
  const totalPages = pageInfo?.totalPages || 1;
  const totalElements = pageInfo?.totalElements || 0;

  const handleCreateSuccess = () => {
    setIsCreating(false);
    setIsSuccess(true);
    setMessageText('图书添加成功');
    setMessageOpen(true);
    refetch();
  };

  return (
    <Box className="admin-books">
      <Message 
        type={isSuccess ? 'success' : 'error'}
        message={messageText}
        open={messageOpen}
        onClose={() => setMessageOpen(false)}
      />

      <Card>
        <Flex direction="column" gap="4" p="4">
          <Flex justify="between" align="center">
            <Text size="6" weight="bold">
              图书管理 {totalElements > 0 && `(共 ${totalElements} 本)`}
            </Text>
            <Flex gap="3">
              <Button onClick={() => setIsCreating(true)}>添加图书</Button>
              <Button variant="soft" onClick={() => refetch()} disabled={loading}>
                刷新
              </Button>
            </Flex>
          </Flex>

          {loading ? (
            <Flex justify="center" p="4">
              <Text>加载中...</Text>
            </Flex>
          ) : error ? (
            <Flex justify="center" p="4" direction="column" align="center" gap="2">
              <Text color="red">加载失败: {error.message}</Text>
              <Button onClick={() => refetch()}>重试</Button>
            </Flex>
          ) : books.length === 0 ? (
            <Flex justify="center" p="4">
              <Text>暂无图书数据</Text>
            </Flex>
          ) : (
            <AdminBookList
              books={books}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              onRefetch={refetch}
            />
          )}
        </Flex>
      </Card>

      {isCreating && (
        <AdminBookCreate
          open={isCreating}
          onOpenChange={setIsCreating}
          onSuccess={handleCreateSuccess}
        />
      )}
    </Box>
  );
};