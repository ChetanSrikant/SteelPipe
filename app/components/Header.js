"use client";

import { usePathname, useRouter } from 'next/navigation';
import { FiSettings, FiLogOut } from 'react-icons/fi';
import { useState } from 'react';

export default function Header() {
  const currentPath = usePathname();
  const router = useRouter();

  // Map routes to page titles
  const pageTitles = {
    '/Dashboard': 'Dashboard Overview',
    '/analysis': 'Pipe Sales Analysis',
    '/settings': 'Account Settings',
  };

  // Get the current page title or fallback
  const currentTitle = pageTitles[currentPath] || 'Innodatatics Portal';

  const handleLogout = () => {
    // Add your actual logout logic here
    console.log('Logging out...');
    // Example: Clear auth token, user data, etc.
    localStorage.removeItem('authToken');
    // Redirect to login page
    router.push('/login');
  };

  const toggleSettings = () => {
    router.push('/settings');
  };



  return (
    <div className="sticky top-0 z-10 bg-gray-50 p-8 pb-6 border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          {currentTitle}
        </h1>
        <div className="flex items-center space-x-4 relative">

          <div>
            <button 
              onClick={toggleSettings}
              className="p-2 rounded-full bg-white border border-gray-300 hover:bg-gray-100 transition-colors dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600"
              aria-label="Settings"
            >
              <FiSettings className="text-gray-600 dark:text-gray-300" />
            </button>
            
          </div>

          {/* User Profile */}
          <div 
            className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white cursor-pointer"
            aria-label="User profile"
          >
            US
          </div>

          {/* Logout Button */}
          <button 
            onClick={handleLogout}
            className="p-2 rounded-full bg-white border border-gray-300 hover:bg-gray-100 transition-colors dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600"
            aria-label="Logout"
          >
            <FiLogOut className="text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>
    </div>
  );
}