import { Navigate, Outlet } from 'react-router-dom';
import { authService } from '../services';
import Layout from './Layout';

const PrivateRoute = () => {
  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

export default PrivateRoute; 