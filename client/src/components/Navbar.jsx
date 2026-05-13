import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Navbar — fixed left sidebar with role-based navigation.
 *
 * Props:
 *   role ('citizen' | 'lawyer' | 'admin') — determines which nav links to show
 */

const navLinks = {
  citizen: [
    { label: 'Dashboard', path: '/dashboard', icon: 'grid' },
    { label: 'File Complaint', path: '/case/new', icon: 'plus' },
    { label: 'My Account', path: '/profile', icon: 'user' },
  ],
  lawyer: [
    { label: 'My Dashboard', path: '/lawyer/dashboard', icon: 'briefcase' },
  ],
  admin: [
    { label: 'Pending Cases', path: '/admin/dashboard', icon: 'clipboard' },
  ],
};

/* Simple inline SVG icons to avoid an external dependency */
const icons = {
  grid: (
    <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={1.5}>
      <path strokeLinecap='round' strokeLinejoin='round' d='M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z' />
    </svg>
  ),
  plus: (
    <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={1.5}>
      <path strokeLinecap='round' strokeLinejoin='round' d='M12 4.5v15m7.5-7.5h-15' />
    </svg>
  ),
  briefcase: (
    <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={1.5}>
      <path strokeLinecap='round' strokeLinejoin='round' d='M20.25 14.15v4.075c0 1.24-1.01 2.25-2.25 2.25H6c-1.24 0-2.25-1.01-2.25-2.25V14.15M16.5 6.75V4.875c0-.621-.504-1.125-1.125-1.125h-6.75c-.621 0-1.125.504-1.125 1.125V6.75m12 0h-15m15 0a2.25 2.25 0 012.25 2.25v1.15' />
    </svg>
  ),
  clipboard: (
    <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={1.5}>
      <path strokeLinecap='round' strokeLinejoin='round' d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' />
    </svg>
  ),
  user: (
    <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={1.5}>
      <path strokeLinecap='round' strokeLinejoin='round' d='M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z' />
    </svg>
  ),
  logout: (
    <svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={1.5}>
      <path strokeLinecap='round' strokeLinejoin='round' d='M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3-3h-9m9 0l-3-3m3 3l-3 3' />
    </svg>
  ),
};

const Navbar = ({ role }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const links = navLinks[role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className='fixed inset-y-0 left-0 w-64 bg-navy flex flex-col shadow-lg z-20'>
      {/* Logo */}
      <div className='px-6 py-5 border-b border-navy-mid'>
        <Link to='/' className='text-h3 font-bold text-white no-underline'>
          LawPoint
        </Link>
      </div>

      {/* Navigation links */}
      <nav className='flex-1 px-4 py-6 space-y-1 overflow-y-auto'>
        {links.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={
                isActive
                  ? 'flex items-center gap-3 px-3 py-2.5 rounded-md text-body font-semibold text-white bg-steel'
                  : 'flex items-center gap-3 px-3 py-2.5 rounded-md text-body text-sky/80 hover:bg-navy-mid hover:text-white transition-colors'
              }
            >
              {icons[link.icon]}
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className='px-4 py-4 border-t border-navy-mid'>
        {user && (
          <span className='text-caption text-sky/70 block mb-2 truncate'>
            {user.name}
          </span>
        )}
        <button
          onClick={handleLogout}
          className='flex items-center gap-2 text-sky/70 text-body font-semibold px-3 py-2 rounded-md hover:bg-navy-mid hover:text-white transition-colors w-full'
        >
          {icons.logout}
          Log out
        </button>
      </div>
    </aside>
  );
};

export default Navbar;
