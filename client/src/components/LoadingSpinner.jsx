/**
 * LoadingSpinner — centred animated spinner using design system tokens.
 */
const LoadingSpinner = () => {
  return (
    <div className='flex items-center justify-center min-h-64'>
      <div className='w-8 h-8 border-4 border-sky border-t-steel rounded-full animate-spin' />
    </div>
  );
};

export default LoadingSpinner;
