import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { USE_MOCK, MOCK_TOKENS } from '../../utils/mockData';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check for success message from Register page
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear state so it doesn't persist on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // If already logged in, redirect based on role
  useEffect(() => {
    if (user) {
      const redirectMap = {
        citizen: '/dashboard',
        lawyer: '/lawyer/dashboard',
        admin: '/admin/dashboard',
      };
      navigate(redirectMap[user.role] || '/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Basic validation
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      let token;

      if (USE_MOCK) {
        // Mock login: detect role from email keyword, default to citizen
        await new Promise((r) => setTimeout(r, 800)); // simulate delay
        const role = email.includes('lawyer') ? 'lawyer' : email.includes('admin') ? 'admin' : 'citizen';
        token = MOCK_TOKENS[role];
      } else {
        const response = await api.post('/api/v1/auth/login', { email, password });
        if (!response.data.success) throw new Error('Login failed');
        token = response.data.token;
      }

      login(token);

      // Navigate based on role (decoded from token inside login())
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      const redirectMap = {
        citizen: '/dashboard',
        lawyer: '/lawyer/dashboard',
        admin: '/admin/dashboard',
      };
      navigate(redirectMap[payload.role] || '/dashboard', { replace: true });
    } catch (err) {
      const message =
        err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='min-h-screen bg-ice flex flex-col'>
      {/* Top bar */}
      <header className='w-full bg-white border-b border-sky shadow-sm'>
        <div className='px-4 h-16 flex items-center'>
          <Link to='/' className='flex items-center gap-3 no-underline'>
            <img src='/logo.svg' alt='LawPoint' className='w-7 h-7 text-navy' />
            <span className='text-h3 font-bold text-navy'>LawPoint</span>
          </Link>
        </div>
      </header>

      {/* Centred form card */}
      <div className='flex-1 flex items-center justify-center px-4 py-12'>
        <div className='w-full max-w-md bg-white rounded-lg shadow-md p-8 border border-sky'>
          {/* Title */}
          <h2 className='text-h2 font-bold text-navy mb-1'>Sign In</h2>
          <p className='text-body text-slate mb-6'>Welcome back to LawPoint</p>

          {/* Success message from registration */}
          {successMessage && (
            <div className='bg-green-50 border border-green-200 rounded-md px-4 py-3 mb-4'>
              <p className='text-caption text-green-700 font-semibold'>{successMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Email field */}
            <div className='mb-4'>
              <label htmlFor='login-email' className='block text-body-lg font-semibold text-navy mb-1.5'>
                Email
              </label>
              <input
                id='login-email'
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='you@example.com'
                className='w-full bg-white border border-sky rounded-md px-4 py-2.5
                           text-body text-navy placeholder:text-slate/50
                           focus:outline-none focus:ring-2 focus:ring-steel/40
                           focus:border-steel transition-colors'
              />
            </div>

            {/* Password field */}
            <div className='mb-6'>
              <label htmlFor='login-password' className='block text-body-lg font-semibold text-navy mb-1.5'>
                Password
              </label>
              <input
                id='login-password'
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder='Enter your password'
                className='w-full bg-white border border-sky rounded-md px-4 py-2.5
                           text-body text-navy placeholder:text-slate/50
                           focus:outline-none focus:ring-2 focus:ring-steel/40
                           focus:border-steel transition-colors'
              />
            </div>

            {/* Error message */}
            {error && (
              <p className='text-caption text-red-600 mb-4'>{error}</p>
            )}

            {/* Submit button */}
            <button
              type='submit'
              disabled={isSubmitting}
              className={
                isSubmitting
                  ? 'w-full bg-sky text-slate text-body font-semibold px-5 py-2.5 rounded-md cursor-not-allowed opacity-60'
                  : 'w-full bg-steel text-white text-body font-semibold px-5 py-2.5 rounded-md shadow-sm hover:bg-navy-mid active:scale-95 transition-all'
              }
            >
              {isSubmitting ? (
                <span className='flex items-center justify-center gap-2'>
                  <span className='w-4 h-4 border-2 border-slate border-t-white rounded-full animate-spin inline-block' />
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Register link */}
          <div className='mt-6 text-center'>
            <span className='text-body text-slate'>Don't have an account? </span>
            <Link
              to='/register'
              className='text-steel text-body font-semibold px-4 py-2 rounded-md hover:bg-sky/20 transition-all inline-block'
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
