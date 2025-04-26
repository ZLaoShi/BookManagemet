import { createBrowserRouter } from 'react-router-dom';
import { HomePage } from '../pages/home';
import { Layout } from '../components/common/layout';
import { LoginPage } from '../pages/login';
import { ProtectedRoute } from '../components/auth/protectedRoute';
import { UserInfoPage } from '../pages/profile'
import { RegisterPage } from '../pages/register';
import { BorrowPage } from '../pages/borrow';
import { AdminLayout } from '../components/admin/layout/adminLayout';
import { AdminRoute } from '../components/auth/adminRoute';
// import { AdminDashboard } from '../pages/admin/dashboard';
import { AdminBooks } from '../pages/admin/books';
import { AdminUsers } from '../pages/admin/users';
import { AdminBorrowRecords } from '../pages/admin/borrow';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
      path: '/profile',
      element: (
        <ProtectedRoute>
          <UserInfoPage />
        </ProtectedRoute>
        ),
      },
      {
        path:'/register',
        element:<RegisterPage/>
      },
      {
        path:'/my-books',
         element: (
          <ProtectedRoute>
            <BorrowPage/>
          </ProtectedRoute>
        )
      }

    ]
  },
  {
    path: '/admin',
    element: (
      <AdminRoute>
        <AdminLayout />
      </AdminRoute>
    ),
    children: [
      // {
      //   path: '',
      //   element: <AdminDashboard />
      // },
      {
        path: 'books',
        element: <AdminBooks />
      },
      {
        path: 'users',
        element: <AdminUsers />
      },
      {
        path: 'borrow-records',
        element: <AdminBorrowRecords />
      }
    ]
  }
]);