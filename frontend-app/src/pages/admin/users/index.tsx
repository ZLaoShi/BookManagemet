import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { Box, Button, Card, Flex, Text, TextField } from '@radix-ui/themes';
import { GET_ACCOUNTS } from '../../../graphql/queries/admin/account';
import { AdminUserList } from '../../../components/admin/user/adminUserList';
import { Message } from '../../../components/common/message';
import './index.scss';

interface Account {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  lastLogin: string;
  status: number;
}

interface AccountsData {
  accounts: {
    content: Account[];
    pageInfo: {
      currentPage: number;
      pageSize: number;
      totalPages: number;
      totalElements: number;
      hasNext: boolean;
    };
  };
}

export const AdminUsers = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [messageOpen, setMessageOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [isSuccess, setIsSuccess] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');

  const { loading, error, data, refetch } = useQuery<AccountsData>(GET_ACCOUNTS, {
    variables: { page: currentPage, size: pageSize },
    fetchPolicy: 'network-only'
  });

  const accounts = data?.accounts?.content || [];
  const pageInfo = data?.accounts?.pageInfo;
  const totalPages = pageInfo?.totalPages || 1;
  const totalElements = pageInfo?.totalElements || 0;

  const showMessage = (text: string, success: boolean) => {
    setMessageText(text);
    setIsSuccess(success);
    setMessageOpen(true);
  };

  const handleSearch = () => {
    // 重置到第一页
    setCurrentPage(1);
    refetch({
      page: 1,
      size: pageSize,
      keyword: searchKeyword
    });
  };

  return (
    <Box className="admin-users">
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
              用户管理 {totalElements > 0 && `(共 ${totalElements} 个)`}
            </Text>
            <Flex gap="3">
              <TextField.Root 
                placeholder="搜索用户名或邮箱" 
                value={searchKeyword}
                onChange={e => setSearchKeyword(e.target.value)}
                style={{ width: '240px' }}
              />
              <Button onClick={handleSearch}>
                搜索
              </Button>
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
          ) : accounts.length === 0 ? (
            <Flex justify="center" p="4">
              <Text>暂无用户数据</Text>
            </Flex>
          ) : (
            <AdminUserList
              accounts={accounts}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              onRefetch={refetch}
              onMessage={showMessage}
            />
          )}
        </Flex>
      </Card>
    </Box>
  );
};