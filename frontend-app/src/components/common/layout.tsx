import { Outlet } from 'react-router-dom';
import { Header } from './header';
import { Box } from '@radix-ui/themes';

export const Layout = () => {
  return (
    <Box>
      <Header />
      <main>
        <Outlet />
      </main>
    </Box>
  );
};