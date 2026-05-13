import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Toast from '../../components/Toast';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // Form state
  const [form, setForm] = useState({ name: '', phone: '', address: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/api/v1/auth/me');
        if (res.data.success) {
          setProfile(res.data.user);
          setForm({
            name: res.data.user.name || '',
            phone: res.data.user.phone || '',
            address: res.data.user.address || '',
          });
        }
      } catch {
        setToast({ message: 'Failed to load profile', type: 'error' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await api.patch('/api/v1/auth/me', {
        name: form.name,
        phone: form.phone,
        address: form.address,
      });
      if (res.data.success) {
        setProfile(res.data.user);
        setIsEditing(false);
        setToast({ message: 'Profile updated successfully!', type: 'success' });
      }
    } catch {
      setToast({ message: 'Failed to update profile', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({
      name: profile?.name || '',
      phone: profile?.phone || '',
      address: profile?.address || '',
    });
    setIsEditing(false);
  };

  const inputClasses =
    'w-full bg-white border border-sky rounded-md px-4 py-2.5 text-body text-navy placeholder:text-slate/50 focus:outline-none focus:ring-2 focus:ring-steel/40 focus:border-steel transition-colors';

  const readOnlyClasses =
    'w-full bg-ice border border-sky rounded-md px-4 py-2.5 text-body text-navy cursor-default';

  return (
    <div className='flex min-h-screen bg-ice'>
      <Navbar role='citizen' />

      <main className='ml-64 flex-1'>
        {/* Header */}
        <div className='bg-white border-b border-sky px-8 py-5'>
          <h1 className='text-h1 font-bold text-navy'>My Account</h1>
          <p className='text-body text-slate mt-1'>View and manage your profile details</p>
        </div>

        <div className='px-8 py-8 max-w-2xl'>
          {isLoading && <LoadingSpinner />}

          {!isLoading && profile && (
            <div className='bg-white rounded-lg border border-sky shadow-sm p-6 space-y-5'>
              {/* Avatar area */}
              <div className='flex items-center gap-4 pb-4 border-b border-sky/50'>
                <div className='w-16 h-16 rounded-full bg-navy flex items-center justify-center'>
                  <span className='text-h2 font-bold text-white'>
                    {profile.name?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                </div>
                <div>
                  <p className='text-h3 font-semibold text-navy'>{profile.name}</p>
                  <p className='text-caption text-slate capitalize'>{profile.role} account</p>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className='block text-body-lg font-semibold text-navy mb-1.5'>Full Name</label>
                {isEditing ? (
                  <input
                    type='text'
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={inputClasses}
                  />
                ) : (
                  <div className={readOnlyClasses}>{profile.name}</div>
                )}
              </div>

              {/* Email (read-only always) */}
              <div>
                <label className='block text-body-lg font-semibold text-navy mb-1.5'>Email</label>
                <div className={readOnlyClasses}>{profile.email}</div>
                {isEditing && (
                  <p className='text-caption text-slate/70 mt-1'>Email cannot be changed.</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className='block text-body-lg font-semibold text-navy mb-1.5'>Phone</label>
                {isEditing ? (
                  <input
                    type='tel'
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className={inputClasses}
                    placeholder='Your phone number'
                  />
                ) : (
                  <div className={readOnlyClasses}>{profile.phone || '—'}</div>
                )}
              </div>

              {/* Address */}
              <div>
                <label className='block text-body-lg font-semibold text-navy mb-1.5'>Address</label>
                {isEditing ? (
                  <textarea
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className={`${inputClasses} resize-none`}
                    rows={2}
                    placeholder='Your address'
                  />
                ) : (
                  <div className={readOnlyClasses}>{profile.address || '—'}</div>
                )}
              </div>

              {/* Action buttons */}
              <div className='pt-4 border-t border-sky/50 flex gap-3'>
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className={
                        isSaving
                          ? 'bg-sky text-slate text-body font-semibold px-5 py-2.5 rounded-md cursor-not-allowed opacity-60'
                          : 'bg-steel text-white text-body font-semibold px-5 py-2.5 rounded-md shadow-sm hover:bg-navy-mid active:scale-95 transition-all'
                      }
                    >
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={isSaving}
                      className='text-steel text-body font-semibold px-5 py-2.5 rounded-md hover:bg-sky/20 transition-all'
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className='bg-steel text-white text-body font-semibold px-5 py-2.5 rounded-md shadow-sm hover:bg-navy-mid active:scale-95 transition-all'
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Profile;
