import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { Dialog, Flex, Button, TextField, Text } from '@radix-ui/themes';
import { RESET_PASSWORD } from '../../../graphql/mutations/admin/account';

interface AdminUserResetProps {
  accountId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  onError: (message: string) => void;
}

export const AdminUserReset = ({ 
  accountId,
  open, 
  onOpenChange, 
  onSuccess,
  onError
}: AdminUserResetProps) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const [resetPassword, { loading }] = useMutation(RESET_PASSWORD, {
    onCompleted: () => {
      onSuccess();
      onOpenChange(false);
      resetForm();
    },
    onError: (error) => {
      onError(error.message);
    }
  });

  const resetForm = () => {
    setNewPassword('');
    setConfirmPassword('');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newPassword) {
      setError('请输入新密码');
      return;
    }

    if (newPassword.length < 6) {
      setError('密码长度不能少于6位');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    if (!accountId) {
      setError('未选择用户');
      return;
    }

    try {
      await resetPassword({
        variables: {
          id: accountId,
          newPassword
        }
      });
    } catch (error) {
      // 错误在 onError 回调中处理
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) resetForm();
    }}>
      <Dialog.Content style={{ maxWidth: 450 }}>
        <Dialog.Title>重置密码</Dialog.Title>
        
        <form onSubmit={handleSubmit}>
          <Flex direction="column" gap="4">
            <Flex direction="column" gap="2">
              <Text as="label" size="2" weight="bold">
                新密码
              </Text>
              <TextField.Root
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </Flex>

            <Flex direction="column" gap="2">
              <Text as="label" size="2" weight="bold">
                确认新密码
              </Text>
              <TextField.Root
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </Flex>

            {error && (
              <Text color="red" size="2">{error}</Text>
            )}
            
            <Flex gap="3" mt="4" justify="end">
              <Dialog.Close>
                <Button variant="soft" color="gray">取消</Button>
              </Dialog.Close>
              <Button type="submit" disabled={loading}>
                {loading ? '提交中...' : '确认重置'}
              </Button>
            </Flex>
          </Flex>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  );
};