import React, { useState } from 'react';
import { X, User, Lock, Eye, EyeOff, Shield } from 'lucide-react';
import { useStore } from '../../store/useStore';
import toast from 'react-hot-toast';

interface AdminLoginModalProps {
  onClose: () => void;
}

export default function AdminLoginModal({ onClose }: AdminLoginModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { adminLogin } = useStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = adminLogin(username, password);
    if (result.success) {
      toast.success(result.message);
      onClose();
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
      <div className="rounded-2xl w-full max-w-sm p-7 relative" style={{ background: 'linear-gradient(135deg, #1e293b, #1a1a3e)', border: '1px solid rgba(99,102,241,0.3)' }}>
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <X size={20} className="text-slate-400" />
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center mx-auto mb-3">
            <Shield size={28} className="text-indigo-400" />
          </div>
          <h2 className="text-xl font-bold text-white">دخول المسؤول</h2>
          <p className="text-slate-400 text-sm mt-1">لوحة تحكم المسابقة</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User size={17} className="absolute top-3.5 right-3.5 text-slate-400" />
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="اسم المستخدم"
              className="w-full bg-slate-800/60 border border-slate-600 rounded-xl py-3 pr-10 pl-4 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="relative">
            <Lock size={17} className="absolute top-3.5 right-3.5 text-slate-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
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

          <button
            type="submit"
            className="btn-primary w-full py-3 rounded-xl font-bold text-white mt-2 flex items-center justify-center gap-2"
          >
            <Shield size={17} />
            دخول لوحة التحكم
          </button>
        </form>
      </div>
    </div>
  );
}
