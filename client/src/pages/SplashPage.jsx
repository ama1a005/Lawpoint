import { useNavigate } from 'react-router-dom';

/**
 * SplashPage — Government-style landing page for the LawPoint portal.
 * Clicking "Go to LawPoint" routes to /login.
 */
const SplashPage = () => {
  const navigate = useNavigate();

  return (
    <div className='min-h-screen flex flex-col bg-[#f7f9fb] text-[#191c1e]' style={{ fontFamily: "'Public Sans', sans-serif" }}>
      {/* TopAppBar */}
      <header className='w-full sticky top-0 bg-[#f7f9fb] border-b border-[#c5c6d0] z-50'>
        <div className='flex justify-between items-center max-w-7xl mx-auto px-4 md:px-10 w-full h-20'>
          <div className='flex items-center gap-4'>
            <img
              alt='LawPoint Logo'
              className='h-10 w-10 object-contain'
              src='https://lh3.googleusercontent.com/aida-public/AB6AXuDTMKcir6K9iCqMUOSF8dUwO-xg3_rPdKT5U528vcqfuqcDjrFkcO4ov9RsFTuN02XsKN2Ee1wEdKIiA91HCqvtf5e3AGhdYi9wmKTKWFIecee7YhkqHpSyQ-k1QbBqKeQU7F-YYNPNqB-ICb_8dJ2py95KUlzx_WylCRa8zz6B8rKN478TR2WgbndrfLF13266Zi4fWnnn2dXis131iJDWen__0M0cfoAPFJLbwBoQgrWoI3YIoYkUzfzq1EC9DCMAGeryOyiQMmZf'
            />
            <h1 className='text-2xl font-bold text-[#102758]'>LawPoint</h1>
          </div>
          <nav className='hidden md:flex gap-8 items-center'>
            <span className='text-[#102758] font-bold border-b-2 border-[#102758] cursor-default'>Home</span>
          </nav>
        </div>
      </header>

      <main className='flex-grow flex flex-col items-center'>
        {/* Hero Section */}
        <section className='relative w-full overflow-hidden bg-[#f7f9fb] flex items-center justify-center py-20 md:py-32'>
          {/* Dot pattern */}
          <div
            className='absolute inset-0 opacity-40'
            style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, #e2e8f0 1px, transparent 0)',
              backgroundSize: '24px 24px',
            }}
          />
          <div className='absolute inset-0 bg-gradient-to-b from-transparent to-[#f2f4f6]/30' />

          <div className='relative z-10 max-w-4xl px-4 text-center flex flex-col items-center'>
            {/* Badge */}
            <div className='mb-4 px-4 py-1 rounded-full bg-[#dce0e6] text-[#5e6368] text-xs font-semibold uppercase tracking-widest flex items-center gap-2'>
              <span className='material-symbols-outlined text-sm'>verified</span>
              Official Government Resource
            </div>

            {/* Title */}
            <h2 className='text-3xl md:text-5xl font-bold text-[#102758] mb-4 leading-tight'>
              Justice for All. <br className='hidden md:block' />
              <span className='text-[#5a5f64]'>Simplified.</span>
            </h2>

            {/* Subtitle */}
            <p className='text-lg text-[#44464f] max-w-2xl mb-8'>
              Empowering citizens with direct access to comprehensive legal information, case filing systems, and institutional guidance through a secure, modern portal.
            </p>

            {/* CTA */}
            <button
              onClick={() => navigate('/login')}
              className='bg-[#102758] text-white px-10 py-4 rounded-lg text-xl font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center gap-4 group'
            >
              Go to LawPoint
              <span className='material-symbols-outlined group-hover:translate-x-1 transition-transform'>arrow_forward</span>
            </button>

            {/* Trust indicator */}
            <div className='mt-16 border-t border-[#c5c6d0] pt-8 flex justify-center'>
              <div className='flex flex-col items-center'>
                <span className='text-3xl font-bold text-[#102758]'>24/7</span>
                <span className='text-xs font-semibold text-[#5a5f64] uppercase'>Institutional Support</span>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className='max-w-7xl mx-auto px-4 md:px-10 py-20 w-full'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            {/* Large card */}
            <div className='md:col-span-2 bg-white border border-[#c5c6d0] p-8 rounded-xl flex flex-col justify-between hover:shadow-md transition-shadow'>
              <div>
                <div className='w-12 h-12 bg-[#293e6f] rounded flex items-center justify-center mb-4'>
                  <span className='material-symbols-outlined text-[#dae2ff]'>gavel</span>
                </div>
                <h3 className='text-xl font-semibold text-[#102758] mb-2'>Legal Documentation Hub</h3>
                <p className='text-[#44464f] mb-6'>Access the most up-to-date legal statutes, governmental decrees, and official documentation within a searchable cloud infrastructure.</p>
              </div>
              <div className='flex flex-wrap gap-2'>
                <span className='px-3 py-1 bg-[#eceef0] rounded-full text-xs font-semibold'>Digital Statutes</span>
                <span className='px-3 py-1 bg-[#eceef0] rounded-full text-xs font-semibold'>Case Archives</span>
                <span className='px-3 py-1 bg-[#eceef0] rounded-full text-xs font-semibold'>Forms</span>
              </div>
            </div>

            {/* Dark card */}
            <div className='bg-[#102758] text-white p-8 rounded-xl flex flex-col justify-between hover:shadow-lg transition-all'>
              <div>
                <span className='material-symbols-outlined text-[#dae2ff] mb-4 text-3xl'>shield</span>
                <h3 className='text-xl font-semibold mb-2'>Verified Identity</h3>
                <p className='text-[#b1c5ff] text-base'>Connect your official digital ID for seamless filing and secure document retrieval.</p>
              </div>
            </div>

            {/* Third card */}
            <div className='bg-white border border-[#c5c6d0] p-8 rounded-xl hover:shadow-md transition-shadow'>
              <span className='material-symbols-outlined text-[#5a5f64] mb-4 text-3xl'>account_balance</span>
              <h3 className='text-xl font-semibold text-[#102758] mb-2'>Institutional Stability</h3>
              <p className='text-[#44464f] text-base'>Backed by the national justice system to ensure every interaction is legally binding and protected.</p>
            </div>

            {/* Image card */}
            <div className='md:col-span-2 relative overflow-hidden bg-[#eceef0] rounded-xl min-h-[300px]'>
              <div className='absolute inset-0 w-full h-full'>
                <img
                  alt='Courtroom'
                  className='w-full h-full object-cover opacity-80'
                  src='https://lh3.googleusercontent.com/aida-public/AB6AXuBP5cR9lQN6j29Upd_CTwtsKW3kNkWjiCeoMMSTC8TNWymmVRtbYbjHRs70RBiCBQmZ_A9SNtsRkM8yexav8tKV1P-1SfOyw70gIwy4wpv0AXHQQG0qQcumQoQ8JqhrORz9MIGys7T-SxBv_Tu4Zh7Wdou1Yh79C1uHtc7gRMGYpQ7aVoUFnPG_gFGvyLROFhFj_w7QFZSPOzYbNtS2EMTldz3qCXQS5-FB9jPxnU4DSzG29hDHKWbVwAMkSL7SnFTxk4B-5wQeph-a'
                />
              </div>
              <div className='absolute inset-0 bg-gradient-to-t from-[#102758] to-transparent opacity-60' />
              <div className='absolute bottom-0 left-0 p-8 text-white'>
                <h3 className='text-2xl font-semibold'>Advanced Case Tracking</h3>
                <p className='max-w-md opacity-90'>Monitor your legal proceedings in real-time with automated notifications and status updates directly to your device.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className='w-full bg-[#293e6f] py-20 px-4 text-center'>
          <div className='max-w-2xl mx-auto'>
            <h2 className='text-3xl font-bold text-white mb-4'>Ready to begin your legal journey?</h2>
            <p className='text-[#96aae2] text-lg mb-8'>Join millions of citizens who trust LawPoint for their official legal requirements.</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className='w-full mt-auto bg-[#e0e3e5] border-t border-[#c5c6d0]'>
        <div className='flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto px-4 md:px-10 py-8 w-full'>
          <div className='mb-4 md:mb-0'>
            <span className='text-2xl font-bold text-[#102758]'>LawPoint</span>
            <p className='text-xs text-[#44464f] mt-2'>© 2024 LawPoint. Official Government Legal Portal.</p>
          </div>
          <div className='flex flex-wrap justify-center gap-4'>
            <span className='text-[#44464f] text-xs cursor-pointer hover:text-[#102758] transition-colors'>Privacy Policy</span>
            <span className='text-[#44464f] text-xs cursor-pointer hover:text-[#102758] transition-colors'>Terms of Service</span>
            <span className='text-[#44464f] text-xs cursor-pointer hover:text-[#102758] transition-colors'>Accessibility</span>
            <span className='text-[#44464f] text-xs cursor-pointer hover:text-[#102758] transition-colors'>Sitemap</span>
          </div>
          <div className='mt-4 md:mt-0 flex gap-4'>
            <span className='material-symbols-outlined text-[#5a5f64] hover:text-[#102758] cursor-pointer transition-all'>public</span>
            <span className='material-symbols-outlined text-[#5a5f64] hover:text-[#102758] cursor-pointer transition-all'>security</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SplashPage;
