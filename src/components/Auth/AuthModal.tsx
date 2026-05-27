import React, { useState } from 'react';
import { X, Mail, Phone, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useStore } from '../../store/useStore';
import toast from 'react-hot-toast';

interface AuthModalProps {
  onClose: () => void;
}

type Mode = 'login' | 'register';
type LoginMethod = 'email' | 'phone';

export default function AuthModal({ onClose }: AuthModalProps) {
  const [mode, setMode] = useState<Mode>('login');
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('email');
  const [showPassword, setShowPassword] = useState(false);
  const { register, login } = useStore();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'register') {
      if (!form.name.trim()) {
        toast.error('يجب إدخال الاسم');
        return;
      }
      if (loginMethod === 'email' && !form.email) {
        toast.error('يجب إدخال البريد الإلكتروني');
        return;
      }
      if (loginMethod === 'phone' && !form.phone) {
        toast.error('يجب إدخال رقم الهاتف');
        return;
      }
      if (form.password.length < 6) {
        toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
        return;
      }
      if (form.password !== form.confirmPassword) {
        toast.error('كلمتا المرور غير متطابقتين');
        return;
      }

      const result = register({
        name: form.name,
        email: loginMethod === 'email' ? form.email : undefined,
        phone: loginMethod === 'phone' ? form.phone : undefined,
        password: form.password,
      });

      if (result.success) {
        toast.success(result.message);
        onClose();
      } else {
        toast.error(result.message);
      }
    } else {
      const credential = loginMethod === 'email' ? form.email : form.phone;
      if (!credential) {
        toast.error(loginMethod === 'email' ? 'يجب إدخال البريد الإلكتروني' : 'يجب إدخال رقم الهاتف');
        return;
      }
      const result = login(credential, form.password);
      if (result.success) {
        toast.success(result.message);
        onClose();
      } else {
        toast.error(result.message);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
      <div className="glass-card rounded-2xl w-full max-w-md p-6 relative" style={{ background: 'linear-gradient(135deg, #1e293b, #1a1a3e)' }}>
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <X size={20} className="text-slate-400" />
        </button>

        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🎯</div>
          <h2 className="text-2xl font-bold gradient-text">
            {mode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            {mode === 'login' ? 'مرحباً بعودتك!' : 'انضم إلى منصة فرصة العمر'}
          </p>
        </div>

        {/* Login Method Tabs */}
        <div className="flex rounded-xl overflow-hidden mb-5 bg-slate-800/50 p-1">
          <button
            onClick={() => setLoginMethod('email')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              loginMethod === 'email'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Mail size={15} />
            البريد الإلكتروني
          </button>
          <button
            onClick={() => setLoginMethod('phone')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              loginMethod === 'phone'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Phone size={15} />
            رقم الهاتف
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div className="relative">
              <User size={17} className="absolute top-3.5 right-3.5 text-slate-400" />
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="الاسم الكامل"
                className="w-full bg-slate-800/60 border border-slate-600 rounded-xl py-3 pr-10 pl-4 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          )}

          {loginMethod === 'email' ? (
            <div className="relative">
              <Mail size={17} className="absolute top-3.5 right-3.5 text-slate-400" />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="البريد الإلكتروني"
                className="w-full bg-slate-800/60 border border-slate-600 rounded-xl py-3 pr-10 pl-4 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          ) : (
            <div className="relative">
              <Phone size={17} className="absolute top-3.5 right-3.5 text-slate-400" />
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="رقم الهاتف (05xxxxxxxx)"
                className="w-full bg-slate-800/60 border border-slate-600 rounded-xl py-3 pr-10 pl-4 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          )}

          <div className="relative">
            <Lock size={17} className="absolute top-3.5 right-3.5 text-slate-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="كلمة المرور"
              className="w-full bg-slate-800/60 border border-slate-600 rounded-xl py-3 pr-10 pl-10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-3.5 left-3.5 text-slate-400 hover:text-white"
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>

          {mode === 'register' && (
            <div className="relative">
              <Lock size={17} className="absolute top-3.5 right-3.5 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="تأكيد كلمة المرور"
                className="w-full bg-slate-800/60 border border-slate-600 rounded-xl py-3 pr-10 pl-4 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          )}

          <button
            type="submit"
            className="btn-primary w-full py-3 rounded-xl font-bold text-white text-base mt-2"
          >
            {mode === 'login' ? 'تسجيل الدخول' : 'إنشاء الحساب'}
          </button>
        </form>

        <div className="text-center mt-4">
          <span className="text-slate-400 text-sm">
            {mode === 'login' ? 'ليس لديك حساب؟ ' : 'لديك حساب بالفعل؟ '}
          </span>
          <button
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="text-indigo-400 hover:text-indigo-300 text-sm font-semibold transition-colors"
          >
            {mode === 'login' ? 'سجل الآن' : 'تسجيل الدخول'}
          </button>
        </div>
      </div>
    </div>
  );
}
