import { useState, useMemo } from 'react';
import { Search, Ban, CheckCircle, User, Mail, Phone, Ticket } from 'lucide-react';
import { useStore } from '../../store/useStore';
import toast from 'react-hot-toast';

export default function AdminMembers() {
  const { users, tickets, banUser, unbanUser } = useStore();
  const [search, setSearch] = useState('');

  const regularUsers = useMemo(() => {
    return users.filter(u => u.role !== 'admin').filter(u =>
      search === '' ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      (u.email && u.email.includes(search)) ||
      (u.phone && u.phone.includes(search))
    );
  }, [users, search]);

  const getUserTickets = (userId: string) => {
    return tickets.filter(t => t.userId === userId);
  };

  const handleBan = (userId: string, name: string, isBanned: boolean) => {
    if (isBanned) {
      unbanUser(userId);
      toast.success(`تم رفع الحظر عن ${name}`);
    } else {
      banUser(userId);
      toast.success(`تم حظر ${name}`);
    }
  };

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-bold text-white">إدارة الأعضاء</h2>
        <p className="text-slate-400 text-sm">{regularUsers.length} عضو مسجل</p>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={15} className="absolute top-3 right-3 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="بحث بالاسم أو البريد أو الهاتف..."
          className="w-full bg-slate-800/60 border border-slate-700 rounded-xl py-2.5 pr-9 pl-4 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
        />
      </div>

      {regularUsers.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">👥</div>
          <p className="text-slate-400">لا يوجد أعضاء مسجلون</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-700/50">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/50" style={{ background: 'rgba(30,41,59,0.8)' }}>
                <th className="text-right text-slate-400 font-medium py-3 px-4">العضو</th>
                <th className="text-right text-slate-400 font-medium py-3 px-4 hidden sm:table-cell">وسيلة التواصل</th>
                <th className="text-center text-slate-400 font-medium py-3 px-4">البطاقات</th>
                <th className="text-center text-slate-400 font-medium py-3 px-4">الحالة</th>
                <th className="text-center text-slate-400 font-medium py-3 px-4">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {regularUsers.map(user => {
                const userTickets = getUserTickets(user.id);
                const approved = userTickets.filter(t => t.status === 'approved').length;
                const pending = userTickets.filter(t => t.status === 'pending').length;
                return (
                  <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-600/40 flex items-center justify-center shrink-0">
                          <User size={14} className="text-indigo-400" />
                        </div>
                        <div>
                          <div className="text-white font-medium">{user.name}</div>
                          <div className="text-slate-500 text-xs">
                            {new Date(user.createdAt).toLocaleDateString('ar')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 hidden sm:table-cell">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        {user.email ? (
                          <>
                            <Mail size={12} className="text-slate-500" />
                            <span className="text-xs truncate max-w-32">{user.email}</span>
                          </>
                        ) : (
                          <>
                            <Phone size={12} className="text-slate-500" />
                            <span className="text-xs">{user.phone}</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-1 text-indigo-400">
                          <Ticket size={12} />
                          <span className="font-bold">{userTickets.length}</span>
                        </div>
                        {(approved > 0 || pending > 0) && (
                          <div className="flex gap-1 text-xs">
                            {approved > 0 && <span className="text-green-400">✅{approved}</span>}
                            {pending > 0 && <span className="text-amber-400">⏳{pending}</span>}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {user.banned ? (
                        <span className="inline-flex items-center gap-1 text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-1 rounded-lg">
                          <Ban size={10} />
                          محظور
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-1 rounded-lg">
                          <CheckCircle size={10} />
                          نشط
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleBan(user.id, user.name, user.banned)}
                        className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                          user.banned
                            ? 'bg-green-600/80 hover:bg-green-500 text-white'
                            : 'bg-red-600/80 hover:bg-red-500 text-white'
                        }`}
                      >
                        {user.banned ? 'رفع الحظر' : 'حظر'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
