import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Toast from '../../components/Toast';
import { USE_MOCK } from '../../utils/mockData';

const ComplaintForm = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [accusedContact, setAccusedContact] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [toast, setToast] = useState(null);

  // Draft review state
  const [review, setReview] = useState(null);
  const [reviewing, setReviewing] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const navigate = useNavigate();

  const validate = () => {
    const errs = {};

    if (!title.trim()) {
      errs.title = 'Case title is required.';
    }

    if (!description.trim()) {
      errs.description = 'Complaint description is required.';
    } else if (description.trim().length < 50) {
      errs.description = 'Description must be at least 50 characters.';
    }

    if (!accusedContact.trim()) {
      errs.accusedContact = 'Accused party contact is required.';
    }

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 1500)); // simulate AI analysis
        setSuccessData({ caseId: `CASE-2026-${String(Date.now()).slice(-3)}` });
      } else {
        const response = await api.post('/api/v1/cases', {
          title: title.trim(),
          complaintText: description.trim(),
          accusedContact: accusedContact.trim(),
        });

        if (response.data.success) {
          setSuccessData(response.data.case);
        }
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to submit complaint. Please try again.';
      setServerError(message);
      setToast({ message, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    if (field === 'title') setTitle(value);
    if (field === 'description') setDescription(value);
    if (field === 'accusedContact') setAccusedContact(value);

    // Clear field error on change
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const inputClasses =
    'w-full bg-white border border-sky rounded-md px-4 py-2.5 text-body text-navy placeholder:text-slate/50 focus:outline-none focus:ring-2 focus:ring-steel/40 focus:border-steel transition-colors';

  const inputErrorClasses =
    'w-full bg-white border border-red-400 rounded-md px-4 py-2.5 text-body text-navy placeholder:text-slate/50 focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400 transition-colors';

  const charCount = description.length;

  return (
    <div className='min-h-screen bg-ice flex flex-col'>
      {/* Top bar */}
      <header className='w-full bg-white border-b border-sky shadow-sm'>
        <div className='max-w-container mx-auto px-6 h-16 flex items-center justify-between'>
          <span className='text-h3 font-bold text-navy'>LawPoint</span>
        </div>
      </header>

      {/* Centred content */}
      <div className='flex-1 flex items-center justify-center px-4 py-12'>
        {/* ---- SUCCESS CARD ---- */}
        {successData ? (
          <div className='w-full max-w-md bg-green-50 border border-green-200 rounded-lg p-6'>
            {/* Success icon */}
            <div className='flex items-center justify-center mb-4'>
              <div className='w-12 h-12 rounded-full bg-green-100 flex items-center justify-center'>
                <svg className='w-6 h-6 text-green-600' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
                  <path strokeLinecap='round' strokeLinejoin='round' d='M5 13l4 4L19 7' />
                </svg>
              </div>
            </div>

            <h3 className='text-h3 font-semibold text-navy text-center'>
              Complaint Filed Successfully
            </h3>

            <p className='text-caption text-slate mt-1 text-center'>
              Case ID: {successData.caseId}
            </p>

            <p className='text-body text-slate mt-3 text-center'>
              Your complaint has been submitted and is being reviewed by our team.
            </p>

            <div className='mt-6 text-center'>
              <button
                type='button'
                onClick={() => navigate('/dashboard')}
                className='text-steel text-body font-semibold px-4 py-2 rounded-md hover:bg-sky/20 transition-all'
              >
                View My Cases
              </button>
            </div>
          </div>
        ) : (
          /* ---- FORM CARD ---- */
          <div className='w-full max-w-md bg-white rounded-lg shadow-md p-8 border border-sky'>
            <h2 className='text-h2 font-bold text-navy mb-1'>File a Complaint</h2>
            <p className='text-body text-slate mb-6'>
              Describe your complaint. Our AI system will recommend the appropriate court type for admin review.
            </p>

            <form onSubmit={handleSubmit} noValidate>
              {/* Case Title */}
              <div className='mb-4'>
                <label htmlFor='complaint-title' className='block text-body-lg font-semibold text-navy mb-1.5'>
                  Case Title
                </label>
                <input
                  id='complaint-title'
                  type='text'
                  value={title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder='Brief title for your case'
                  className={errors.title ? inputErrorClasses : inputClasses}
                />
                {errors.title && (
                  <p className='text-caption text-red-600 mt-1'>{errors.title}</p>
                )}
              </div>

              {/* Complaint Description */}
              <div className='mb-4'>
                <label htmlFor='complaint-description' className='block text-body-lg font-semibold text-navy mb-1.5'>
                  Complaint Description
                </label>
                <textarea
                  id='complaint-description'
                  value={description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder='Describe your complaint in detail...'
                  rows={5}
                  className={`${errors.description ? inputErrorClasses : inputClasses} min-h-32 resize-none`}
                />
                <p className={`text-caption mt-1 ${charCount < 50 ? 'text-red-600' : 'text-slate'}`}>
                  {charCount} characters (minimum 50)
                </p>
                {errors.description && (
                  <p className='text-caption text-red-600 mt-1'>{errors.description}</p>
                )}

                {/* Check My Complaint button */}
                <button
                  type='button'
                  onClick={async () => {
                    if (!description || description.trim().length < 20) return;
                    setReviewing(true);
                    setReview(null);
                    setReviewError('');
                    try {
                      const res = await api.post('/api/v1/cases/draft-review', { complaintText: description.trim() });
                      setReview(res.data.review);
                    } catch {
                      setReviewError('Could not analyse your complaint. You can still submit.');
                    } finally {
                      setReviewing(false);
                    }
                  }}
                  disabled={reviewing || description.trim().length < 50}
                  className='mt-1 px-4 py-2 bg-sky/30 text-steel border border-sky rounded-md text-caption font-semibold hover:bg-sky/50 disabled:opacity-40 transition-all'
                >
                  {reviewing ? (
                    <span className='flex items-center gap-2'>
                      <span className='w-3 h-3 border-2 border-steel border-t-transparent rounded-full animate-spin inline-block' />
                      Analysing...
                    </span>
                  ) : (
                    '🔍 Check My Complaint'
                  )}
                </button>
                {reviewError && <p className='text-caption text-red-500 mt-1'>{reviewError}</p>}

                {/* Draft Review Feedback Panel */}
                {review && (
                  <div className='mt-3 border border-sky rounded-lg p-4 bg-ice space-y-3'>
                    {/* Score + Grade */}
                    <div className='flex items-center justify-between'>
                      <span className='text-body font-semibold text-navy'>Complaint Quality</span>
                      <div className='flex items-center gap-2'>
                        <span className='text-h3 font-bold text-navy'>{review.score}/100</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-caption font-semibold ${
                          review.grade === 'Strong' ? 'bg-green-100 text-green-800' :
                          review.grade === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>{review.grade}</span>
                      </div>
                    </div>

                    {/* Admin verdict */}
                    <div className={`rounded-md px-3 py-2 text-caption ${
                      review.adminLikelyVerdict === 'Likely to approve' ? 'bg-green-50 text-green-800' :
                      review.adminLikelyVerdict === 'May request changes' ? 'bg-yellow-50 text-yellow-800' :
                      'bg-red-50 text-red-800'
                    }`}>
                      <span className='font-semibold'>{review.adminLikelyVerdict}</span>
                      <span className='ml-1.5 opacity-75'>— {review.verdictReason}</span>
                    </div>

                    {/* Missing elements */}
                    {review.missingElements?.length > 0 && (
                      <div>
                        <p className='text-caption font-semibold text-navy mb-1'>⚠️ What's missing:</p>
                        <ul className='space-y-0.5'>
                          {review.missingElements.map((item, i) => (
                            <li key={i} className='text-caption text-red-700 flex gap-1.5'>
                              <span>•</span><span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Suggestions */}
                    {review.suggestions?.length > 0 && (
                      <div>
                        <p className='text-caption font-semibold text-navy mb-1'>💡 How to improve:</p>
                        <ul className='space-y-0.5'>
                          {review.suggestions.map((tip, i) => (
                            <li key={i} className='text-caption text-steel flex gap-1.5'>
                              <span>→</span><span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <button type='button' onClick={() => setReview(null)} className='text-caption text-slate hover:text-navy transition-colors'>
                      Dismiss
                    </button>
                  </div>
                )}
              </div>

              {/* Accused Party Contact */}
              <div className='mb-6'>
                <label htmlFor='complaint-contact' className='block text-body-lg font-semibold text-navy mb-1.5'>
                  Accused Party Contact (phone or email)
                </label>
                <input
                  id='complaint-contact'
                  type='text'
                  value={accusedContact}
                  onChange={(e) => handleChange('accusedContact', e.target.value)}
                  placeholder='Phone number or email address'
                  className={errors.accusedContact ? inputErrorClasses : inputClasses}
                />
                {errors.accusedContact && (
                  <p className='text-caption text-red-600 mt-1'>{errors.accusedContact}</p>
                )}
              </div>

              {/* Server error */}
              {serverError && (
                <p className='text-caption text-red-600 mb-4'>{serverError}</p>
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
                    Analysing complaint...
                  </span>
                ) : (
                  'Submit Complaint'
                )}
              </button>

              {/* Cancel button */}
              <button
                type='button'
                onClick={() => navigate('/dashboard')}
                disabled={isSubmitting}
                className='w-full mt-2 text-steel text-body font-semibold px-5 py-2.5 rounded-md hover:bg-sky/20 transition-all'
              >
                Cancel
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Toast notification */}
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

export default ComplaintForm;
