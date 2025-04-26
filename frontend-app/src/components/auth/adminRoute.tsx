import { useAtom } from 'jotai';
import { Navigate, useLocation } from 'react-router-dom';
import { isAdminAtom } from '../../stores/authAtoms';

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute = ({ children }: AdminRouteProps) => {
  const [isAdmin] = useAtom(isAdminAtom);
  const location = useLocation();

  if (!isAdmin) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};