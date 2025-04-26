import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { Table, Button, Flex, AlertDialog, Text } from '@radix-ui/themes';
import { Book } from '../../../types/book';
import { DELETE_BOOK } from '../../../graphql/mutations/admin/book';
import { AdminBookEdit } from './adminBookEdit';
import { Message } from '../../../components/common/message';
import './adminBookList.scss';

interface AdminBookListProps {
  books: Book[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onRefetch: () => void;
}

export const AdminBookList = ({
  books,
  currentPage,
  totalPages,
  onPageChange,
  onRefetch
}: AdminBookListProps) => {
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [messageOpen, setMessageOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [isSuccess, setIsSuccess] = useState(true);

  const [deleteBook, { loading: deleteLoading }] = useMutation(DELETE_BOOK, {
    onCompleted: () => {
      setIsSuccess(true);
      setMessageText('删除成功');
      setMessageOpen(true);
      onRefetch();
    },
    onError: (error) => {
      setIsSuccess(false);
      setMessageText(`删除失败: ${error.message}`);
      setMessageOpen(true);
    }
  });

  const handleDelete = async (id: string) => {
    try {
      await deleteBook({
        variables: { id }
      });
    } catch (error) {
      // 错误已在 onError 中处理
    }
  };

  const handleEditSuccess = () => {
    setEditingBook(null);
    setIsSuccess(true);
    setMessageText('图书信息更新成功');
    setMessageOpen(true);
    onRefetch();
  };

  return (
    <>
      <Message
        type={isSuccess ? 'success' : 'error'}
        message={messageText}
        open={messageOpen}
        onClose={() => setMessageOpen(false)}
      />

      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>ISBN</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>书名</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>作者</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>出版社</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>库存</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>操作</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {books.map((book) => (
            <Table.Row key={book.id}>
              <Table.Cell>{book.isbn}</Table.Cell>
              <Table.Cell>{book.title}</Table.Cell>
              <Table.Cell>{book.author}</Table.Cell>
              <Table.Cell>{book.publisher}</Table.Cell>
              <Table.Cell>{book.availableCopies}/{book.totalCopies}</Table.Cell>
              <Table.Cell>
                <Flex gap="2">
                  <Button size="1" onClick={() => setEditingBook(book)}>
                    编辑
                  </Button>
                  <AlertDialog.Root>
                    <AlertDialog.Trigger>
                      <Button size="1" color="red">
                        删除
                      </Button>
                    </AlertDialog.Trigger>
                    <AlertDialog.Content>
                      <AlertDialog.Title>删除确认</AlertDialog.Title>
                      <AlertDialog.Description>
                        确定要删除《{book.title}》吗？此操作不可撤销。
                      </AlertDialog.Description>
                      <Flex gap="3" mt="4" justify="end">
                        <AlertDialog.Cancel>
                          <Button variant="soft" color="gray">
                            取消
                          </Button>
                        </AlertDialog.Cancel>
                        <AlertDialog.Action>
                          <Button color="red" onClick={() => handleDelete(book.id)}>
                            删除
                          </Button>
                        </AlertDialog.Action>
                      </Flex>
                    </AlertDialog.Content>
                  </AlertDialog.Root>
                </Flex>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>

      {editingBook && (
        <AdminBookEdit
          book={editingBook}
          open={!!editingBook}
          onOpenChange={(open) => !open && setEditingBook(null)}
          onSuccess={handleEditSuccess}
        />
      )}

      <Flex justify="center" gap="2" mt="4">
        <Button
          variant="soft"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          上一页
        </Button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <Button
            key={page}
            variant={currentPage === page ? "solid" : "soft"}
            onClick={() => onPageChange(page)}
          >
            {page}
          </Button>
        ))}
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