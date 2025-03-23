import React from 'react';
import { motion } from 'framer-motion';

const ProfileTabs = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'posts', label: 'Posts' },
    { id: 'about', label: 'About' },
  ];

  return (
    <div className="border-b border-gray-700">
      <nav className="flex space-x-8" aria-label="Tabs">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onTabChange(tab.id)}
            className={`
              relative py-4 px-1 text-sm font-medium transition-colors duration-200
              ${activeTab === tab.id
                ? 'text-red-500 border-b-2 border-red-500'
                : 'text-gray-400 hover:text-gray-300'
              }
            `}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500"
                initial={false}
              />
            )}
          </motion.button>
        ))}
      </nav>
    </div>
  );
};

export default ProfileTabs; 