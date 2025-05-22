import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaChartBar, FaFileAlt, FaGraduationCap, FaUpload, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: <FaChartBar size={20} /> },
    { path: '/admin/templates', label: 'Templates', icon: <FaFileAlt size={20} /> },
    { path: '/admin/seminars', label: 'Seminars', icon: <FaGraduationCap size={20} /> },
    { path: '/admin/upload', label: 'Upload', icon: <FaUpload size={20} /> },
  ];

  return (
    <div className={`bg-gray-800 text-white transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      <div className="p-4 flex items-center justify-between">
        {!isCollapsed && <h2 className="text-xl font-bold">Admin Panel</h2>}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          {isCollapsed ? <FaChevronRight size={16} /> : <FaChevronLeft size={16} />}
        </button>
      </div>
      <nav className="mt-4">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center px-4 py-3 transition-colors ${
              isActive(item.path)
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            {!isCollapsed && (
              <span className="ml-3">{item.label}</span>
            )}
          </Link>
        ))}
      </nav>
    </div>
  );
}
