export default function LoadingSpinner({ fullPage = false }) {
  const spinner = (
    <div className="w-8 h-8 border-4 border-sky border-t-steel rounded-full animate-spin" />
  );

  if (fullPage) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-ice">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-64">
      {spinner}
    </div>
  );
}
