import { useState, useRef, useEffect, useMemo } from 'react';
import { Play, X, RotateCcw, Phone, User, Hash, CreditCard } from 'lucide-react';
import { useStore, DrawResult } from '../../store/useStore';
import toast from 'react-hot-toast';

const COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b',
  '#10b981', '#3b82f6', '#ef4444', '#14b8a6',
  '#f97316', '#84cc16', '#06b6d4', '#a855f7',
];

function Confetti() {
  const pieces = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    color: COLORS[i % COLORS.length],
    delay: Math.random() * 2,
    duration: 2 + Math.random() * 3,
    size: 6 + Math.random() * 10,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[9999]">
      {pieces.map(p => (
        <div
          key={p.id}
          className="confetti-piece absolute"
          style={{
            left: `${p.left}%`,
            top: '-20px',
            width: p.size,
            height: p.size,
            background: p.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '0',
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function LuckyWheel() {
  const { tickets, setDrawResult, drawResult, settings } = useStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [spinning, setSpinning] = useState(false);
  const [currentAngle, setCurrentAngle] = useState(0);
  const [showWinner, setShowWinner] = useState(false);
  const [localResult, setLocalResult] = useState<DrawResult | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const animRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const spinDuration = 5000; // ms
  const targetAngleRef = useRef<number>(0);
  const startAngleRef = useRef<number>(0);

  const approvedTickets = useMemo(() => 
    tickets.filter(t => t.status === 'approved'),
    [tickets]
  );

  const segments = useMemo(() => {
    if (approvedTickets.length === 0) return [];
    const count = Math.min(approvedTickets.length, 24);
    return approvedTickets.slice(0, count);
  }, [approvedTickets]);

  const drawWheel = (angle: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const cx = size / 2;
    const cy = size / 2;
    const radius = cx - 10;

    ctx.clearRect(0, 0, size, size);

    if (segments.length === 0) {
      // Draw empty wheel
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#1e293b';
      ctx.fill();
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 14px Cairo';
      ctx.textAlign = 'center';
      ctx.fillText('لا توجد بطاقات مقبولة', cx, cy);
      return;
    }

    const segAngle = (Math.PI * 2) / segments.length;

    segments.forEach((ticket, i) => {
      const startA = angle + i * segAngle;
      const endA = startA + segAngle;

      // Segment
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, startA, endA);
      ctx.closePath();
      ctx.fillStyle = COLORS[i % COLORS.length];
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Text
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(startA + segAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#fff';
      ctx.font = `bold ${Math.max(10, Math.min(14, 240 / segments.length))}px Cairo`;
      ctx.fillText(`${ticket.number}`, radius - 15, 4);
      ctx.restore();
    });

    // Center circle
    ctx.beginPath();
    ctx.arc(cx, cy, 30, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px Cairo';
    ctx.textAlign = 'center';
    ctx.fillText('🎯', cx, cy + 4);

    // Pointer (top)
    const pw = 20;
    const ph = 35;
    ctx.beginPath();
    ctx.moveTo(cx, cy - radius - 5);
    ctx.lineTo(cx - pw / 2, cy - radius + ph);
    ctx.lineTo(cx + pw / 2, cy - radius + ph);
    ctx.closePath();
    ctx.fillStyle = '#f59e0b';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  useEffect(() => {
    drawWheel(currentAngle);
  }, [segments, currentAngle]);

  const easeOut = (t: number) => 1 - Math.pow(1 - t, 4);

  const spin = () => {
    if (spinning || approvedTickets.length === 0) {
      if (approvedTickets.length === 0) {
        toast.error('لا توجد بطاقات مقبولة للسحب');
      }
      return;
    }

    // Pick random winner
    const winnerIdx = Math.floor(Math.random() * approvedTickets.length);
    const winner = approvedTickets[winnerIdx];
    const segmentIdx = segments.findIndex(s => s.id === winner.id);
    const segAngle = (Math.PI * 2) / segments.length;
    
    // Calculate target angle so winner lands at top (pointer at 12 o'clock = -PI/2)
    const targetSegCenter = segmentIdx * segAngle + segAngle / 2;
    const fullRotations = Math.PI * 2 * (8 + Math.random() * 4); // 8-12 full spins
    const targetAngle = fullRotations - targetSegCenter + Math.PI * 1.5 + currentAngle;
    
    startAngleRef.current = currentAngle;
    targetAngleRef.current = targetAngle;
    startTimeRef.current = performance.now();
    setSpinning(true);

    const animate = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(elapsed / spinDuration, 1);
      const easedProgress = easeOut(progress);
      const angle = startAngleRef.current + (targetAngleRef.current - startAngleRef.current) * easedProgress;
      
      setCurrentAngle(angle);
      drawWheel(angle);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        setCurrentAngle(targetAngle);
        setSpinning(false);
        
        // Show winner
        const result: DrawResult = {
          ticketNumber: winner.number,
          userId: winner.userId!,
          userName: winner.userName!,
          userContact: winner.userContact!,
          participantName: winner.participantName!,
          transferPhone: winner.transferPhone!,
          drawnAt: new Date().toISOString(),
        };
        setLocalResult(result);
        setDrawResult(result);
        setShowWinner(true);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }
    };

    animRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  const displayResult = localResult || drawResult;

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-bold text-white">عجلة الحظ</h2>
        <p className="text-slate-400 text-sm">
          {approvedTickets.length} بطاقة مقبولة جاهزة للسحب
        </p>
      </div>

      {showConfetti && <Confetti />}

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Wheel */}
        <div className="flex flex-col items-center gap-4 flex-1">
          <div className="relative">
            <div
              className="rounded-full p-3"
              style={{
                background: 'linear-gradient(135deg, #1e293b, #1a1a3e)',
                boxShadow: spinning ? '0 0 60px rgba(99,102,241,0.6)' : '0 0 30px rgba(99,102,241,0.3)',
                transition: 'box-shadow 0.3s',
              }}
            >
              <canvas
                ref={canvasRef}
                width={320}
                height={320}
                className="rounded-full"
              />
            </div>
          </div>

          <button
            onClick={spin}
            disabled={spinning || approvedTickets.length === 0}
            className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg transition-all ${
              spinning || approvedTickets.length === 0
                ? 'opacity-50 cursor-not-allowed bg-slate-700'
                : 'btn-primary cursor-pointer'
            }`}
            style={!spinning && approvedTickets.length > 0 ? {
              boxShadow: '0 0 30px rgba(99,102,241,0.5)',
            } : {}}
          >
            {spinning ? (
              <>
                <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                الدوران جارٍ...
              </>
            ) : (
              <>
                <Play size={22} className="fill-white" />
                ابدأ السحب
              </>
            )}
          </button>

          {approvedTickets.length === 0 && (
            <div className="text-center p-4 rounded-xl border border-amber-500/30 bg-amber-500/10">
              <p className="text-amber-400 text-sm">⚠️ يجب قبول بطاقات أولاً لبدء السحب</p>
            </div>
          )}
        </div>

        {/* Previous result */}
        {displayResult && (
          <div className="flex-1 rounded-xl p-5" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))', border: '1px solid rgba(99,102,241,0.4)' }}>
            <div className="text-center mb-4">
              <div className="text-3xl mb-1">🏆</div>
              <h3 className="text-xl font-bold text-white">آخر سحب</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-black/20">
                <Hash size={16} className="text-indigo-400 shrink-0" />
                <div>
                  <div className="text-slate-400 text-xs">رقم البطاقة</div>
                  <div className="text-white font-bold text-lg">{displayResult.ticketNumber}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-black/20">
                <User size={16} className="text-purple-400 shrink-0" />
                <div>
                  <div className="text-slate-400 text-xs">اسم المشارك</div>
                  <div className="text-white font-medium">{displayResult.participantName}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-black/20">
                <User size={16} className="text-pink-400 shrink-0" />
                <div>
                  <div className="text-slate-400 text-xs">اسم المستخدم</div>
                  <div className="text-white font-medium">{displayResult.userName}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-black/20">
                <CreditCard size={16} className="text-amber-400 shrink-0" />
                <div>
                  <div className="text-slate-400 text-xs">وسيلة التواصل</div>
                  <div className="text-white font-medium">{displayResult.userContact}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-black/20">
                <Phone size={16} className="text-green-400 shrink-0" />
                <div>
                  <div className="text-slate-400 text-xs">رقم جوال التحويل</div>
                  <div className="text-white font-mono font-bold">{displayResult.transferPhone}</div>
                </div>
              </div>
              <div className="text-xs text-slate-500 text-center mt-2">
                {new Date(displayResult.drawnAt).toLocaleString('ar')}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Winner Modal */}
      {showWinner && localResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(8px)' }}>
          <div
            className="winner-animate rounded-3xl w-full max-w-md p-8 text-center relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #1e1b4b, #312e81, #4c1d95)',
              border: '2px solid rgba(250,204,21,0.6)',
              boxShadow: '0 0 80px rgba(250,204,21,0.3)',
            }}
          >
            {/* Close */}
            <button
              onClick={() => setShowWinner(false)}
              className="absolute top-4 left-4 p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <X size={18} className="text-slate-400" />
            </button>

            {/* Trophy */}
            <div className="float-effect text-7xl mb-4">🏆</div>
            <div className="text-yellow-300 text-sm font-medium mb-1 tracking-widest uppercase">
              الفائز بالجائزة
            </div>
            <h2 className="text-3xl font-black text-white mb-6">مبروك!</h2>

            {/* Ticket Number */}
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 glow-effect"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}
            >
              <div className="text-center">
                <div className="text-white text-xs">بطاقة</div>
                <div className="text-white text-2xl font-black">#{localResult.ticketNumber}</div>
              </div>
            </div>

            {/* Winner Info */}
            <div className="space-y-3 text-right mb-6">
              <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.07)' }}>
                <User size={16} className="text-yellow-400 shrink-0" />
                <div>
                  <div className="text-slate-400 text-xs">المشارك الفائز</div>
                  <div className="text-white font-bold">{localResult.participantName}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.07)' }}>
                <User size={16} className="text-purple-400 shrink-0" />
                <div>
                  <div className="text-slate-400 text-xs">اسم الحساب</div>
                  <div className="text-white font-bold">{localResult.userName}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.07)' }}>
                <CreditCard size={16} className="text-sky-400 shrink-0" />
                <div>
                  <div className="text-slate-400 text-xs">وسيلة التواصل</div>
                  <div className="text-white font-bold">{localResult.userContact}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.07)' }}>
                <Phone size={16} className="text-green-400 shrink-0" />
                <div>
                  <div className="text-slate-400 text-xs">رقم الجوال المحوِّل</div>
                  <div className="text-white font-bold font-mono">{localResult.transferPhone}</div>
                </div>
              </div>
            </div>

            {/* Prizes */}
            {settings.prizes.length > 0 && (
              <div className="mb-6">
                <div className="text-slate-400 text-xs mb-2">الجوائز المتاحة</div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {settings.prizes.sort((a, b) => a.rank - b.rank).map(prize => (
                    <div key={prize.id} className="text-xs px-3 py-1.5 rounded-lg" style={{ background: 'rgba(250,204,21,0.15)', border: '1px solid rgba(250,204,21,0.3)' }}>
                      <span className="text-yellow-400 font-medium">{prize.name}: </span>
                      <span className="text-slate-300">{prize.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setShowWinner(false)}
                className="flex-1 py-3 rounded-xl text-white font-bold"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
              >
                رائع! 🎉
              </button>
              <button
                onClick={() => { setShowWinner(false); setLocalResult(null); }}
                className="py-3 px-4 rounded-xl bg-slate-700 hover:bg-slate-600 transition-colors"
              >
                <RotateCcw size={16} className="text-slate-300" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
