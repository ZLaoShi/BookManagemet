import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { Table, Button, Flex, AlertDialog, Text, Badge } from '@radix-ui/themes';
import { UPDATE_ACCOUNT_STATUS, UPDATE_ACCOUNT_TYPE, RESET_PASSWORD } from '../../../graphql/mutations/admin/account';
import { AdminUserReset } from './adminUserReset';
import './adminUserList.scss';

interface Account {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  lastLogin: string;
  status: number;
}

interface AdminUserListProps {
  accounts: Account[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onRefetch: () => void;
  onMessage: (text: string, success: boolean) => void;
}

export const AdminUserList = ({
  accounts,
  currentPage,
  totalPages,
  onPageChange,
  onRefetch,
  onMessage
}: AdminUserListProps) => {
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  const [updateStatus, { loading: updateStatusLoading }] = useMutation(UPDATE_ACCOUNT_STATUS, {
    onCompleted: () => {
      onMessage('状态更新成功', true);
      onRefetch();
    },
    onError: (error) => {
      onMessage(`状态更新失败: ${error.message}`, false);
    }
  });

  const [updateType, { loading: updateTypeLoading }] = useMutation(UPDATE_ACCOUNT_TYPE, {
    onCompleted: () => {
      onMessage('用户类型更新成功', true);
      onRefetch();
    },
    onError: (error) => {
      onMessage(`用户类型更新失败: ${error.message}`, false);
    }
  });

  const handleStatusChange = async (id: string, newStatus: number) => {
    try {
      await updateStatus({
        variables: { id, status: newStatus }
      });
    } catch (error) {
      // 错误已在 onError 中处理
    }
  };

  const handleTypeChange = async (id: string, newType: number) => {
    try {
      await updateType({
        variables: { id, userType: newType }
      });
    } catch (error) {
      // 错误已在 onError 中处理
    }
  };

  const handleResetPassword = (id: string) => {
    setSelectedAccountId(id);
    setResetModalOpen(true);
  };

  const getStatusBadge = (status: number) => {
    switch(status) {
      case 1:
        return <Badge color="green">正常</Badge>;
      case 0:
        return <Badge color="red">禁用</Badge>;
      default:
        return <Badge color="gray">未知</Badge>;
    }
  };

  return (
    <>
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>用户名</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>邮箱</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>注册时间</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>最后登录时间</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>状态</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>操作</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {accounts.map((account) => (
            <Table.Row key={account.id}>
              <Table.Cell>{account.username}</Table.Cell>
              <Table.Cell>{account.email || '-'}</Table.Cell>
              <Table.Cell>{new Date(account.createdAt).toLocaleString()}</Table.Cell>
              <Table.Cell>{account.lastLogin ? new Date(account.lastLogin).toLocaleString() : '从未登录'}</Table.Cell>
              <Table.Cell>{getStatusBadge(account.status)}</Table.Cell>
              <Table.Cell>
                <Flex gap="2" wrap="wrap">
                  <Button 
                    size="1" 
                    color={account.status === 0 ? "red" : "green"}
                    onClick={() => handleStatusChange(account.id, account.status === 0 ? 1 : 0)}
                    disabled={updateStatusLoading}
                  >
                    {account.status === 0 ? '禁用' : '启用'}
                  </Button>
                  <Button 
                    size="1"
                    onClick={() => handleResetPassword(account.id)}
                  >
                    重置密码
                  </Button>
                </Flex>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>

      <Flex justify="center" gap="2" mt="4" className="pagination">
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

      <AdminUserReset
        accountId={selectedAccountId}
        open={resetModalOpen}
        onOpenChange={setResetModalOpen}
        onSuccess={() => {
          onMessage('密码重置成功', true);
          onRefetch();
        }}
        onError={(error) => onMessage(`密码重置失败: ${error}`, false)}
      />
    </>
  );
};