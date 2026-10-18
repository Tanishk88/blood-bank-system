import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Layers, 
  Users, 
  GitPullRequest, 
  BarChart3, 
  CloudRain, 
  ShieldCheck,
  Server
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Blood Inventory', path: '/inventory', icon: Layers },
    { name: 'Donors & Donations', path: '/donors', icon: Users },
    { name: 'Blood Requests', path: '/requests', icon: GitPullRequest },
    { name: 'Analytics & Insights', path: '/analytics', icon: BarChart3 },
    { name: 'Cloud Deployment', path: '/cloud-deploy', icon: Server },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-[calc(100vh-4rem)] flex flex-col justify-between p-4 hidden md:flex shrink-0">
      <div>
        <div className="px-3 py-2 mb-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Management</p>
        </div>

        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Cloud & System Status Badge */}
      <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700/60">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>System Online</span>
        </div>
        <p className="text-xs text-slate-400">Environment: <span className="text-slate-200 capitalize">{user?.role || 'User'}</span></p>
        <p className="text-xs text-slate-400 mt-0.5">Target: <span className="text-sky-300 font-mono">AWS / GCP Container</span></p>
      </div>
    </aside>
  );
};

export default Sidebar;
