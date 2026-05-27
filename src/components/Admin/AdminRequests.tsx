import { useState, useMemo } from 'react';
import { CheckCircle, XCircle, Eye, Search, Clock } from 'lucide-react';
import { useStore } from '../../store/useStore';
import toast from 'react-hot-toast';

export default function AdminRequests() {
  const { tickets, approveTicket, rejectTicket } = useStore();
  const [search, setSearch] = useState('');
  const [rejectModal, setRejectModal] = useState<{ ticketId: string; num: number } | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const pendingTickets = useMemo(() => {
    return tickets
      .filter(t => t.status === 'pending')
      .filter(t => search === '' || 
        t.number.toString().includes(search) || 
        (t.participantName && t.participantName.includes(search)) ||
        (t.transferPhone && t.transferPhone.includes(search))
      );
  }, [tickets, search]);

  const handleApprove = (ticketId: string, ticketNum: number) => {
    approveTicket(ticketId);
    toast.success(`تم قبول البطاقة رقم ${ticketNum} ✅`);
  };

  const handleReject = () => {
    if (!rejectModal) return;
    if (!rejectReason.trim()) {
      toast.error('يجب إدخال سبب الرفض');
      return;
    }
    rejectTicket(rejectModal.ticketId, rejectReason);
    toast.success(`تم رفض البطاقة رقم ${rejectModal.num}`);
    setRejectModal(null);
    setRejectReason('');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-white">الطلبات المعلقة</h2>
          <p className="text-slate-400 text-sm">{pendingTickets.length} طلب ينتظر المراجعة</p>
        </div>
        <div className="flex items-center gap-2 bg-amber-500/20 border border-amber-500/40 rounded-xl px-3 py-2">
          <Clock size={15} className="text-amber-400" />
          <span className="text-amber-300 font-bold">{pendingTickets.length}</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={15} className="absolute top-3 right-3 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="بحث بالرقم أو الاسم أو الهاتف..."
          className="w-full bg-slate-800/60 border border-slate-700 rounded-xl py-2.5 pr-9 pl-4 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
        />
      </div>

      {pendingTickets.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">✅</div>
          <p className="text-slate-400">لا توجد طلبات معلقة</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pendingTickets.map(ticket => (
            <div key={ticket.id} className="rounded-xl border border-amber-500/30 p-4" style={{ background: 'rgba(120,80,11,0.2)' }}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-amber-600 flex items-center justify-center font-bold text-white text-lg shrink-0">
                    {ticket.number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-white text-sm mb-1">بطاقة رقم {ticket.number}</div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                      <div className="text-xs">
                        <span className="text-slate-500">المشارك: </span>
                        <span className="text-slate-200">{ticket.participantName}</span>
                      </div>
                      <div className="text-xs">
                        <span className="text-slate-500">المستخدم: </span>
                        <span className="text-slate-200">{ticket.userName}</span>
                      </div>
                      <div className="text-xs">
                        <span className="text-slate-500">التواصل: </span>
                        <span className="text-slate-200">{ticket.userContact}</span>
                      </div>
                      <div className="text-xs">
                        <span className="text-slate-500">طريقة الدفع: </span>
                        <span className="text-slate-200">{ticket.paymentMethod}</span>
                      </div>
                      <div className="text-xs">
                        <span className="text-slate-500">رقم التحويل: </span>
                        <span className="text-amber-300 font-mono">{ticket.transferPhone}</span>
                      </div>
                      {ticket.bookedAt && (
                        <div className="text-xs">
                          <span className="text-slate-500">تاريخ الطلب: </span>
                          <span className="text-slate-200">{new Date(ticket.bookedAt).toLocaleString('ar')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Receipt Image */}
                {ticket.receiptImage && (
                  <button
                    onClick={() => setImagePreview(ticket.receiptImage!)}
                    className="shrink-0 relative group"
                  >
                    <img
                      src={ticket.receiptImage}
                      alt="إشعار التحويل"
                      className="w-16 h-16 object-cover rounded-lg border border-amber-500/50"
                    />
                    <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Eye size={16} className="text-white" />
                    </div>
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleApprove(ticket.id, ticket.number)}
                  className="flex-1 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white text-sm font-medium flex items-center justify-center gap-1.5 transition-colors"
                >
                  <CheckCircle size={15} />
                  قبول
                </button>
                <button
                  onClick={() => setRejectModal({ ticketId: ticket.id, num: ticket.number })}
                  className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-medium flex items-center justify-center gap-1.5 transition-colors"
                >
                  <XCircle size={15} />
                  رفض
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }}>
          <div className="rounded-2xl w-full max-w-sm p-6" style={{ background: 'linear-gradient(135deg, #1e293b, #1a1a3e)', border: '1px solid rgba(239,68,68,0.4)' }}>
            <h3 className="text-lg font-bold text-white mb-1">رفض الطلب</h3>
            <p className="text-slate-400 text-sm mb-4">البطاقة رقم {rejectModal.num}</p>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="أدخل سبب الرفض..."
              rows={3}
              className="w-full bg-slate-800/60 border border-slate-600 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-red-500 text-sm resize-none mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={handleReject}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium text-sm transition-colors"
              >
                تأكيد الرفض
              </button>
              <button
                onClick={() => { setRejectModal(null); setRejectReason(''); }}
                className="flex-1 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-medium text-sm transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {imagePreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 cursor-pointer"
          style={{ background: 'rgba(0,0,0,0.9)' }}
          onClick={() => setImagePreview(null)}
        >
          <img
            src={imagePreview}
            alt="إشعار التحويل"
            className="max-w-full max-h-full rounded-xl"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
