import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Forbidden = () => {
  const { user } = useAuth();

  // Redirect map for the user's actual role
  const homeMap = {
    citizen: '/dashboard',
    lawyer: '/lawyer/dashboard',
    admin: '/admin/dashboard',
  };
  const homePath = user ? homeMap[user.role] || '/login' : '/login';

  return (
    <div className='min-h-screen bg-ice flex flex-col'>
      {/* Top bar */}
      <header className='w-full bg-white border-b border-sky shadow-sm'>
        <div className='max-w-container mx-auto px-6 h-16 flex items-center'>
          <span className='text-h3 font-bold text-navy'>LawPoint</span>
        </div>
      </header>

      {/* Centred card */}
      <div className='flex-1 flex items-center justify-center px-4'>
        <div className='bg-white rounded-lg shadow-md p-8 border border-sky w-full max-w-md text-center'>
          {/* 403 icon */}
          <div className='flex items-center justify-center mb-4'>
            <div className='w-16 h-16 rounded-full bg-sky/30 flex items-center justify-center'>
              <svg className='text-steel w-8 h-8' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={1.5}>
                <path strokeLinecap='round' strokeLinejoin='round' d='M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 115.636 5.636m12.728 12.728L5.636 5.636' />
              </svg>
            </div>
          </div>

          <h2 className='text-h2 font-bold text-navy mb-2'>403 — Access Denied</h2>
          <p className='text-body text-slate mb-6'>
            You don't have permission to access this page.
          </p>

          <Link
            to={homePath}
            className='bg-steel text-white text-body font-semibold px-5 py-2.5 rounded-md shadow-sm hover:bg-navy-mid active:scale-95 transition-all inline-block'
          >
            Go to My Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Forbidden;
