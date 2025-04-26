import { Outlet } from 'react-router-dom';
import { AdminHeader } from '../adminHeader';
import { AdminSidebar } from '../adminSidebar';
import { Box, Flex } from '@radix-ui/themes';
import './adminLayout.scss';

export const AdminLayout = () => {
  return (
    <Box className="admin-layout">
      <AdminHeader />
      <Flex className="admin-container">
        <AdminSidebar />
        <Box className="admin-content">
          <Outlet />
        </Box>
      </Flex>
    </Box>
  );
};