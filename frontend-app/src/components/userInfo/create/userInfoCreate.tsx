import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { Card, Flex, Text } from '@radix-ui/themes';
import { CREATE_USER_INFO } from '../../../graphql/mutations/user/userInfo';
import { UserInfoEdit } from '../edit/userInfoEdit';
import { AdminUserInfoEdit } from '../edit/adminUserInfoEdit';
import { BaseUserInfoFormData } from '../edit/baseUserInfoEdit';
import './uesrInfoCreate.scss';

interface UserInfoCreateProps {
  isAdmin: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

export const UserInfoCreate = ({ isAdmin, onSuccess, onCancel }: UserInfoCreateProps) => {
  const [createUserInfo] = useMutation(CREATE_USER_INFO, {
    onCompleted: () => {
      onSuccess();
    },
  });

  const handleCreate = async (formData: BaseUserInfoFormData) => {
    try {
      await createUserInfo({
        variables: {
          input: formData,
        },
      });
    } catch (error) {
      console.error('创建失败:', error);
    }
  };

  // 使用一个空的用户信息对象作为初始值
  const emptyUserInfo = {
    id: '',
    fullName: '',
    phone: '',
    address: '',
    maxBorrowBooks: 0,
    createdAt: '',
    updatedAt: ''
  };

  return (
    <Card size="3" style={{ width: '100%' }}>
      <Flex direction="column" gap="4" p="4">
        <Text size="6" weight="bold" align="center" mb="4">
          创建个人信息
        </Text>
        
        {isAdmin ? (
          <AdminUserInfoEdit
            userInfo={emptyUserInfo}
            onSave={handleCreate}
            onCancel={onCancel}
          />
        ) : (
          <UserInfoEdit
            userInfo={emptyUserInfo}
            onSave={handleCreate}
            onCancel={onCancel}
          />
        )}
      </Flex>
    </Card>
  );
};