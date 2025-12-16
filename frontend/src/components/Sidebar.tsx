/**
 * Reusable Sidebar Component
 * Hover-expandable sidebar for navigation
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Folder,
  Database,
  ShoppingBag,
  Settings,
  BarChart3,
} from 'lucide-react';
import clsx from 'clsx';
import { useUserStore } from '../stores/userStore';

interface SidebarItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  expanded: boolean;
  active?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon: Icon, label, onClick, expanded, active = false }) => {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors mb-1',
        active
          ? 'bg-slate-800 text-white'
          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
      )}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <motion.span
        className="text-sm font-medium whitespace-nowrap"
        animate={{
          opacity: expanded ? 1 : 0,
          width: expanded ? 'auto' : 0,
        }}
        transition={{ duration: 0.1, ease: 'easeOut' }}
      >
        {label}
      </motion.span>
    </button>
  );
};

interface SidebarProps {
  activePage?: 'home' | 'data' | 'store' | 'settings' | 'profile' | 'usage';
}

const Sidebar: React.FC<SidebarProps> = ({ activePage = 'home' }) => {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const [sidebarHovered, setSidebarHovered] = useState(false);

  const getInitials = (name: string | undefined) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <motion.aside
      onMouseEnter={() => setSidebarHovered(true)}
      onMouseLeave={() => setSidebarHovered(false)}
      className="fixed left-0 top-0 h-full bg-slate-900 border-r border-slate-800 z-20"
      animate={{
        width: sidebarHovered ? '240px' : '64px',
      }}
      transition={{ duration: 0.1, ease: 'easeOut' }}
    >
      <div className="flex flex-col h-full py-4">
        {/* Logo */}
        <div className="px-4 mb-6">
          <div className="flex items-center gap-3 overflow-hidden">
            <img src="/EyelogoWhite.png" alt="SPECTR SYSTEM" className="h-8 w-auto flex-shrink-0" />
            <motion.span
              className="text-white font-semibold text-sm whitespace-nowrap"
              animate={{
                opacity: sidebarHovered ? 1 : 0,
                width: sidebarHovered ? 'auto' : 0,
              }}
              transition={{ duration: 0.1, ease: 'easeOut' }}
            >
              SPECTR
            </motion.span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-2">
          <SidebarItem
            icon={Folder}
            label="Home"
            active={activePage === 'home'}
            onClick={() => navigate('/home')}
            expanded={sidebarHovered}
          />
          <SidebarItem
            icon={Database}
            label="My data"
            active={activePage === 'data'}
            onClick={() => navigate('/data')}
            expanded={sidebarHovered}
          />
          <SidebarItem
            icon={ShoppingBag}
            label="Store"
            active={activePage === 'store'}
            onClick={() => navigate('/store')}
            expanded={sidebarHovered}
          />
          <SidebarItem
            icon={BarChart3}
            label="Usage"
            active={activePage === 'usage'}
            onClick={() => navigate('/usage')}
            expanded={sidebarHovered}
          />
        </nav>

        {/* Bottom Section */}
        <div className="px-2 border-t border-slate-800 pt-4">
          <SidebarItem
            icon={Settings}
            label="Settings"
            active={activePage === 'settings'}
            onClick={() => navigate('/settings')}
            expanded={sidebarHovered}
          />
          
          {/* Profile Picture */}
          {user && (
            <button
              onClick={() => navigate('/profile')}
              className={clsx(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors mb-1',
                activePage === 'profile'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )}
            >
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name || 'User'}
                  className="w-8 h-8 rounded-full flex-shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-slate-700 text-white text-xs font-medium flex items-center justify-center flex-shrink-0">
                  {getInitials(user?.name)}
                </div>
              )}
              <motion.span
                className="text-sm font-medium text-white whitespace-nowrap"
                animate={{
                  opacity: sidebarHovered ? 1 : 0,
                  width: sidebarHovered ? 'auto' : 0,
                }}
                transition={{ duration: 0.1, ease: 'easeOut' }}
              >
                {user.name || 'Profile'}
              </motion.span>
            </button>
          )}
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
