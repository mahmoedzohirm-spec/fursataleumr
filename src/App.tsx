import { useState, useRef } from 'react';
import { Toaster } from 'react-hot-toast';
import { useStore } from './store/useStore';
import Navbar from './components/Layout/Navbar';
import HeroSection from './components/Home/HeroSection';
import TicketGrid from './components/Tickets/TicketGrid';
import MyTickets from './components/Tickets/MyTickets';
import PrizesSection from './components/Home/PrizesSection';
import AuthModal from './components/Auth/AuthModal';
import AdminLoginModal from './components/Auth/AdminLoginModal';
import AdminDashboard from './components/Admin/AdminDashboard';
import FeaturesSection from './components/Home/FeaturesSection';

type Page = 'home' | 'my-tickets' | 'prizes';

export default function App() {
  const { currentUser } = useStore();
  const [page, setPage] = useState<Page>('home');
  const [showAuth, setShowAuth] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const ticketsRef = useRef<HTMLDivElement>(null);
  
  const scrollToTickets = () => {
    ticketsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Show admin dashboard if logged in as admin
  if (currentUser?.role === 'admin') {
    return (
      <>
        <AdminDashboard />
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#1e293b',
              color: '#f1f5f9',
              border: '1px solid rgba(99,102,241,0.4)',
              fontFamily: 'Cairo, sans-serif',
              direction: 'rtl',
            },
          }}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#0f172a' }}>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid rgba(99,102,241,0.4)',
            fontFamily: 'Cairo, sans-serif',
            direction: 'rtl',
            borderRadius: '12px',
          },
          success: {
            iconTheme: { primary: '#6366f1', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#fff' },
          },
        }}
      />

      <Navbar
        page={page}
        onPageChange={p => setPage(p as Page)}
        onAuthClick={() => setShowAuth(true)}
        onAdminClick={() => setShowAdminLogin(true)}
      />

      <main>
        {page === 'home' && (
          <>
            <HeroSection onAuthClick={() => setShowAuth(true)} onScrollToTickets={scrollToTickets} />
            <FeaturesSection />
            <div className="max-w-7xl mx-auto px-4 py-10">
              <div ref={ticketsRef} className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">البطاقات المتاحة</h2>
                  <p className="text-slate-400 text-sm mt-1">اختر رقمك المحظوظ وسجل اشتراكك</p>
                </div>
              </div>
              <TicketGrid onAuthRequired={() => setShowAuth(true)} />
            </div>
          </>
        )}

        {page === 'prizes' && (
          <PrizesSection />
        )}

        {page === 'my-tickets' && (
          <div className="max-w-4xl mx-auto px-4 py-10">
            <MyTickets />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="text-slate-500 text-sm">
            © {new Date().getFullYear()} منصة فرصة العمر - جميع الحقوق محفوظة
          </div>
          <div className="text-slate-600 text-xs mt-1">
            منصة موثوقة وآمنة للمسابقات
          </div>
        </div>
      </footer>

      {/* Modals */}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      {showAdminLogin && <AdminLoginModal onClose={() => setShowAdminLogin(false)} />}
    </div>
  );
}
