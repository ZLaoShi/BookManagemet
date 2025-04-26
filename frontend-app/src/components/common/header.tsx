import { useAtom } from 'jotai';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Box, Flex, Text } from '@radix-ui/themes';
import { authAtom } from '../../stores/authAtoms';
import { logoutAction } from '../../stores/authActions';
import './header.scss';

export const Header = () => {
  const [auth] = useAtom(authAtom);
  const [, logout] = useAtom(logoutAction);
  const location = useLocation();
  const navigate = useNavigate();
  
  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');  // 退出后自动跳转到首页
  };

  return (
    <Box className="header" mb="4">
      <Flex justify="between" align="center" className="header-container">
        <Text size="5" weight="bold" className="header-title">
          图书管理系统
        </Text>
        <Flex gap="6" className="nav-links">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
            首页
          </Link>
          
          {auth.isAuthenticated ? (
            <>
              <Link to="/my-books" className={`nav-link ${isActive('/my-books') ? 'active' : ''}`}>
                我的借阅
              </Link>
              <Link to="/profile" className={`nav-link ${isActive('/profile') ? 'active' : ''}`}>
                个人信息
              </Link>
              <a href="#" onClick={handleLogout} className="nav-link">
                退出登录
              </a>
            </>
          ) : (
            <Link to="/login" className={`nav-link ${isActive('/login') ? 'active' : ''}`}>
              登录
            </Link>
          )}
        </Flex>
      </Flex>
    </Box>
  );
};