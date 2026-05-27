import { Award, Star } from 'lucide-react';
import { useStore } from '../../store/useStore';

export default function PrizesSection() {
  const { settings } = useStore();

  const rankEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const rankColors = [
    { bg: 'rgba(250,204,21,0.15)', border: 'rgba(250,204,21,0.4)', text: 'text-yellow-400', glow: '0 0 30px rgba(250,204,21,0.2)' },
    { bg: 'rgba(148,163,184,0.15)', border: 'rgba(148,163,184,0.4)', text: 'text-slate-300', glow: '0 0 30px rgba(148,163,184,0.1)' },
    { bg: 'rgba(180,83,9,0.15)', border: 'rgba(180,83,9,0.4)', text: 'text-amber-600', glow: '0 0 30px rgba(180,83,9,0.1)' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <div className="w-14 h-14 rounded-2xl bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center mx-auto mb-4">
          <Award size={28} className="text-yellow-400" />
        </div>
        <h2 className="text-3xl font-black text-white mb-3">
          جوائز <span className="gradient-text">رائعة</span> تنتظرك
        </h2>
        <p className="text-slate-400 text-base max-w-xl mx-auto">
          المركز الأول يحوز الجائزة الكبرى، كن الفائز المحظوظ!
        </p>
      </div>

      {settings.prizes.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🎁</div>
          <p className="text-slate-400">لم يتم تحديد الجوائز بعد</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl mx-auto">
          {settings.prizes.sort((a, b) => a.rank - b.rank).map((prize, idx) => {
            const colors = rankColors[Math.min(idx, rankColors.length - 1)];
            return (
              <div
                key={prize.id}
                className="rounded-2xl p-6 text-center transition-all hover:scale-105"
                style={{
                  background: colors.bg,
                  border: `1px solid ${colors.border}`,
                  boxShadow: idx === 0 ? colors.glow : 'none',
                }}
              >
                <div className="text-5xl mb-3">{rankEmoji(prize.rank)}</div>
                <div className={`text-sm font-medium mb-1 ${colors.text}`}>المركز {prize.rank}</div>
                <h3 className="text-white text-xl font-bold mb-2">{prize.name}</h3>
                <p className="text-slate-300 text-sm">{prize.description}</p>
                {idx === 0 && (
                  <div className="mt-3 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/30">
                    <Star size={11} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-yellow-300 text-xs font-medium">الجائزة الكبرى</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Payment Methods */}
      {settings.paymentMethods.length > 0 && (
        <div className="mt-16">
          <h3 className="text-center text-xl font-bold text-white mb-6">طرق الدفع المتاحة</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-2xl mx-auto">
            {settings.paymentMethods.map(pm => (
              <div
                key={pm.id}
                className="rounded-xl p-4 flex items-start gap-3"
                style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(99,102,241,0.2)' }}
              >
                <span className="text-2xl">{pm.icon}</span>
                <div>
                  <div className="text-white font-semibold text-sm">{pm.name}</div>
                  <div className="text-slate-400 text-xs mt-0.5">{pm.details}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
