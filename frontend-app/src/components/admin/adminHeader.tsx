import { useAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { Box, Flex, Text } from '@radix-ui/themes';
import './adminHeader.scss';
import { logoutAction } from '../../stores/authActions';
import { authAtom } from '../../stores/authAtoms';

export const AdminHeader = () => {
  const [auth] = useAtom(authAtom);
  const [, logout] = useAtom(logoutAction);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Box className="admin-header">
      <Flex justify="between" align="center" className="header-container">
        <Text size="5" weight="bold">图书管理系统 - 管理后台</Text>
        <Flex gap="4" align="center">
          <Text>欢迎您，{auth.username}</Text>
          <a href="#" onClick={handleLogout} className="logout-link">
            退出登录
          </a>
        </Flex>
      </Flex>
    </Box>
  );
};