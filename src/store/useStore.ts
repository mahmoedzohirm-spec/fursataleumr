import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TicketStatus = 'available' | 'pending' | 'approved' | 'rejected';
export type UserRole = 'user' | 'admin';

export interface PaymentMethod {
  id: string;
  name: string;
  details: string;
  icon: string;
}

export interface Prize {
  id: string;
  rank: number;
  name: string;
  description: string;
}

export interface User {
  id: string;
  email?: string;
  phone?: string;
  name: string;
  role: UserRole;
  banned: boolean;
  createdAt: string;
}

export interface Ticket {
  id: string;
  number: number;
  status: TicketStatus;
  userId?: string;
  userName?: string;
  userContact?: string;
  participantName?: string;
  paymentMethod?: string;
  transferPhone?: string;
  receiptImage?: string;
  receiptHash?: string;
  rejectionReason?: string;
  bookedAt?: string;
  approvedAt?: string;
}

export interface Settings {
  currencyName: string;
  totalTickets: number;
  ticketPrice: number;
  paymentMethods: PaymentMethod[];
  prizes: Prize[];
  competitionName: string;
}

export interface DrawResult {
  ticketNumber: number;
  userId: string;
  userName: string;
  userContact: string;
  participantName: string;
  transferPhone: string;
  drawnAt: string;
}

interface StoreState {
  currentUser: User | null;
  users: User[];
  passwords: Record<string, string>;
  tickets: Ticket[];
  settings: Settings;
  drawResult: DrawResult | null;
  
  register: (data: { email?: string; phone?: string; name: string; password: string }) => { success: boolean; message: string };
  login: (credential: string, password: string) => { success: boolean; message: string };
  adminLogin: (username: string, password: string) => { success: boolean; message: string };
  logout: () => void;
  initializeTickets: (count: number) => void;
  bookTicket: (ticketId: string, data: { participantName: string; paymentMethod: string; transferPhone: string; receiptImage: string; receiptHash: string; }) => { success: boolean; message: string };
  approveTicket: (ticketId: string) => void;
  rejectTicket: (ticketId: string, reason: string) => void;
  banUser: (userId: string) => void;
  unbanUser: (userId: string) => void;
  updateSettings: (settings: Partial<Settings>) => void;
  addPaymentMethod: (pm: PaymentMethod) => void;
  updatePaymentMethod: (pm: PaymentMethod) => void;
  deletePaymentMethod: (id: string) => void;
  addPrize: (prize: Prize) => void;
  updatePrize: (prize: Prize) => void;
  deletePrize: (id: string) => void;
  setDrawResult: (result: DrawResult) => void;
  resetCompetition: () => void;
}

const defaultSettings: Settings = {
  currencyName: 'ريال',
  totalTickets: 100,
  ticketPrice: 50,
  competitionName: 'فرصة العمر',
  paymentMethods: [
    { id: '1', name: 'جوال باي', details: 'رقم: 0500000000', icon: '📱' },
    { id: '2', name: 'تحويل بنكي', details: 'IBAN: SA0000000000000000000000', icon: '🏦' },
  ],
  prizes: [
    { id: '1', rank: 1, name: 'الجائزة الأولى', description: 'سيارة فارهة' },
    { id: '2', rank: 2, name: 'الجائزة الثانية', description: 'جهاز لابتوب' },
    { id: '3', rank: 3, name: 'الجائزة الثالثة', description: 'ساعة ذكية' },
  ],
};

