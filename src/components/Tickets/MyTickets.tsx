import { useMemo } from 'react';
import { Ticket, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { useStore } from '../../store/useStore';

export default function MyTickets() {
  const { tickets, currentUser, settings } = useStore();

  const myTickets = useMemo(() => {
    if (!currentUser) return [];
    return tickets.filter(t => t.userId === currentUser.id);
  }, [tickets, currentUser]);

  if (!currentUser) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">🔐</div>
        <h2 className="text-xl font-bold text-white mb-2">يجب تسجيل الدخول</h2>
        <p className="text-slate-400">سجل دخولك لعرض بطاقاتك</p>
      </div>
    );
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: 'قيد المراجعة', color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/30', icon: Clock };
      case 'approved':
        return { label: 'مقبول ✅', color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/30', icon: CheckCircle };
      case 'rejected':
        return { label: 'مرفوض', color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/30', icon: XCircle };
      default:
        return { label: 'متاح', color: 'text-indigo-400', bg: 'bg-indigo-400/10 border-indigo-400/30', icon: Ticket };
    }
  };

  const stats = {
    total: myTickets.length,
    pending: myTickets.filter(t => t.status === 'pending').length,
    approved: myTickets.filter(t => t.status === 'approved').length,
    rejected: myTickets.filter(t => t.status === 'rejected').length,
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">بطاقاتي</h2>
        <p className="text-slate-400 text-sm mt-1">مرحباً {currentUser.name}، هنا تجد جميع بطاقاتك المحجوزة</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}>
          <div className="text-2xl font-bold text-indigo-400">{stats.total}</div>
          <div className="text-slate-400 text-xs mt-1">إجمالي البطاقات</div>
        </div>
        <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}>
          <div className="text-2xl font-bold text-amber-400">{stats.pending}</div>
          <div className="text-slate-400 text-xs mt-1">قيد المراجعة</div>
        </div>
        <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}>
          <div className="text-2xl font-bold text-green-400">{stats.approved}</div>
          <div className="text-slate-400 text-xs mt-1">مقبولة</div>
        </div>
        <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
          <div className="text-2xl font-bold text-red-400">{stats.rejected}</div>
          <div className="text-slate-400 text-xs mt-1">مرفوضة</div>
        </div>
      </div>

      {myTickets.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🎫</div>
          <h3 className="text-xl font-bold text-white mb-2">لا توجد بطاقات بعد</h3>
          <p className="text-slate-400">احجز بطاقتك الأولى وادخل المسابقة!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {myTickets.map(ticket => {
            const statusInfo = getStatusInfo(ticket.status);
            const StatusIcon = statusInfo.icon;
            return (
              <div
                key={ticket.id}
                className={`rounded-xl border p-4 ${statusInfo.bg}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    {/* Ticket Number */}
                    <div className="w-12 h-12 rounded-xl bg-black/20 flex items-center justify-center font-bold text-lg text-white shrink-0">
                      {ticket.number}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-sm">بطاقة رقم {ticket.number}</span>
                        <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-lg bg-black/20 ${statusInfo.color}`}>
                          <StatusIcon size={11} />
                          {statusInfo.label}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 mt-2">
                        <div className="text-slate-400 text-xs">
                          <span className="text-slate-500">المشارك: </span>
                          <span className="text-slate-300">{ticket.participantName}</span>
                        </div>
                        <div className="text-slate-400 text-xs">
                          <span className="text-slate-500">طريقة الدفع: </span>
                          <span className="text-slate-300">{ticket.paymentMethod}</span>
                        </div>
                        <div className="text-slate-400 text-xs">
                          <span className="text-slate-500">رقم التحويل: </span>
                          <span className="text-slate-300">{ticket.transferPhone}</span>
                        </div>
                        <div className="text-slate-400 text-xs">
                          <span className="text-slate-500">السعر: </span>
                          <span className="text-slate-300">{settings.ticketPrice} {settings.currencyName}</span>
                        </div>
                        {ticket.bookedAt && (
                          <div className="text-slate-400 text-xs">
                            <span className="text-slate-500">تاريخ الطلب: </span>
                            <span className="text-slate-300">{new Date(ticket.bookedAt).toLocaleDateString('ar')}</span>
                          </div>
                        )}
                      </div>

                      {ticket.status === 'rejected' && ticket.rejectionReason && (
                        <div className="mt-2 flex items-start gap-2 p-2 rounded-lg bg-red-500/10 border border-red-500/30">
                          <AlertCircle size={13} className="text-red-400 mt-0.5 shrink-0" />
                          <div>
                            <div className="text-red-400 text-xs font-medium">سبب الرفض:</div>
                            <div className="text-red-300 text-xs mt-0.5">{ticket.rejectionReason}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Receipt Image */}
                  {ticket.receiptImage && (
                    <div className="shrink-0">
                      <img
                        src={ticket.receiptImage}
                        alt="إشعار التحويل"
                        className="w-14 h-14 object-cover rounded-lg border border-slate-600 cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => window.open(ticket.receiptImage, '_blank')}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
