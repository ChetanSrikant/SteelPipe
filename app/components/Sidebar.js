"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FiActivity, FiTrendingUp, FiSettings, FiLogOut, FiDatabase, FiBarChart2 } from "react-icons/fi";

export default function Sidebar() {
  const currentPath = usePathname();
  const router = useRouter();

  const navItems = [
    {
      href: "/dashboard",  
      icon: <FiActivity className="text-lg" />,
      label: "Dashboard",
    },
    {
      href: "/overall_dashboard",
      icon: <FiDatabase className="text-lg" />,
      label: "Database Dashboard",
    },
    {
      href: "/data",
      icon: <FiBarChart2 className="text-lg" />,
      label: "Data Analysis",
    },
    {
      href: "/analysis",
      icon: <FiTrendingUp className="text-lg" />,
      label: "AI Analysis",
    },
    {
      href: "/settings",
      icon: <FiSettings className="text-lg" />,
      label: "Settings",
    },
  ];

  const handleLogout = () => {
    console.log('Logging out...');
    localStorage.removeItem('authToken');
    router.push('/login');
  };

  return (
    <div className="w-64 bg-white shadow-sm min-h-screen p-4 border-r border-gray-200">
      {/* Logo/Brand */}
      <div className="flex items-center space-x-2 p-4">
        <div className="h-8 w-8 rounded-full bg-blue-500" />
        <span className="font-bold">Innodatatics</span>
      </div>

      {/* Navigation */}
      <nav className="mt-8 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
              currentPath === item.href || currentPath.startsWith(`${item.href}/`)
                ? "bg-blue-50 text-blue-600"
                : "hover:bg-gray-100 text-gray-700"
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* User Section */}
      <div className="mt-auto pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between p-2">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
              US
            </div>
            <span className="text-sm font-medium">User</span>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 rounded-full hover:bg-gray-100"
            aria-label="Logout"
          >
            <FiLogOut className="text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
}