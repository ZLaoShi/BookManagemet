import { useAtom } from 'jotai';
import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { Card, Flex, Text, Button } from '@radix-ui/themes';
import { GET_USER_INFO } from '../../graphql/queries/user/userInfo';
import { UserInfo } from '../../types/userInfo';
import { authAtom } from '../../stores/authAtoms';
import { UserInfoDisplay } from '../../components/userInfo/display/userInfoDisplay';
import { UserInfoEdit } from '../../components/userInfo/edit/userInfoEdit';
import { AdminUserInfoEdit } from '../../components/userInfo/edit/adminUserInfoEdit';
import { UserInfoCreate } from '../../components/userInfo/create/userInfoCreate';
import './index.scss';
import { UPDATE_USER_INFO } from '../../graphql/mutations/user/userInfo';

export const UserInfoPage = () => {
  const [auth] = useAtom(authAtom);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  const { loading, error, data, refetch } = useQuery<{ userInfo: UserInfo }>(GET_USER_INFO, {
    variables: { id: auth.userId },
    skip: !auth.userId
  });

  const [updateUserInfo] = useMutation(UPDATE_USER_INFO, {
    onCompleted: () => {
      setIsEditing(false);
    },
  });

  if (!auth.userId) return <Text>未找到用户信息</Text>;
  if (loading) return <Text>加载中...</Text>;
  
  // 检查 userInfo 是否为 null
  if (!data?.userInfo || error?.message.includes('not found')) {
    return (
      <Flex justify="center" className="profile-container">
        {isCreating ? (
          <UserInfoCreate
            isAdmin={auth.isAdmin}
            onSuccess={() => {
              setIsCreating(false);
              refetch();
            }}
            onCancel={() => setIsCreating(false)}
          />
        ) : (
          <Card size="3" style={{ width: '100%', maxWidth: '800px' }}>
            <Flex direction="column" gap="4" p="4" align="center">
              <Text size="5">您还没有创建个人信息</Text>
              <Button onClick={() => setIsCreating(true)}>
                创建个人信息
              </Button>
            </Flex>
          </Card>
        )}
      </Flex>
    );
  }

  if (error) return <Text color="red">错误: {error.message}</Text>;

  const userInfo = data.userInfo;

  const handleSave = async (formData: any) => {
    try {
      await updateUserInfo({
        variables: {
          input: {
            ...formData
          }
        }
      });
    } catch (error) {
      console.error('更新失败:', error);
    }
  };

  return (
    <Flex justify="center" className="profile-container">
      <Card size="3" style={{ width: '100%', maxWidth: '800px' }}>
        <Flex direction="column" gap="4" p="4">
          <Flex justify="between" align="center">
            <Text size="6" weight="bold">个人信息</Text>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)}>
                修改
              </Button>
            )}
          </Flex>
          
          {isEditing ? (
            auth.isAdmin ? (
              <AdminUserInfoEdit
                userInfo={userInfo!}
                onSave={handleSave}
                onCancel={() => setIsEditing(false)}
              />
            ) : (
              <UserInfoEdit
                userInfo={userInfo!}
                onSave={handleSave}
                onCancel={() => setIsEditing(false)}
              />
            )
          ) : (
            <UserInfoDisplay userInfo={userInfo} />
          )}
        </Flex>
      </Card>
    </Flex>
  );
};