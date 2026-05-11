import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatDate } from '../../utils/formatDate';
import api from '../../api/axios';
import { USE_MOCK, MOCK_CASES } from '../../utils/mockData';

const MyCases = () => {
  const [cases, setCases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const fetchCases = async () => {
    setIsLoading(true);
    setError('');

    try {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 600));
        setCases(MOCK_CASES.map(({ caseId, title, status, filedAt }) => ({ caseId, title, status, filedAt })));
      } else {
        const response = await api.get('/api/v1/cases/my/cases');
        if (response.data.success) {
          setCases(response.data.cases);
        }
      }
    } catch (err) {
      setError('Failed to load cases.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  return (
    <div className='flex min-h-screen bg-ice'>
      <Navbar role='citizen' />

      <main className='ml-64 flex-1'>
        {/* Page header */}
        <div className='bg-white border-b border-sky px-8 py-5 flex items-center justify-between'>
          <h1 className='text-h1 font-bold text-navy'>My Cases</h1>
          <button
            type='button'
            onClick={() => navigate('/case/new')}
            className='bg-steel text-white text-body font-semibold px-5 py-2.5 rounded-md shadow-sm hover:bg-navy-mid active:scale-95 transition-all'
          >
            + File New Complaint
          </button>
        </div>

        {/* Page body */}
        <div className='px-8 py-8 max-w-container mx-auto'>
          {/* Loading state */}
          {isLoading && <LoadingSpinner />}

          {/* Error state */}
          {!isLoading && error && (
            <div className='flex flex-col items-center justify-center py-16 text-center'>
              <p className='text-body text-red-600 mb-4'>{error}</p>
              <button
                type='button'
                onClick={fetchCases}
                className='text-steel text-body font-semibold px-4 py-2 rounded-md hover:bg-sky/20 transition-all'
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !error && cases.length === 0 && (
            <div className='flex flex-col items-center justify-center py-16 text-center'>
              <div className='w-12 h-12 rounded-full bg-sky/30 flex items-center justify-center mb-4'>
                {/* File/document icon */}
                <svg className='text-steel w-6 h-6' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={1.5}>
                  <path strokeLinecap='round' strokeLinejoin='round' d='M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z' />
                </svg>
              </div>
              <p className='text-h3 font-semibold text-navy mb-1'>No cases yet</p>
              <p className='text-body text-slate mb-4'>You haven&apos;t filed any complaints.</p>
              <button
                type='button'
                onClick={() => navigate('/case/new')}
                className='bg-steel text-white text-body font-semibold px-5 py-2.5 rounded-md shadow-sm hover:bg-navy-mid active:scale-95 transition-all'
              >
                File Your First Complaint
              </button>
            </div>
          )}

          {/* Cases grid */}
          {!isLoading && !error && cases.length > 0 && (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {cases.map((caseItem) => (
                <div
                  key={caseItem.caseId}
                  onClick={() => navigate(`/case/${caseItem.caseId}`)}
                  className='bg-white rounded-lg border border-sky shadow-sm p-6 hover:shadow-md hover:border-steel/40 transition-all cursor-pointer'
                >
                  {/* Top row: badge + date */}
                  <div className='flex items-center justify-between'>
                    <Badge status={caseItem.status} />
                    <span className='text-caption text-slate'>
                      {formatDate(caseItem.filedAt)}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className='text-h3 font-semibold text-navy mt-3 mb-2 line-clamp-2'>
                    {caseItem.title}
                  </h3>

                  {/* Bottom row: case ID + View button */}
                  <div className='flex items-center justify-between mt-auto'>
                    <span className='text-caption text-slate max-w-[140px] overflow-hidden text-ellipsis whitespace-nowrap'>
                      {caseItem.caseId}
                    </span>
                    <button
                      type='button'
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/case/${caseItem.caseId}`);
                      }}
                      className='border border-steel text-steel text-body font-semibold px-5 py-2.5 rounded-md hover:bg-sky/20 transition-all'
                    >
                      View Case
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MyCases;
