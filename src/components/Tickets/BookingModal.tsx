import React, { useState, useRef } from 'react';
import { X, User, Phone, Upload, CreditCard, CheckCircle, Image } from 'lucide-react';
import { useStore, Ticket } from '../../store/useStore';
import toast from 'react-hot-toast';

interface BookingModalProps {
  ticket: Ticket;
  onClose: () => void;
}

async function hashImage(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function BookingModal({ ticket, onClose }: BookingModalProps) {
  const { settings, bookTicket, currentUser } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    participantName: currentUser?.name || '',
    paymentMethod: settings.paymentMethods[0]?.name || '',
    transferPhone: currentUser?.phone || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('يجب رفع صورة فقط');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('حجم الصورة كبير جداً (الحد الأقصى 10MB)');
      return;
    }

    setImageFile(file);
    const preview = await fileToBase64(file);
    setImagePreview(preview);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.participantName.trim()) {
      toast.error('يجب إدخال الاسم الثلاثي');
      return;
    }
    if (!form.transferPhone.trim()) {
      toast.error('يجب إدخال رقم الهاتف الذي تم التحويل منه');
      return;
    }
    if (!imageFile) {
      toast.error('يجب رفع صورة إشعار التحويل');
      return;
    }
    if (!form.paymentMethod) {
      toast.error('يجب اختيار طريقة الدفع');
      return;
    }

    setLoading(true);
    try {
      const receiptHash = await hashImage(imageFile);
      const receiptBase64 = await fileToBase64(imageFile);

      const result = bookTicket(ticket.id, {
        participantName: form.participantName,
        paymentMethod: form.paymentMethod,
        transferPhone: form.transferPhone,
        receiptImage: receiptBase64,
        receiptHash,
      });

      if (result.success) {
        toast.success(result.message);
        onClose();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error('حدث خطأ أثناء رفع الصورة');
    } finally {
      setLoading(false);
    }
  };

  const selectedPaymentMethod = settings.paymentMethods.find(pm => pm.name === form.paymentMethod);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
      <div className="rounded-2xl w-full max-w-lg my-4 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f172a, #1e1b4b)', border: '1px solid rgba(99,102,241,0.3)' }}>
        {/* Header */}
        <div className="p-5 border-b border-slate-700/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white text-sm">
              #{ticket.number}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">حجز البطاقة</h2>
              <p className="text-slate-400 text-xs">البطاقة رقم {ticket.number} - السعر: {settings.ticketPrice} {settings.currencyName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Payment Methods Info */}
        {selectedPaymentMethod && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-indigo-900/30 border border-indigo-500/30 flex items-start gap-3">
            <span className="text-xl">{selectedPaymentMethod.icon}</span>
            <div>
              <p className="text-indigo-300 font-semibold text-sm">{selectedPaymentMethod.name}</p>
              <p className="text-slate-300 text-xs mt-0.5">{selectedPaymentMethod.details}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Participant Name */}
          <div>
            <label className="text-slate-300 text-sm font-medium mb-1.5 flex items-center gap-1.5">
              <User size={14} className="text-indigo-400" />
              الاسم الثلاثي للمشارك
            </label>
            <input
              type="text"
              name="participantName"
              value={form.participantName}
              onChange={handleChange}
              placeholder="أدخل اسمك الثلاثي كاملاً"
              className="w-full bg-slate-800/60 border border-slate-600 rounded-xl py-2.5 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="text-slate-300 text-sm font-medium mb-1.5 flex items-center gap-1.5">
              <CreditCard size={14} className="text-indigo-400" />
              طريقة الدفع
            </label>
            <select
              name="paymentMethod"
              value={form.paymentMethod}
              onChange={handleChange}
              className="w-full bg-slate-800/60 border border-slate-600 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-indigo-500 transition-colors text-sm"
            >
              {settings.paymentMethods.map(pm => (
                <option key={pm.id} value={pm.name}>
                  {pm.icon} {pm.name}
                </option>
              ))}
            </select>
          </div>

          {/* Transfer Phone */}
          <div>
            <label className="text-slate-300 text-sm font-medium mb-1.5 flex items-center gap-1.5">
              <Phone size={14} className="text-indigo-400" />
              رقم الهاتف الذي تم التحويل منه
            </label>
            <input
              type="tel"
              name="transferPhone"
              value={form.transferPhone}
              onChange={handleChange}
              placeholder="05xxxxxxxx"
              className="w-full bg-slate-800/60 border border-slate-600 rounded-xl py-2.5 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
            />
          </div>

          {/* Receipt Image Upload */}
          <div>
            <label className="text-slate-300 text-sm font-medium mb-1.5 flex items-center gap-1.5">
              <Image size={14} className="text-indigo-400" />
              صورة إشعار التحويل
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />

            {imagePreview ? (
              <div className="relative rounded-xl overflow-hidden border border-indigo-500/50">
                <img src={imagePreview} alt="إشعار التحويل" className="w-full h-40 object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null);
                    setImageFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="absolute top-2 left-2 w-7 h-7 rounded-full bg-red-500 flex items-center justify-center"
                >
                  <X size={14} />
                </button>
                <div className="absolute bottom-2 right-2 bg-green-500/90 rounded-lg px-2 py-1 flex items-center gap-1 text-xs">
                  <CheckCircle size={12} />
                  تم رفع الصورة
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-slate-600 hover:border-indigo-500 rounded-xl py-6 flex flex-col items-center justify-center gap-2 transition-all hover:bg-indigo-500/5 cursor-pointer"
              >
                <Upload size={24} className="text-slate-400" />
                <span className="text-slate-400 text-sm">انقر لرفع صورة الإشعار</span>
                <span className="text-slate-500 text-xs">PNG, JPG, JPEG (الحد الأقصى 10MB)</span>
              </button>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                جارٍ التقديم...
              </>
            ) : (
              <>
                <CheckCircle size={18} />
                تقديم طلب الحجز
              </>
            )}
          </button>

          <p className="text-slate-500 text-xs text-center">
            سيتم مراجعة طلبك من قِبل المسؤول وإشعارك بالنتيجة
          </p>
        </form>
      </div>
    </div>
  );
}
