import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const Register = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Clear field error on change
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  /**
   * Client-side validation.
   * Returns an object of field-level errors (empty object = valid).
   */
  const validate = () => {
    const errs = {};

    if (!form.name.trim()) {
      errs.name = 'Full name is required.';
    }

    if (!form.email.trim()) {
      errs.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Please enter a valid email address.';
    }

    if (!form.password) {
      errs.password = 'Password is required.';
    } else if (form.password.length < 8) {
      errs.password = 'Password must be at least 8 characters.';
    }

    if (!form.phone.trim()) {
      errs.phone = 'Phone number is required.';
    } else if (!/^\d+$/.test(form.phone.trim())) {
      errs.phone = 'Phone number must contain digits only.';
    }

    if (!form.address.trim()) {
      errs.address = 'Address is required.';
    }

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    // Validate
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const response = await api.post('/api/v1/auth/register', {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim(),
        address: form.address.trim(),
        role: 'citizen',   // public registration is always citizen
      });

      if (response.data.success) {
        navigate('/login', {
          state: { message: 'Account created successfully! Please sign in.' },
        });
      }
    } catch (err) {
      const data = err.response?.data;

      if (data?.errors && typeof data.errors === 'object') {
        // Server returned field-level errors
        setErrors(data.errors);
      } else {
        setServerError(data?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  /* Reusable input classes */
  const inputClasses =
    'w-full bg-white border border-sky rounded-md px-4 py-2.5 text-body text-navy placeholder:text-slate/50 focus:outline-none focus:ring-2 focus:ring-steel/40 focus:border-steel transition-colors';

  const inputErrorClasses =
    'w-full bg-white border border-red-400 rounded-md px-4 py-2.5 text-body text-navy placeholder:text-slate/50 focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400 transition-colors';

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
          <h2 className='text-h2 font-bold text-navy mb-1'>Create Account</h2>
          <p className='text-body text-slate mb-6'>Join LawPoint to file and track cases</p>

          {/* Server-level error */}
          {serverError && (
            <p className='text-caption text-red-600 mb-4'>{serverError}</p>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Full Name */}
            <div className='mb-4'>
              <label htmlFor='register-name' className='block text-body-lg font-semibold text-navy mb-1.5'>
                Full Name
              </label>
              <input
                id='register-name'
                type='text'
                name='name'
                value={form.name}
                onChange={handleChange}
                placeholder='John Doe'
                className={errors.name ? inputErrorClasses : inputClasses}
              />
              {errors.name && (
                <p className='text-caption text-red-600 mt-1'>{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div className='mb-4'>
              <label htmlFor='register-email' className='block text-body-lg font-semibold text-navy mb-1.5'>
                Email
              </label>
              <input
                id='register-email'
                type='email'
                name='email'
                value={form.email}
                onChange={handleChange}
                placeholder='you@example.com'
                className={errors.email ? inputErrorClasses : inputClasses}
              />
              {errors.email && (
                <p className='text-caption text-red-600 mt-1'>{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className='mb-4'>
              <label htmlFor='register-password' className='block text-body-lg font-semibold text-navy mb-1.5'>
                Password
              </label>
              <input
                id='register-password'
                type='password'
                name='password'
                value={form.password}
                onChange={handleChange}
                placeholder='Minimum 8 characters'
                className={errors.password ? inputErrorClasses : inputClasses}
              />
              {errors.password && (
                <p className='text-caption text-red-600 mt-1'>{errors.password}</p>
              )}
            </div>

            {/* Phone */}
            <div className='mb-4'>
              <label htmlFor='register-phone' className='block text-body-lg font-semibold text-navy mb-1.5'>
                Phone
              </label>
              <input
                id='register-phone'
                type='tel'
                name='phone'
                value={form.phone}
                onChange={handleChange}
                placeholder='9876543210'
                className={errors.phone ? inputErrorClasses : inputClasses}
              />
              {errors.phone && (
                <p className='text-caption text-red-600 mt-1'>{errors.phone}</p>
              )}
            </div>

            {/* Address */}
            <div className='mb-6'>
              <label htmlFor='register-address' className='block text-body-lg font-semibold text-navy mb-1.5'>
                Address
              </label>
              <textarea
                id='register-address'
                name='address'
                rows={2}
                value={form.address}
                onChange={handleChange}
                placeholder='Your address'
                className={`${errors.address ? inputErrorClasses : inputClasses} resize-none`}
              />
              {errors.address && (
                <p className='text-caption text-red-600 mt-1'>{errors.address}</p>
              )}
            </div>

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
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Login link */}
          <div className='mt-6 text-center'>
            <span className='text-body text-slate'>Already have an account? </span>
            <Link
              to='/login'
              className='text-steel text-body font-semibold px-4 py-2 rounded-md hover:bg-sky/20 transition-all inline-block'
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
