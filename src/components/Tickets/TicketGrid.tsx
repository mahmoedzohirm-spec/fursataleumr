import { useState, useMemo } from 'react';
import { Search, Filter, Grid3X3, List } from 'lucide-react';
import { useStore, Ticket } from '../../store/useStore';
import BookingModal from './BookingModal';
import toast from 'react-hot-toast';

interface TicketGridProps {
  onAuthRequired: () => void;
}

export default function TicketGrid({ onAuthRequired }: TicketGridProps) {
  const { tickets, currentUser, settings } = useStore();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'available' | 'pending' | 'approved'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      const matchesSearch = search === '' || t.number.toString().includes(search);
      const matchesFilter = filter === 'all' || t.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [tickets, search, filter]);

  const stats = useMemo(() => {
    const sold = tickets.filter(t => t.status === 'approved').length;
    const pending = tickets.filter(t => t.status === 'pending').length;
    const available = tickets.filter(t => t.status === 'available').length;
    const rejected = tickets.filter(t => t.status === 'rejected').length;
    return { sold, pending, available, rejected, total: tickets.length };
  }, [tickets]);

  const handleTicketClick = (ticket: Ticket) => {
    if (ticket.status !== 'available') {
      toast.error('هذه البطاقة غير متاحة للحجز');
      return;
    }
    if (!currentUser) {
      onAuthRequired();
      return;
    }
    if (currentUser.banned) {
      toast.error('تم حظر حسابك');
      return;
    }
    setSelectedTicket(ticket);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available': return 'متاح';
      case 'pending': return 'قيد المراجعة';
      case 'approved': return 'محجوز';
      case 'rejected': return 'متاح';
      default: return '';
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'available': return 'ticket-available';
      case 'pending': return 'ticket-pending';
      case 'approved': return 'ticket-approved';
      case 'rejected': return 'ticket-available';
      default: return '';
    }
  };

  return (
    <div className="w-full">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}>
          <div className="text-2xl font-bold text-indigo-400">{stats.available}</div>
          <div className="text-slate-400 text-xs mt-1">متاح</div>
        </div>
        <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}>
          <div className="text-2xl font-bold text-amber-400">{stats.pending}</div>
          <div className="text-slate-400 text-xs mt-1">قيد المراجعة</div>
        </div>
        <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}>
          <div className="text-2xl font-bold text-green-400">{stats.sold}</div>
          <div className="text-slate-400 text-xs mt-1">مباعة</div>
        </div>
        <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)' }}>
          <div className="text-2xl font-bold text-purple-400">{stats.total}</div>
          <div className="text-slate-400 text-xs mt-1">الإجمالي</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-400">نسبة المبيعات</span>
          <span className="text-indigo-400 font-semibold">{Math.round((stats.sold / stats.total) * 100)}%</span>
        </div>
        <div className="h-3 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${(stats.sold / stats.total) * 100}%`,
              background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899)',
            }}
          />
        </div>
        <div className="flex gap-4 mt-2 text-xs text-slate-500">
          <span>سعر البطاقة: <strong className="text-slate-300">{settings.ticketPrice} {settings.currencyName}</strong></span>
          <span>الإجمالي المحتمل: <strong className="text-indigo-300">{(stats.total * settings.ticketPrice).toLocaleString()} {settings.currencyName}</strong></span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={16} className="absolute top-3 right-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ابحث عن رقم البطاقة..."
            className="w-full bg-slate-800/60 border border-slate-700 rounded-xl py-2.5 pr-9 pl-4 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
          />
        </div>

        <div className="flex gap-2">
          <div className="relative">
            <Filter size={14} className="absolute top-3 right-3 text-slate-400" />
            <select
              value={filter}
              onChange={e => setFilter(e.target.value as typeof filter)}
              className="bg-slate-800/60 border border-slate-700 rounded-xl py-2.5 pr-8 pl-3 text-white focus:outline-none focus:border-indigo-500 text-sm appearance-none"
            >
              <option value="all">الكل</option>
              <option value="available">المتاحة</option>
              <option value="pending">قيد المراجعة</option>
              <option value="approved">المحجوزة</option>
            </select>
          </div>

          <div className="flex rounded-xl overflow-hidden border border-slate-700">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2.5 ${viewMode === 'grid' ? 'bg-indigo-600' : 'bg-slate-800/60 hover:bg-slate-700/60'} transition-colors`}
            >
              <Grid3X3 size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2.5 ${viewMode === 'list' ? 'bg-indigo-600' : 'bg-slate-800/60 hover:bg-slate-700/60'} transition-colors`}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Tickets Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
          {filteredTickets.map(ticket => (
            <button
              key={ticket.id}
              onClick={() => handleTicketClick(ticket)}
              className={`${getStatusClass(ticket.status)} rounded-lg p-2 flex flex-col items-center justify-center aspect-square relative group transition-all duration-200 ${
                ticket.status === 'available' || ticket.status === 'rejected' ? 'cursor-pointer' : 'cursor-not-allowed'
              }`}
            >
              <span className="text-xs font-bold text-white">{ticket.number}</span>
              {ticket.status === 'approved' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                </div>
              )}
              {ticket.status === 'pending' && (
                <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse"></div>
              )}
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTickets.map(ticket => (
            <button
              key={ticket.id}
              onClick={() => handleTicketClick(ticket)}
              className={`${getStatusClass(ticket.status)} w-full rounded-xl p-3 flex items-center justify-between transition-all duration-200 text-right ${
                ticket.status === 'available' || ticket.status === 'rejected' ? 'cursor-pointer' : 'cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-black/20 flex items-center justify-center font-bold text-sm">
                  {ticket.number}
                </div>
                <div className="text-right">
                  <div className="text-white text-sm font-medium">بطاقة رقم {ticket.number}</div>
                  {ticket.participantName && (
                    <div className="text-slate-400 text-xs">{ticket.participantName}</div>
                  )}
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-lg font-medium ${
                ticket.status === 'approved' ? 'bg-green-500/20 text-green-300' :
                ticket.status === 'pending' ? 'bg-amber-500/20 text-amber-300' :
                'bg-indigo-500/20 text-indigo-300'
              }`}>
                {getStatusLabel(ticket.status)}
              </span>
            </button>
          ))}
        </div>
      )}

      {filteredTickets.length === 0 && (
        <div className="text-center py-16 text-slate-500">
          <div className="text-4xl mb-3">🔍</div>
          <div>لا توجد بطاقات مطابقة للبحث</div>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-6 text-xs text-slate-400 justify-center">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-indigo-700/60 border border-indigo-500/50"></div>
          متاح للحجز
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-amber-800/60 border border-amber-500/50"></div>
          قيد المراجعة
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-green-800/60 border border-green-500/50"></div>
          محجوز
        </div>
      </div>

      {/* Booking Modal */}
      {selectedTicket && (
        <BookingModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}
    </div>
  );
}
