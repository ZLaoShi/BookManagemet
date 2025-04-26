import { Link, useLocation } from 'react-router-dom';
import { Box, Flex } from '@radix-ui/themes';
import {
  BookmarkIcon,
  PersonIcon,
  ReaderIcon,
  DashboardIcon
} from '@radix-ui/react-icons';
import './adminSidebar.scss';

const menuItems = [
  { path: '/admin', icon: <DashboardIcon />, label: '仪表盘' },
  { path: '/admin/books', icon: <BookmarkIcon />, label: '图书管理' },
  { path: '/admin/users', icon: <PersonIcon />, label: '用户管理' },
  { path: '/admin/borrow-records', icon: <ReaderIcon />, label: '借阅管理' },
];

export const AdminSidebar = () => {
  const location = useLocation();

  return (
    <Box className="admin-sidebar">
      <Flex direction="column" gap="2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <Flex gap="2" align="center">
              {item.icon}
              <span>{item.label}</span>
            </Flex>
          </Link>
        ))}
      </Flex>
    </Box>
  );
};