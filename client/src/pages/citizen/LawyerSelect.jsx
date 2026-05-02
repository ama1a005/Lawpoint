import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import Toast from '../../components/Toast';
import api from '../../api/axios';
import { USE_MOCK, MOCK_CASES, MOCK_LAWYERS } from '../../utils/mockData';

const LawyerSelect = () => {
  const { id: caseId } = useParams();
  const navigate = useNavigate();

  const [lawyers, setLawyers] = useState([]);
  const [courtType, setCourtType] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal state
  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Toast state
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError('');

      try {
        if (USE_MOCK) {
          await new Promise((r) => setTimeout(r, 600));
          const mockCase = MOCK_CASES.find((c) => c.caseId === caseId) || MOCK_CASES[0];
          const cType = mockCase.courtType || 'civil';
          setCourtType(cType);
          setLawyers(MOCK_LAWYERS.filter((l) => l.courtType === cType));
        } else {
          const caseRes = await api.get(`/api/v1/cases/${caseId}`);
          if (!caseRes.data.success) throw new Error('Failed to load case.');

          const cType = caseRes.data.case.courtType;
          setCourtType(cType);

          const lawyerRes = await api.get(`/api/v1/lawyers`, {
            params: { courtType: cType },
          });

          if (lawyerRes.data.success) {
            setLawyers(lawyerRes.data.lawyers);
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load lawyers.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [caseId]);

  const handleRequestClick = (lawyer) => {
    setSelectedLawyer(lawyer);
    setIsModalOpen(true);
  };

  const handleConfirmRequest = async () => {
    if (!selectedLawyer) return;

    setIsSending(true);

    try {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 800));
        setIsModalOpen(false);
        setToast({ message: 'Request sent!', type: 'success' });
        setTimeout(() => navigate(`/case/${caseId}`), 1500);
      } else {
        const response = await api.post('/api/v1/lawyers/request', {
          caseId,
          lawyerId: selectedLawyer.lawyerId,
        });

        if (response.data.success) {
          setIsModalOpen(false);
          setToast({ message: 'Request sent!', type: 'success' });
          setTimeout(() => navigate(`/case/${caseId}`), 1500);
        }
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to send request.';
      setToast({ message, type: 'error' });
      setIsModalOpen(false);
    } finally {
      setIsSending(false);
    }
  };

  const handleCancelModal = () => {
    if (!isSending) {
      setIsModalOpen(false);
      setSelectedLawyer(null);
    }
  };

  return (
    <div className='flex min-h-screen bg-ice'>
      <Navbar role='citizen' />

      <main className='ml-64 flex-1'>
        {/* Page header */}
        <div className='bg-white border-b border-sky px-8 py-5'>
          <h1 className='text-h1 font-bold text-navy'>Select a Lawyer</h1>
          {courtType && (
            <p className='text-body text-slate mt-1'>
              Lawyers available for {courtType} court.
            </p>
          )}
        </div>

        {/* Page body */}
        <div className='px-8 py-8 max-w-container mx-auto'>
          {/* Loading */}
          {isLoading && <LoadingSpinner />}

          {/* Error */}
          {!isLoading && error && (
            <div className='flex flex-col items-center justify-center py-16 text-center'>
              <p className='text-body text-red-600 mb-4'>{error}</p>
              <button
                type='button'
                onClick={() => navigate(`/case/${caseId}`)}
                className='text-steel text-body font-semibold px-4 py-2 rounded-md hover:bg-sky/20 transition-all'
              >
                Back to Case
              </button>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !error && lawyers.length === 0 && (
            <div className='flex flex-col items-center justify-center py-16 text-center'>
              <div className='w-12 h-12 rounded-full bg-sky/30 flex items-center justify-center mb-4'>
                {/* Users icon */}
                <svg className='text-steel w-6 h-6' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={1.5}>
                  <path strokeLinecap='round' strokeLinejoin='round' d='M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z' />
                </svg>
              </div>
              <p className='text-h3 font-semibold text-navy mb-1'>No lawyers available</p>
              <p className='text-body text-slate mb-4'>
                There are no available lawyers for this court type at this time.
              </p>
              <button
                type='button'
                onClick={() => navigate(`/case/${caseId}`)}
                className='text-steel text-body font-semibold px-4 py-2 rounded-md hover:bg-sky/20 transition-all'
              >
                Back to Case
              </button>
            </div>
          )}

          {/* Lawyer cards grid */}
          {!isLoading && !error && lawyers.length > 0 && (
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              {lawyers.map((lawyer) => (
                <div
                  key={lawyer.lawyerId}
                  className='bg-white rounded-lg border border-sky shadow-sm p-5'
                >
                  {/* Top: name + court badge */}
                  <div className='flex items-start justify-between mb-3'>
                    <h3 className='text-h3 font-semibold text-navy'>{lawyer.name}</h3>
                    <Badge status={lawyer.courtType} />
                  </div>

                  {/* Middle: details */}
                  <p className='text-body text-slate'>Bar ID: {lawyer.barId}</p>
                  <p className='text-body text-slate mb-4'>{lawyer.specialisation}</p>

                  {/* Bottom: action button */}
                  {lawyer.isAvailable ? (
                    <button
                      type='button'
                      onClick={() => handleRequestClick(lawyer)}
                      className='w-full bg-steel text-white text-body font-semibold px-5 py-2.5 rounded-md shadow-sm hover:bg-navy-mid active:scale-95 transition-all'
                    >
                      Request Lawyer
                    </button>
                  ) : (
                    <button
                      type='button'
                      disabled
                      className='w-full bg-sky text-slate text-body font-semibold px-5 py-2.5 rounded-md cursor-not-allowed opacity-60'
                    >
                      Unavailable
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Confirmation modal */}
      <Modal
        isOpen={isModalOpen}
        title='Send Request?'
        message={selectedLawyer ? `Send a case request to ${selectedLawyer.name}?` : ''}
        confirmLabel={isSending ? 'Sending...' : 'Send Request'}
        onConfirm={handleConfirmRequest}
        onCancel={handleCancelModal}
      />

      {/* Toast */}
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

export default LawyerSelect;
