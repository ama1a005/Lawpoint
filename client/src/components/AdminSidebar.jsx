import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_LINKS = [
  {
    to: '/admin/dashboard',
    label: 'Pending Cases',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
];

export default function AdminSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-navy flex flex-col shadow-lg z-20">
      {/* Logo area */}
      <div className="px-6 py-5 border-b border-navy-mid">
        <span className="text-h3 font-bold text-white">LawPoint</span>
        <p className="text-caption text-sky/60 mt-0.5">Admin Portal</p>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {NAV_LINKS.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              isActive
                ? 'flex items-center gap-3 px-3 py-2.5 rounded-md text-body font-semibold text-white bg-steel'
                : 'flex items-center gap-3 px-3 py-2.5 rounded-md text-body text-sky/80 hover:bg-navy-mid hover:text-white transition-colors'
            }
          >
            {icon}
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-4 py-4 border-t border-navy-mid">
        <p className="text-caption text-sky/70 mb-3 truncate">{user?.name || 'Admin'}</p>
        <button
          onClick={handleLogout}
          className="text-steel text-body font-semibold px-4 py-2 rounded-md hover:bg-sky/20 transition-all w-full text-left text-sm"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
