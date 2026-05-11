import { Link } from 'react-router-dom';

const NotFound = () => {
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
          {/* 404 icon */}
          <div className='flex items-center justify-center mb-4'>
            <div className='w-16 h-16 rounded-full bg-sky/30 flex items-center justify-center'>
              <svg className='text-steel w-8 h-8' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={1.5}>
                <path strokeLinecap='round' strokeLinejoin='round' d='M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z' />
              </svg>
            </div>
          </div>

          <h2 className='text-h2 font-bold text-navy mb-2'>404 — Page Not Found</h2>
          <p className='text-body text-slate mb-6'>
            The page you're looking for doesn't exist or has been moved.
          </p>

          <Link
            to='/login'
            className='text-steel text-body font-semibold px-4 py-2 rounded-md hover:bg-sky/20 transition-all inline-block'
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
