import React from 'react';
import { BarChart3, ImageIcon, Users, Eye, FileText, Menu, Lock, LogOut } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

type SidebarProps = {
  view: string;
  setView: (view: string) => void;
  user: User;
  onSignOut: () => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  isAdmin: boolean;
};

export const Sidebar: React.FC<SidebarProps> = ({ view, setView, user, onSignOut, open, setOpen, isAdmin }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'inventory', label: 'Inventory', icon: ImageIcon },
    { id: 'clients', label: 'Clients', icon: Users, adminOnly: true },
    { id: 'gallery', label: 'Gallery', icon: Eye },
    { id: 'reports', label: 'Reports', icon: FileText }
  ];

  return (
    <div className={`${open ? 'w-64' : 'w-20'} bg-gradient-to-b from-slate-100 to-slate-200 text-gray-800 transition-all flex flex-col`}>
      <div className="p-6 border-b border-slate-300">
        {open ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <img src="/Curated Final Logo.png" alt="Curated Capital Group" className="h-12 w-auto" />
              <button onClick={() => setOpen(!open)} className="text-gray-700 hover:text-gray-900">
                <Menu className="w-6 h-6" />
              </button>
            </div>
            <div className="text-center">
              <h1 className="text-lg font-bold leading-tight">Art Manager</h1>
            </div>
          </div>
        ) : (
          <button onClick={() => setOpen(!open)} className="text-gray-700 hover:text-gray-900 w-full flex justify-center">
            <Menu className="w-6 h-6" />
          </button>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map(item => {
          if (item.adminOnly && !isAdmin) return null;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                view === item.id ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-slate-300'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {open && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-300">
        <div className="flex items-center gap-3 px-4 py-3 text-gray-700">
          <Lock className="w-5 h-5" />
          {open && (
            <div className="flex-1">
              <div className="text-sm font-semibold">{user.email?.split('@')[0]}</div>
              <div className="text-xs text-gray-600">{isAdmin ? 'Admin' : 'Client'}</div>
            </div>
          )}
        </div>
        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-slate-300 transition"
        >
          <LogOut className="w-5 h-5" />
          {open && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};