function generateTickets(count: number): Ticket[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `ticket-${i + 1}`,
    number: i + 1,
    status: 'available' as TicketStatus,
  }));
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: [],
      passwords: {},
      tickets: generateTickets(100),
      settings: defaultSettings,
      drawResult: null,

      register: (data) => {
        const { users } = get();
        const exists = users.find(u => (data.email && u.email === data.email) || (data.phone && u.phone === data.phone));
        if (exists) return { success: false, message: 'المستخدم مسجل مسبقاً' };
        
        const newUser: User = { id: `user-${Date.now()}`, email: data.email, phone: data.phone, name: data.name, role: 'user', banned: false, createdAt: new Date().toISOString() };
        const key = data.email || data.phone || '';
        set(state => ({ users: [...state.users, newUser], passwords: { ...state.passwords, [key]: data.password }, currentUser: newUser }));
        return { success: true, message: 'تم التسجيل بنجاح' };
      },

      login: (cred, pass) => {
        const { users, passwords } = get();
        const user = users.find(u => u.email === cred || u.phone === cred);
        if (!user || user.banned || passwords[cred] !== pass) return { success: false, message: 'بيانات الدخول غير صحيحة أو الحساب محظور' };
        set({ currentUser: user });
        return { success: true, message: 'تم تسجيل الدخول' };
      },

      adminLogin: (u, p) => {
        if (u === 'Mahmoedzohir' && p === '11$$22##Mm') {
          set({ currentUser: { id: 'admin-1', name: 'المسؤول', role: 'admin', banned: false, createdAt: new Date().toISOString() } });
          return { success: true, message: 'أهلاً بك' };
        }
        return { success: false, message: 'خطأ' };
      },

      logout: () => set({ currentUser: null }),

      initializeTickets: (count) => set({ tickets: generateTickets(count) }),

      bookTicket: (ticketId, data) => {
        const { tickets, currentUser } = get();
        if (!currentUser) return { success: false, message: 'يجب تسجيل الدخول' };
        const ticket = tickets.find(t => t.id === ticketId);
        if (!ticket || ticket.status !== 'available') return { success: false, message: 'غير متاحة' };
        
        set(state => ({
          tickets: state.tickets.map(t => t.id === ticketId ? { ...t, status: 'pending', userId: currentUser.id, userName: currentUser.name, ...data, bookedAt: new Date().toISOString() } : t)
        }));
        return { success: true, message: 'تم الطلب' };
      },

      approveTicket: (id) => set(state => ({ tickets: state.tickets.map(t => t.id === id ? { ...t, status: 'approved', approvedAt: new Date().toISOString() } : t) })),
      rejectTicket: (id, reason) => set(state => ({ tickets: state.tickets.map(t => t.id === id ? { ...t, status: 'rejected', rejectionReason: reason } : t) })),
      banUser: (id) => set(state => ({ users: state.users.map(u => u.id === id ? { ...u, banned: true } : u) })),
      unbanUser: (id) => set(state => ({ users: state.users.map(u => u.id === id ? { ...u, banned: false } : u) })),
      updateSettings: (s) => set(state => ({ settings: { ...state.settings, ...s } })),
      addPaymentMethod: (pm) => set(state => ({ settings: { ...state.settings, paymentMethods: [...state.settings.paymentMethods, pm] } })),
      updatePaymentMethod: (pm) => set(state => ({ settings: { ...state.settings, paymentMethods: state.settings.paymentMethods.map(p => p.id === pm.id ? pm : p) } })),
      deletePaymentMethod: (id) => set(state => ({ settings: { ...state.settings, paymentMethods: state.settings.paymentMethods.filter(p => p.id !== id) } })),
      addPrize: (pz) => set(state => ({ settings: { ...state.settings, prizes: [...state.settings.prizes, pz] } })),
      updatePrize: (pz) => set(state => ({ settings: { ...state.settings, prizes: state.settings.prizes.map(p => p.id === pz.id ? pz : p) } })),
      deletePrize: (id) => set(state => ({ settings: { ...state.settings, prizes: state.settings.prizes.filter(p => p.id !== id) } })),
      setDrawResult: (r) => set({ drawResult: r }),
      resetCompetition: () => set(state => ({ tickets: generateTickets(state.settings.totalTickets), drawResult: null })),
    }),
    { name: 'forsatoelomr-store' }
  )
);