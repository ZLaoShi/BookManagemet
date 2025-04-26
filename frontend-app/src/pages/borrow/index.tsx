import { useQuery, useMutation } from "@apollo/client";
import { Box, Card, Flex, Button, Text } from "@radix-ui/themes";
import { useState } from "react";
import { BorrowRecordList } from "../../components/borrow/borrowRecordList";
import { RETURN_BOOK } from "../../graphql/mutations/user/borrowRecord";
import { GET_MY_BORROW_RECORDS } from "../../graphql/queries/user/borrowRecordList";
import { BorrowRecord } from "../../types/borrowRecord";
import { Message } from "../../components/common/message";
import './index.scss';

interface BorrowRecordsData {
  myBorrowRecords: {
    content: BorrowRecord[];
    pageInfo: {
      currentPage: number;
      pageSize: number;
      totalPages: number;
      totalElements: number;
      hasNext: boolean;
    };
  };
}

export const BorrowPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [messageOpen, setMessageOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [isSuccess, setIsSuccess] = useState(true);

  const { loading, error, data, refetch } = useQuery<BorrowRecordsData>(GET_MY_BORROW_RECORDS, {
    variables: { page: currentPage, size: pageSize },
    fetchPolicy: 'network-only'
  });

  const [returnBook, { loading: returningBook }] = useMutation(RETURN_BOOK, {
    onCompleted: (data) => {
      setIsSuccess(true);
      setMessageText(`《${data.returnBook.book.title}》归还成功！`);
      setMessageOpen(true);
      refetch();
    },
    onError: (error) => {
      setIsSuccess(false);
      setMessageText(`归还失败: ${error.message}`);
      setMessageOpen(true);
      console.error('归还失败详情:', error);
    }
  });

  const handleReturn = async (recordId: string) => {
    try {
      await returnBook({
        variables: {
          input: {
            recordId
          }
        }
      });
    } catch (error) {
      // 已在 onError 回调中处理错误
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const borrowRecords = data?.myBorrowRecords?.content || [];
  const pageInfo = data?.myBorrowRecords?.pageInfo;
  const totalPages = pageInfo?.totalPages || 1;
  const totalElements = pageInfo?.totalElements || 0;  // 添加总记录数

  return (
    <Box className="borrow-page">
      <Message 
        type={isSuccess ? 'success' : 'error'}
        message={messageText}
        open={messageOpen}
        onClose={() => setMessageOpen(false)}
      />

      <Card>
        <Flex direction="column" gap="4" p="4">
          <Flex justify="between" align="center">
            <Text size="6" weight="bold">我的借阅 {totalElements > 0 && `(共 ${totalElements} 条记录)`}</Text>
            <Button onClick={() => refetch()} disabled={loading}>
              刷新
            </Button>
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
          ) : (
            <BorrowRecordList 
              records={borrowRecords} 
              onReturn={handleReturn}
              loading={returningBook}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </Flex>
      </Card>
    </Box>
  );
};