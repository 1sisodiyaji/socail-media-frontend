import { createBrowserRouter, RouterProvider, createRoutesFromElements, Route, Outlet } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Feed from './pages/Feed';
import Profile from './pages/Profile';
import SinglePostView from './pages/SinglePostView';
import EditProfile from './pages/EditProfile';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  );
};

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route errorElement={<ErrorBoundary />}>
      <Route 
        path="/login" 
        element={<Login />}
        errorElement={<ErrorBoundary />}
      />
      <Route 
        path="/register" 
        element={<Register />}
        errorElement={<ErrorBoundary />}
      />
      <Route 
        element={<PrivateRoute />}
        errorElement={<ErrorBoundary />}
      >
        <Route element={<AppLayout />}>
          <Route 
            path="/" 
            element={<Feed />}
            errorElement={<ErrorBoundary />}
          />
          <Route 
            path="/profile/:userId" 
            element={<Profile />}
            errorElement={<ErrorBoundary />}
          />
          <Route 
            path="/profile/edit" 
            element={<EditProfile />}
            errorElement={<ErrorBoundary />}
          />
          <Route 
            path="/post/:id" 
            element={<SinglePostView />}
            errorElement={<ErrorBoundary />}
          />
        </Route>
      </Route>
      <Route path="*" element={<ErrorBoundary />} />
    </Route>
  ),
  {
    future: {
      v7_startTransition: true
    }
  }
);

function App() {
  return (
    <RouterProvider router={router} fallbackElement={<LoadingSpinner />} />
  );
}

export default App;
