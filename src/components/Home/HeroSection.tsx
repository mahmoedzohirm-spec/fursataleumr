import { useMemo } from 'react';
import { Ticket, TrendingUp, Users, Clock, ChevronDown } from 'lucide-react';
import { useStore } from '../../store/useStore';

interface HeroSectionProps {
  onAuthClick: () => void;
  onScrollToTickets: () => void;
}

export default function HeroSection({ onAuthClick, onScrollToTickets }: HeroSectionProps) {
  const { tickets, settings, currentUser } = useStore();

  const stats = useMemo(() => {
    const sold = tickets.filter(t => t.status === 'approved').length;
    const available = tickets.filter(t => t.status === 'available' || t.status === 'rejected').length;
    const pending = tickets.filter(t => t.status === 'pending').length;
    return { sold, available, pending };
  }, [tickets]);

  const progressPct = Math.round((stats.sold / tickets.length) * 100) || 0;

  return (
    <div className="relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)', minHeight: '85vh' }}>
      {/* Decorative blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #6366f1, transparent)', filter: 'blur(60px)' }} />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #ec4899, transparent)', filter: 'blur(60px)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5" style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)', filter: 'blur(80px)' }} />
        {/* Floating dots */}
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-20"
            style={{
              width: 3 + (i % 5),
              height: 3 + (i % 5),
              background: ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b'][i % 4],
              top: `${(i * 13 + 7) % 100}%`,
              left: `${(i * 17 + 11) % 100}%`,
              animation: `float ${3 + (i % 3)}s ease-in-out infinite`,
              animationDelay: `${(i % 5) * 0.5}s`,
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 py-20 relative">
        <div className="text-center mb-14">
          {/* Live badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-sm font-medium" style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)' }}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
            </span>
            <span className="text-green-300">المسابقة نشطة الآن</span>
          </div>

          {/* Main Title */}
          <h1 className="text-5xl sm:text-7xl font-black mb-5 leading-tight">
            <span className="gradient-text">{settings.competitionName}</span>
          </h1>

          <p className="text-slate-300 text-lg sm:text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
            احجز رقمك المميز الآن وادخل سحب الجوائز الكبرى!
            <br />
            <span className="text-slate-400 text-base">بطاقات محدودة · فائز واحد محظوظ · سحب مباشر شفاف</span>
          </p>

          {/* Price Badge */}
          <div className="inline-flex items-baseline gap-2 px-6 py-3.5 rounded-2xl mb-8" style={{ background: 'rgba(250,204,21,0.12)', border: '1px solid rgba(250,204,21,0.35)', boxShadow: '0 0 30px rgba(250,204,21,0.1)' }}>
            <span className="text-slate-400 text-sm">سعر البطاقة</span>
            <span className="text-yellow-300 text-3xl font-black">{settings.ticketPrice}</span>
            <span className="text-yellow-400 font-bold">{settings.currencyName}</span>
          </div>

          {/* CTA */}
          {!currentUser ? (
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
              <button
                onClick={onAuthClick}
                className="btn-primary px-10 py-4 rounded-2xl font-bold text-white text-lg"
                style={{ boxShadow: '0 0 50px rgba(99,102,241,0.5)' }}
              >
                🎯 احجز بطاقتك الآن
              </button>
              <button
                onClick={onScrollToTickets}
                className="px-8 py-4 rounded-2xl font-bold text-slate-300 text-base border border-slate-600 hover:border-indigo-500 hover:text-white transition-all"
              >
                عرض البطاقات
              </button>
            </div>
          ) : (
            <button
              onClick={onScrollToTickets}
              className="btn-primary px-10 py-4 rounded-2xl font-bold text-white text-lg mb-10"
              style={{ boxShadow: '0 0 50px rgba(99,102,241,0.5)' }}
            >
              🎫 اختر بطاقتك
            </button>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto mb-10">
          {[
            { icon: <Ticket size={18} className="text-indigo-400" />, value: tickets.length, label: 'إجمالي البطاقات', color: 'rgba(99,102,241,0.15)', border: 'rgba(99,102,241,0.3)' },
            { icon: <TrendingUp size={18} className="text-green-400" />, value: stats.available, label: 'متاحة للحجز', color: 'rgba(34,197,94,0.15)', border: 'rgba(34,197,94,0.3)' },
            { icon: <Clock size={18} className="text-amber-400" />, value: stats.pending, label: 'قيد المراجعة', color: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)' },
            { icon: <Users size={18} className="text-purple-400" />, value: stats.sold, label: 'تم بيعها', color: 'rgba(139,92,246,0.15)', border: 'rgba(139,92,246,0.3)' },
          ].map((s, i) => (
            <div key={i} className="rounded-2xl p-4 text-center" style={{ background: s.color, border: `1px solid ${s.border}` }}>
              <div className="flex justify-center mb-2">{s.icon}</div>
              <div className="text-2xl font-black text-white">{s.value}</div>
              <div className="text-slate-400 text-xs mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="max-w-xl mx-auto">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-400">اكتمال المبيعات</span>
            <span className="text-indigo-300 font-bold">{progressPct}%</span>
          </div>
          <div className="h-3 rounded-full bg-slate-800/60 overflow-hidden border border-slate-700">
            <div
              className="h-full rounded-full transition-all duration-1000 relative overflow-hidden"
              style={{
                width: `${progressPct}%`,
                background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899)',
              }}
            >
              <div className="absolute inset-0 shimmer-effect"></div>
            </div>
          </div>
          <div className="text-center text-xs text-slate-500 mt-2">
            {stats.sold} من {tickets.length} بطاقة تم بيعها
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="text-center mt-10">
          <button onClick={onScrollToTickets} className="text-slate-500 hover:text-slate-300 transition-colors animate-bounce">
            <ChevronDown size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}
