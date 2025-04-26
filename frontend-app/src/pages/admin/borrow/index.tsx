import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { Box, Button, Card, Flex, Text, TextField, Select } from '@radix-ui/themes';
import { GET_ALL_BORROW_RECORDS } from '../../../graphql/queries/admin/borrowRecords';
import { AdminBorrowRecordList } from '../../../components/admin/borrow/adminBorrowRecordList';
import { Message } from '../../../components/common/message';
import { BorrowStatus } from '../../../types/borrowRecord';
import './index.scss';

interface BorrowRecordsData {
  borrowRecords: {
    content: Array<{
      id: string;
      book: {
        id: string;
        title: string;
        author: string;
      };
      borrowDate: string;
      dueDate: string;
      returnDate?: string;
      status: BorrowStatus;
      remarks?: string;
      createdAt: string;
      updatedAt: string;
    }>;
    pageInfo: {
      currentPage: number;
      pageSize: number;
      totalPages: number;
      totalElements: number;
      hasNext: boolean;
    };
  };
}

export const AdminBorrowRecords = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('-1'); // 默认全部状态 (-1)
  const [searchKeyword, setSearchKeyword] = useState('');
  const pageSize = 10;
  const [messageOpen, setMessageOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [isSuccess, setIsSuccess] = useState(true);

  // 使用状态和关键字参数查询
  const { loading, error, data, refetch } = useQuery<BorrowRecordsData>(GET_ALL_BORROW_RECORDS, {
    variables: { 
      page: currentPage, 
      size: pageSize,
      status: parseInt(statusFilter),
      keyword: searchKeyword
    },
    fetchPolicy: 'network-only'
  });

  const borrowRecords = data?.borrowRecords?.content || [];
  const pageInfo = data?.borrowRecords?.pageInfo;
  const totalPages = pageInfo?.totalPages || 1;
  const totalElements = pageInfo?.totalElements || 0;

  const handleSearch = () => {
    setCurrentPage(1);
    refetch({
      page: 1, 
      size: pageSize,
      status: parseInt(statusFilter),
      keyword: searchKeyword
    });
  };

  const handleClearSearch = () => {
    setSearchKeyword('');
    setStatusFilter('-1');
    setCurrentPage(1);
    refetch({
      page: 1,
      size: pageSize,
      status: -1,
      keyword: ""
    });
  };

  const showMessage = (text: string, success: boolean) => {
    setMessageText(text);
    setIsSuccess(success);
    setMessageOpen(true);
  };

  return (
    <Box className="admin-borrow-records">
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
              借阅管理 {totalElements > 0 && `(共 ${totalElements} 条记录)`}
            </Text>
            <Flex gap="3">
              <Select.Root 
                value={statusFilter} 
                onValueChange={setStatusFilter}
                size="2"
              >
                <Select.Trigger placeholder="选择状态" />
                <Select.Content>
                  <Select.Item value="-1">所有状态</Select.Item>
                  <Select.Item value="0">借阅中</Select.Item>
                  <Select.Item value="1">已归还</Select.Item>
                  <Select.Item value="2">逾期未还</Select.Item>
                  <Select.Item value="3">已损坏/丢失</Select.Item>
                </Select.Content>
              </Select.Root>

              <TextField.Root 
                placeholder="搜索书名、作者" 
                value={searchKeyword}
                onChange={e => setSearchKeyword(e.target.value)}
                style={{ width: '240px' }}
              />
              <Button onClick={handleSearch}>
                搜索
              </Button>
              {(searchKeyword || statusFilter !== '-1') && (
                <Button variant="soft" onClick={handleClearSearch}>
                  清除筛选
                </Button>
              )}
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
          ) : borrowRecords.length === 0 ? (
            <Flex justify="center" p="4">
              <Text>{searchKeyword || statusFilter !== '-1' ? '没有找到匹配的借阅记录' : '暂无借阅记录'}</Text>
            </Flex>
          ) : (
            <AdminBorrowRecordList
              borrowRecords={borrowRecords}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => {
                setCurrentPage(page);
                refetch({
                  page,
                  size: pageSize,
                  status: parseInt(statusFilter),
                  keyword: searchKeyword
                });
              }}
              onRefetch={() => {
                refetch({
                  page: currentPage,
                  size: pageSize,
                  status: parseInt(statusFilter),
                  keyword: searchKeyword
                });
              }}
              onMessage={showMessage}
            />
          )}
        </Flex>
      </Card>
    </Box>
  );
};