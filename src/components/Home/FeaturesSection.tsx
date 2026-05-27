import { Shield, Zap, Trophy, Lock, CheckCircle, RefreshCw } from 'lucide-react';

const features = [
  {
    icon: Shield,
    color: 'text-indigo-400',
    bg: 'rgba(99,102,241,0.15)',
    border: 'rgba(99,102,241,0.3)',
    title: 'نظام آمن وموثوق',
    desc: 'منصة محمية بالكامل مع مراجعة يدوية لكل طلب لضمان الشفافية',
  },
  {
    icon: Zap,
    color: 'text-yellow-400',
    bg: 'rgba(250,204,21,0.15)',
    border: 'rgba(250,204,21,0.3)',
    title: 'سحب عشوائي فوري',
    desc: 'نظام عجلة الحظ يضمن سحباً عشوائياً مباشراً وشفافاً أمام الجميع',
  },
  {
    icon: Trophy,
    color: 'text-amber-400',
    bg: 'rgba(245,158,11,0.15)',
    border: 'rgba(245,158,11,0.3)',
    title: 'جوائز حصرية',
    desc: 'جوائز قيّمة ومتنوعة تنتظر الفائزين المحظوظين في كل مسابقة',
  },
  {
    icon: Lock,
    color: 'text-green-400',
    bg: 'rgba(34,197,94,0.15)',
    border: 'rgba(34,197,94,0.3)',
    title: 'منع تكرار الإشعارات',
    desc: 'نظام ذكي يمنع استخدام نفس إشعار التحويل أكثر من مرة',
  },
  {
    icon: CheckCircle,
    color: 'text-sky-400',
    bg: 'rgba(14,165,233,0.15)',
    border: 'rgba(14,165,233,0.3)',
    title: 'متابعة حالة طلبك',
    desc: 'تابع حالة بطاقتك في الوقت الفعلي من صفحة "بطاقاتي"',
  },
  {
    icon: RefreshCw,
    color: 'text-purple-400',
    bg: 'rgba(139,92,246,0.15)',
    border: 'rgba(139,92,246,0.3)',
    title: 'مسابقات متجددة',
    desc: 'مسابقات دورية متجددة بضغطة زر واحدة لبدء جولة جديدة',
  },
];

export default function FeaturesSection() {
  return (
    <div className="py-16 border-t border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-white mb-3">
            لماذا <span className="gradient-text">فرصة العمر؟</span>
          </h2>
          <p className="text-slate-400">منصة مبنية على أسس الشفافية والثقة</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="rounded-2xl p-5 transition-all hover:scale-[1.02] hover:-translate-y-1"
                style={{ background: f.bg, border: `1px solid ${f.border}` }}
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3" style={{ background: f.bg }}>
                  <Icon size={22} className={f.color} />
                </div>
                <h3 className="text-white font-bold mb-1.5">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
