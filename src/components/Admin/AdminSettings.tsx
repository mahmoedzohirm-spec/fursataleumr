import { useState } from 'react';
import { Save, Plus, Trash2, Edit2, Check, X, RefreshCw, AlertTriangle } from 'lucide-react';
import { useStore, PaymentMethod, Prize } from '../../store/useStore';
import toast from 'react-hot-toast';

export default function AdminSettings() {
  const {
    settings,
    updateSettings,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    addPrize,
    updatePrize,
    deletePrize,
    resetCompetition,
    initializeTickets,
  } = useStore();

  const [generalForm, setGeneralForm] = useState({
    currencyName: settings.currencyName,
    totalTickets: settings.totalTickets.toString(),
    ticketPrice: settings.ticketPrice.toString(),
    competitionName: settings.competitionName,
  });

  // Payment Methods
  const [editingPM, setEditingPM] = useState<PaymentMethod | null>(null);
  const [newPM, setNewPM] = useState({ name: '', details: '', icon: '💳' });
  const [showAddPM, setShowAddPM] = useState(false);

  // Prizes
  const [editingPrize, setEditingPrize] = useState<Prize | null>(null);
  const [newPrize, setNewPrize] = useState({ rank: 1, name: '', description: '' });
  const [showAddPrize, setShowAddPrize] = useState(false);

  // Reset
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSaveGeneral = () => {
    const total = parseInt(generalForm.totalTickets);
    const price = parseFloat(generalForm.ticketPrice);
    if (isNaN(total) || total < 1 || total > 10000) {
      toast.error('العدد يجب أن يكون بين 1 و 10000');
      return;
    }
    if (isNaN(price) || price < 0) {
      toast.error('السعر غير صحيح');
      return;
    }
    updateSettings({
      currencyName: generalForm.currencyName,
      totalTickets: total,
      ticketPrice: price,
      competitionName: generalForm.competitionName,
    });
    if (total !== settings.totalTickets) {
      initializeTickets(total);
    }
    toast.success('تم حفظ الإعدادات بنجاح ✅');
  };

  const handleAddPM = () => {
    if (!newPM.name.trim()) { toast.error('يجب إدخال اسم طريقة الدفع'); return; }
    addPaymentMethod({ ...newPM, id: `pm-${Date.now()}` });
    setNewPM({ name: '', details: '', icon: '💳' });
    setShowAddPM(false);
    toast.success('تمت إضافة طريقة الدفع');
  };

  const handleUpdatePM = () => {
    if (!editingPM) return;
    updatePaymentMethod(editingPM);
    setEditingPM(null);
    toast.success('تم تحديث طريقة الدفع');
  };

  const handleAddPrize = () => {
    if (!newPrize.name.trim()) { toast.error('يجب إدخال اسم الجائزة'); return; }
    addPrize({ ...newPrize, id: `prize-${Date.now()}` });
    setNewPrize({ rank: settings.prizes.length + 1, name: '', description: '' });
    setShowAddPrize(false);
    toast.success('تمت إضافة الجائزة');
  };

  const handleUpdatePrize = () => {
    if (!editingPrize) return;
    updatePrize(editingPrize);
    setEditingPrize(null);
    toast.success('تم تحديث الجائزة');
  };

  const handleReset = () => {
    resetCompetition();
    setShowResetConfirm(false);
    toast.success('تم إعادة تعيين المسابقة بنجاح');
  };

  const inputClass = "w-full bg-slate-800/60 border border-slate-600 rounded-xl py-2.5 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors text-sm";
  const sectionClass = "rounded-xl p-5 mb-4";
  const sectionStyle = { background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(99,102,241,0.2)' };

  return (
    <div className="space-y-4">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-white">الإعدادات</h2>
        <p className="text-slate-400 text-sm">إدارة إعدادات المسابقة</p>
      </div>

      {/* General Settings */}
      <div className={sectionClass} style={sectionStyle}>
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          ⚙️ الإعدادات العامة
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div>
            <label className="text-slate-400 text-xs mb-1 block">اسم المسابقة</label>
            <input
              type="text"
              value={generalForm.competitionName}
              onChange={e => setGeneralForm(p => ({ ...p, competitionName: e.target.value }))}
              placeholder="فرصة العمر"
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-slate-400 text-xs mb-1 block">اسم العملة</label>
            <input
              type="text"
              value={generalForm.currencyName}
              onChange={e => setGeneralForm(p => ({ ...p, currencyName: e.target.value }))}
              placeholder="ريال"
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-slate-400 text-xs mb-1 block">العدد الكلي للبطاقات</label>
            <input
              type="number"
              value={generalForm.totalTickets}
              onChange={e => setGeneralForm(p => ({ ...p, totalTickets: e.target.value }))}
              min={1}
              max={10000}
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-slate-400 text-xs mb-1 block">سعر البطاقة</label>
            <input
              type="number"
              value={generalForm.ticketPrice}
              onChange={e => setGeneralForm(p => ({ ...p, ticketPrice: e.target.value }))}
              min={0}
              className={inputClass}
            />
          </div>
        </div>
        <button
          onClick={handleSaveGeneral}
          className="btn-primary px-5 py-2.5 rounded-xl text-white font-medium text-sm flex items-center gap-2"
        >
          <Save size={15} />
          حفظ الإعدادات
        </button>
      </div>

      {/* Payment Methods */}
      <div className={sectionClass} style={sectionStyle}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold flex items-center gap-2">💳 طرق الدفع</h3>
          <button
            onClick={() => setShowAddPM(true)}
            className="flex items-center gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg transition-colors"
          >
            <Plus size={13} />
            إضافة
          </button>
        </div>

        {showAddPM && (
          <div className="mb-4 p-4 rounded-xl border border-indigo-500/40 bg-indigo-500/5">
            <div className="grid grid-cols-3 gap-2 mb-3">
              <input
                type="text"
                value={newPM.icon}
                onChange={e => setNewPM(p => ({ ...p, icon: e.target.value }))}
                placeholder="أيقونة"
                className={inputClass + ' col-span-1'}
              />
              <input
                type="text"
                value={newPM.name}
                onChange={e => setNewPM(p => ({ ...p, name: e.target.value }))}
                placeholder="اسم طريقة الدفع"
                className={inputClass + ' col-span-2'}
              />
            </div>
            <input
              type="text"
              value={newPM.details}
              onChange={e => setNewPM(p => ({ ...p, details: e.target.value }))}
              placeholder="التفاصيل (رقم الحساب، IBAN...)"
              className={inputClass + ' mb-3'}
            />
            <div className="flex gap-2">
              <button onClick={handleAddPM} className="flex items-center gap-1 text-xs bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded-lg transition-colors">
                <Check size={13} /> حفظ
              </button>
              <button onClick={() => setShowAddPM(false)} className="flex items-center gap-1 text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg transition-colors">
                <X size={13} /> إلغاء
              </button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {settings.paymentMethods.map(pm => (
            <div key={pm.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40">
              {editingPM?.id === pm.id ? (
                <div className="flex-1 space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      value={editingPM.icon}
                      onChange={e => setEditingPM(p => p ? { ...p, icon: e.target.value } : null)}
                      className={inputClass + ' col-span-1'}
                    />
                    <input
                      value={editingPM.name}
                      onChange={e => setEditingPM(p => p ? { ...p, name: e.target.value } : null)}
                      className={inputClass + ' col-span-2'}
                    />
                  </div>
                  <input
                    value={editingPM.details}
                    onChange={e => setEditingPM(p => p ? { ...p, details: e.target.value } : null)}
                    className={inputClass}
                  />
                  <div className="flex gap-2">
                    <button onClick={handleUpdatePM} className="flex items-center gap-1 text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg">
                      <Check size={13} /> حفظ
                    </button>
                    <button onClick={() => setEditingPM(null)} className="flex items-center gap-1 text-xs bg-slate-700 text-white px-3 py-1.5 rounded-lg">
                      <X size={13} /> إلغاء
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <span className="text-xl">{pm.icon}</span>
                  <div className="flex-1">
                    <div className="text-white text-sm font-medium">{pm.name}</div>
                    <div className="text-slate-400 text-xs">{pm.details}</div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => setEditingPM(pm)} className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors">
                      <Edit2 size={13} className="text-slate-400" />
                    </button>
                    <button onClick={() => { deletePaymentMethod(pm.id); toast.success('تم حذف طريقة الدفع'); }} className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors">
                      <Trash2 size={13} className="text-red-400" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Prizes */}
      <div className={sectionClass} style={sectionStyle}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold flex items-center gap-2">🏆 الجوائز</h3>
          <button
            onClick={() => { setShowAddPrize(true); setNewPrize({ rank: settings.prizes.length + 1, name: '', description: '' }); }}
            className="flex items-center gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg transition-colors"
          >
            <Plus size={13} />
            إضافة جائزة
          </button>
        </div>

        {showAddPrize && (
          <div className="mb-4 p-4 rounded-xl border border-yellow-500/40 bg-yellow-500/5">
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div>
                <label className="text-slate-400 text-xs mb-1 block">الترتيب</label>
                <input
                  type="number"
                  value={newPrize.rank}
                  onChange={e => setNewPrize(p => ({ ...p, rank: parseInt(e.target.value) }))}
                  min={1}
                  className={inputClass}
                />
              </div>
              <div className="col-span-2">
                <label className="text-slate-400 text-xs mb-1 block">اسم الجائزة</label>
                <input
                  type="text"
                  value={newPrize.name}
                  onChange={e => setNewPrize(p => ({ ...p, name: e.target.value }))}
                  placeholder="الجائزة الأولى"
                  className={inputClass}
                />
              </div>
            </div>
            <input
              type="text"
              value={newPrize.description}
              onChange={e => setNewPrize(p => ({ ...p, description: e.target.value }))}
              placeholder="وصف الجائزة"
              className={inputClass + ' mb-3'}
            />
            <div className="flex gap-2">
              <button onClick={handleAddPrize} className="flex items-center gap-1 text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg">
                <Check size={13} /> حفظ
              </button>
              <button onClick={() => setShowAddPrize(false)} className="flex items-center gap-1 text-xs bg-slate-700 text-white px-3 py-1.5 rounded-lg">
                <X size={13} /> إلغاء
              </button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {settings.prizes.sort((a, b) => a.rank - b.rank).map(prize => (
            <div key={prize.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40">
              {editingPrize?.id === prize.id ? (
                <div className="flex-1 space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="number"
                      value={editingPrize.rank}
                      onChange={e => setEditingPrize(p => p ? { ...p, rank: parseInt(e.target.value) } : null)}
                      className={inputClass}
                    />
                    <input
                      value={editingPrize.name}
                      onChange={e => setEditingPrize(p => p ? { ...p, name: e.target.value } : null)}
                      className={inputClass + ' col-span-2'}
                    />
                  </div>
                  <input
                    value={editingPrize.description}
                    onChange={e => setEditingPrize(p => p ? { ...p, description: e.target.value } : null)}
                    className={inputClass}
                  />
                  <div className="flex gap-2">
                    <button onClick={handleUpdatePrize} className="flex items-center gap-1 text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg">
                      <Check size={13} /> حفظ
                    </button>
                    <button onClick={() => setEditingPrize(null)} className="flex items-center gap-1 text-xs bg-slate-700 text-white px-3 py-1.5 rounded-lg">
                      <X size={13} /> إلغاء
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-xl shrink-0">
                    {prize.rank === 1 ? '🥇' : prize.rank === 2 ? '🥈' : prize.rank === 3 ? '🥉' : `#${prize.rank}`}
                  </div>
                  <div className="flex-1">
                    <div className="text-white text-sm font-medium">{prize.name}</div>
                    <div className="text-slate-400 text-xs">{prize.description}</div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => setEditingPrize(prize)} className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors">
                      <Edit2 size={13} className="text-slate-400" />
                    </button>
                    <button onClick={() => { deletePrize(prize.id); toast.success('تم حذف الجائزة'); }} className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors">
                      <Trash2 size={13} className="text-red-400" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-xl p-5" style={{ background: 'rgba(127,29,29,0.3)', border: '1px solid rgba(239,68,68,0.4)' }}>
        <h3 className="text-red-400 font-semibold mb-2 flex items-center gap-2">
          <AlertTriangle size={17} />
          منطقة الخطر
        </h3>
        <p className="text-slate-400 text-sm mb-4">إعادة تعيين المسابقة ستمسح جميع الطلبات والحجوزات وتعيد جميع البطاقات للحالة المتاحة.</p>
        
        {showResetConfirm ? (
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors"
            >
              <RefreshCw size={15} />
              تأكيد إعادة التعيين
            </button>
            <button
              onClick={() => setShowResetConfirm(false)}
              className="bg-slate-700 hover:bg-slate-600 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors"
            >
              إلغاء
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-2 border border-red-500/60 text-red-400 hover:bg-red-500/10 px-5 py-2.5 rounded-xl font-medium text-sm transition-colors"
          >
            <RefreshCw size={15} />
            إعادة تعيين المسابقة
          </button>
        )}
      </div>
    </div>
  );
}
