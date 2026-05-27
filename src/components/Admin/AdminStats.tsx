import { useMemo } from 'react';
import { Ticket, TrendingUp, Users, DollarSign, Clock, CheckCircle, XCircle, Award } from 'lucide-react';
import { useStore } from '../../store/useStore';

export default function AdminStats() {
  const { tickets, users, settings } = useStore();

  const stats = useMemo(() => {
    const available = tickets.filter(t => t.status === 'available').length;
    const pending = tickets.filter(t => t.status === 'pending').length;
    const approved = tickets.filter(t => t.status === 'approved').length;
    const rejected = tickets.filter(t => t.status === 'rejected').length;
    const total = tickets.length;
    const revenue = approved * settings.ticketPrice;
    const expectedRevenue = total * settings.ticketPrice;
    return { available, pending, approved, rejected, total, revenue, expectedRevenue };
  }, [tickets, settings]);

  const regularUsers = users.filter(u => u.role !== 'admin');
  const bannedUsers = regularUsers.filter(u => u.banned).length;

  const statCards = [
    {
      label: 'البطاقات المتاحة',
      value: stats.available,
      icon: Ticket,
      color: 'text-indigo-400',
      bg: 'rgba(99,102,241,0.15)',
      border: 'rgba(99,102,241,0.3)',
    },
    {
      label: 'قيد المراجعة',
      value: stats.pending,
      icon: Clock,
      color: 'text-amber-400',
      bg: 'rgba(245,158,11,0.15)',
      border: 'rgba(245,158,11,0.3)',
    },
    {
      label: 'المباعة (مقبولة)',
      value: stats.approved,
      icon: CheckCircle,
      color: 'text-green-400',
      bg: 'rgba(34,197,94,0.15)',
      border: 'rgba(34,197,94,0.3)',
    },
    {
      label: 'المرفوضة',
      value: stats.rejected,
      icon: XCircle,
      color: 'text-red-400',
      bg: 'rgba(239,68,68,0.15)',
      border: 'rgba(239,68,68,0.3)',
    },
    {
      label: 'الإيرادات الفعلية',
      value: `${stats.revenue.toLocaleString()} ${settings.currencyName}`,
      icon: DollarSign,
      color: 'text-emerald-400',
      bg: 'rgba(16,185,129,0.15)',
      border: 'rgba(16,185,129,0.3)',
    },
    {
      label: 'الإيرادات المتوقعة',
      value: `${stats.expectedRevenue.toLocaleString()} ${settings.currencyName}`,
      icon: TrendingUp,
      color: 'text-purple-400',
      bg: 'rgba(139,92,246,0.15)',
      border: 'rgba(139,92,246,0.3)',
    },
    {
      label: 'إجمالي الأعضاء',
      value: regularUsers.length,
      icon: Users,
      color: 'text-sky-400',
      bg: 'rgba(14,165,233,0.15)',
      border: 'rgba(14,165,233,0.3)',
    },
    {
      label: 'الأعضاء المحظورون',
      value: bannedUsers,
      icon: Users,
      color: 'text-rose-400',
      bg: 'rgba(244,63,94,0.15)',
      border: 'rgba(244,63,94,0.3)',
    },
  ];

  const completionRate = Math.round((stats.approved / stats.total) * 100);

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-bold text-white">الإحصائيات العامة</h2>
        <p className="text-slate-400 text-sm">نظرة شاملة على حالة المسابقة</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="rounded-xl p-4"
              style={{ background: card.bg, border: `1px solid ${card.border}` }}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon size={18} className={card.color} />
              </div>
              <div className={`text-xl font-bold ${card.color}`}>{card.value}</div>
              <div className="text-slate-400 text-xs mt-1">{card.label}</div>
            </div>
          );
        })}
      </div>

      {/* Progress */}
      <div className="rounded-xl p-5 mb-5" style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(99,102,241,0.2)' }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <TrendingUp size={17} className="text-indigo-400" />
            نسبة اكتمال المسابقة
          </h3>
          <span className="text-indigo-400 font-bold text-lg">{completionRate}%</span>
        </div>
        <div className="h-4 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${completionRate}%`,
              background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899)',
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-500 mt-2">
          <span>0</span>
          <span>{stats.total} بطاقة</span>
        </div>
      </div>

      {/* Prizes */}
      {settings.prizes.length > 0 && (
        <div className="rounded-xl p-5" style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(250,204,21,0.2)' }}>
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Award size={17} className="text-yellow-400" />
            الجوائز
          </h3>
          <div className="space-y-2">
            {settings.prizes.sort((a, b) => a.rank - b.rank).map(prize => (
              <div key={prize.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                  prize.rank === 1 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40' :
                  prize.rank === 2 ? 'bg-slate-400/20 text-slate-300 border border-slate-400/40' :
                  'bg-amber-700/20 text-amber-600 border border-amber-700/40'
                }`}>
                  {prize.rank === 1 ? '🥇' : prize.rank === 2 ? '🥈' : '🥉'}
                </div>
                <div>
                  <div className="text-white text-sm font-medium">{prize.name}</div>
                  <div className="text-slate-400 text-xs">{prize.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
