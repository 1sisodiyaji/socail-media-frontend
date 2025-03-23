import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { authService, userService } from '../services';

const Layout = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await userService.getMyProfile();
        setUser(userData);
      } catch (error) {
        console.error('Error loading user:', error);
      }
    };

    if (authService.isAuthenticated()) {
      loadUser();
    }
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const closeMenu = () => setIsOpen(false);

  const navItems = [
    { path: '/', label: 'Feed', icon: '🏠' },
    { path: '/create', label: 'Create Post', icon: '✏️' },
    { path: `/profile/${user?.id}`, label: 'Profile', icon: '👤' },
  ];

  return (
    <div className="min-h-screen bg-gray-900">  
      <main className="pt-4 min-h-screen">
        <div className="animate-fade-in">{children}</div>
      </main>
    </div>
  );
};

export default Layout; 