import { useState } from 'react';
import { LogOut, User, Menu, X, Ticket, Shield } from 'lucide-react';
import { useStore } from '../../store/useStore';
import toast from 'react-hot-toast';

interface NavbarProps {
  page: string;
  onPageChange: (page: string) => void;
  onAuthClick: () => void;
  onAdminClick: () => void;
}

export default function Navbar({ page, onPageChange, onAuthClick, onAdminClick }: NavbarProps) {
  const { currentUser, logout, settings } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('تم تسجيل الخروج بنجاح');
    onPageChange('home');
    setMenuOpen(false);
  };

  return (
    <nav
      className="sticky top-0 z-40 border-b border-slate-700/50"
      style={{ background: 'rgba(15,23,42,0.92)', backdropFilter: 'blur(16px)' }}
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => { onPageChange('home'); setMenuOpen(false); }}
          className="flex items-center gap-2.5 group"
        >
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Ticket size={18} className="text-white" />
          </div>
          <div>
            <span className="text-white font-black text-base gradient-text">{settings.competitionName}</span>
            <div className="text-slate-500 text-xs -mt-0.5 hidden sm:block">منصة المسابقات</div>
          </div>
        </button>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          <button
            onClick={() => onPageChange('home')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              page === 'home'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            🏠 الرئيسية
          </button>
          <button
            onClick={() => onPageChange('prizes')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              page === 'prizes'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            🏆 الجوائز
          </button>
          {currentUser && currentUser.role !== 'admin' && (
            <button
              onClick={() => onPageChange('my-tickets')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                page === 'my-tickets'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              🎫 بطاقاتي
            </button>
          )}
        </div>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-2">
          {currentUser ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700">
                <div className="w-7 h-7 rounded-full bg-indigo-600/40 flex items-center justify-center">
                  <User size={13} className="text-indigo-400" />
                </div>
                <span className="text-white text-sm font-medium max-w-24 truncate">{currentUser.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 text-sm transition-all"
              >
                <LogOut size={14} />
                خروج
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onAdminClick}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-600 text-slate-400 hover:text-white hover:border-slate-500 text-sm transition-all"
              >
                <Shield size={14} />
                المسؤول
              </button>
              <button
                onClick={onAuthClick}
                className="btn-primary flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-sm font-medium"
              >
                <User size={14} />
                تسجيل الدخول
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 rounded-xl hover:bg-white/10 transition-colors"
        >
          {menuOpen ? <X size={20} className="text-slate-300" /> : <Menu size={20} className="text-slate-300" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-700/50 px-4 py-3 space-y-1" style={{ background: 'rgba(15,23,42,0.98)' }}>
          <button
            onClick={() => { onPageChange('home'); setMenuOpen(false); }}
            className={`w-full text-right px-4 py-2.5 rounded-xl text-sm ${page === 'home' ? 'bg-indigo-600/20 text-indigo-300' : 'text-slate-300 hover:bg-white/5'}`}
          >
            🏠 الرئيسية
          </button>
          <button
            onClick={() => { onPageChange('prizes'); setMenuOpen(false); }}
            className={`w-full text-right px-4 py-2.5 rounded-xl text-sm ${page === 'prizes' ? 'bg-indigo-600/20 text-indigo-300' : 'text-slate-300 hover:bg-white/5'}`}
          >
            🏆 الجوائز
          </button>
          {currentUser && currentUser.role !== 'admin' && (
            <button
              onClick={() => { onPageChange('my-tickets'); setMenuOpen(false); }}
              className={`w-full text-right px-4 py-2.5 rounded-xl text-sm ${page === 'my-tickets' ? 'bg-indigo-600/20 text-indigo-300' : 'text-slate-300 hover:bg-white/5'}`}
            >
              🎫 بطاقاتي
            </button>
          )}
          <div className="border-t border-slate-700/30 pt-2 mt-2">
            {currentUser ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/60">
                  <User size={15} className="text-indigo-400" />
                  <span className="text-white text-sm">{currentUser.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-right px-4 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                >
                  <LogOut size={15} />
                  تسجيل الخروج
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                <button
                  onClick={() => { onAdminClick(); setMenuOpen(false); }}
                  className="w-full text-right px-4 py-2.5 rounded-xl text-sm text-slate-300 hover:bg-white/5 flex items-center gap-2"
                >
                  <Shield size={15} />
                  دخول المسؤول
                </button>
                <button
                  onClick={() => { onAuthClick(); setMenuOpen(false); }}
                  className="w-full text-right px-4 py-2.5 rounded-xl text-sm text-white bg-indigo-600 hover:bg-indigo-500"
                >
                  تسجيل الدخول / إنشاء حساب
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
