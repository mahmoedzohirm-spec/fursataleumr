import { useState, useMemo } from 'react';
import { Search, CheckCircle, Clock, XCircle, Eye } from 'lucide-react';
import { useStore } from '../../store/useStore';

export default function AdminAllTickets() {
  const { tickets } = useStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'available'>('all');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const filteredTickets = useMemo(() => {
    return tickets
      .filter(t => t.status !== 'available' || filter === 'all' || filter === 'available')
      .filter(t => filter === 'all' ? t.status !== 'available' : t.status === filter)
      .filter(t =>
        search === '' ||
        t.number.toString().includes(search) ||
        (t.participantName && t.participantName.includes(search)) ||
        (t.userName && t.userName.includes(search)) ||
        (t.transferPhone && t.transferPhone.includes(search))
      )
      .sort((a, b) => (b.bookedAt || '').localeCompare(a.bookedAt || ''));
  }, [tickets, search, filter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <span className="flex items-center gap-1 text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-lg"><Clock size={10} />قيد المراجعة</span>;
      case 'approved': return <span className="flex items-center gap-1 text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-lg"><CheckCircle size={10} />مقبول</span>;
      case 'rejected': return <span className="flex items-center gap-1 text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-lg"><XCircle size={10} />مرفوض</span>;
      default: return null;
    }
  };

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-bold text-white">جميع الطلبات</h2>
        <p className="text-slate-400 text-sm">{filteredTickets.length} طلب</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={15} className="absolute top-3 right-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="بحث..."
            className="w-full bg-slate-800/60 border border-slate-700 rounded-xl py-2.5 pr-9 pl-4 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
          />
        </div>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value as typeof filter)}
          className="bg-slate-800/60 border border-slate-700 rounded-xl py-2.5 px-4 text-white focus:outline-none text-sm"
        >
          <option value="all">الكل (المعالجة)</option>
          <option value="pending">قيد المراجعة</option>
          <option value="approved">المقبولة</option>
          <option value="rejected">المرفوضة</option>
        </select>
      </div>

      {filteredTickets.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <div className="text-4xl mb-3">📋</div>
          لا توجد طلبات
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-700/50">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/50 text-right" style={{ background: 'rgba(30,41,59,0.8)' }}>
                <th className="text-slate-400 font-medium py-3 px-4">رقم</th>
                <th className="text-slate-400 font-medium py-3 px-4">المشارك</th>
                <th className="text-slate-400 font-medium py-3 px-4 hidden sm:table-cell">المستخدم</th>
                <th className="text-slate-400 font-medium py-3 px-4 hidden md:table-cell">جوال التحويل</th>
                <th className="text-slate-400 font-medium py-3 px-4">الحالة</th>
                <th className="text-slate-400 font-medium py-3 px-4 hidden sm:table-cell">الإشعار</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {filteredTickets.map(ticket => (
                <tr key={ticket.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4">
                    <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-600/50 flex items-center justify-center font-bold text-indigo-300 text-sm">
                      {ticket.number}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-200 text-sm">{ticket.participantName}</td>
                  <td className="py-3 px-4 text-slate-300 text-sm hidden sm:table-cell">
                    <div>{ticket.userName}</div>
                    <div className="text-slate-500 text-xs">{ticket.userContact}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-300 font-mono text-sm hidden md:table-cell">{ticket.transferPhone}</td>
                  <td className="py-3 px-4">{getStatusBadge(ticket.status)}</td>
                  <td className="py-3 px-4 hidden sm:table-cell">
                    {ticket.receiptImage && (
                      <button onClick={() => setImagePreview(ticket.receiptImage!)} className="relative group">
                        <img src={ticket.receiptImage} alt="إشعار" className="w-10 h-10 object-cover rounded-lg border border-slate-600" />
                        <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Eye size={12} className="text-white" />
                        </div>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {imagePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 cursor-pointer" style={{ background: 'rgba(0,0,0,0.9)' }} onClick={() => setImagePreview(null)}>
          <img src={imagePreview} alt="إشعار" className="max-w-full max-h-full rounded-xl" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
