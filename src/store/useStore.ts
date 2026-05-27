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
  // Auth
  currentUser: User | null;
  users: User[];
  passwords: Record<string, string>; // credential -> hashed password (simple for demo)
  
  // Tickets
  tickets: Ticket[];
  
  // Settings
  settings: Settings;
  
  // Draw
  drawResult: DrawResult | null;
  
  // Used receipt hashes
  usedReceiptHashes: string[];
  
  // Actions - Auth
  register: (data: { email?: string; phone?: string; name: string; password: string }) => { success: boolean; message: string };
  login: (credential: string, password: string) => { success: boolean; message: string };
  adminLogin: (username: string, password: string) => { success: boolean; message: string };
  logout: () => void;
  
  // Actions - Tickets
  initializeTickets: (count: number) => void;
  bookTicket: (ticketId: string, data: {
    participantName: string;
    paymentMethod: string;
    transferPhone: string;
    receiptImage: string;
    receiptHash: string;
  }) => { success: boolean; message: string };
  approveTicket: (ticketId: string) => void;
  rejectTicket: (ticketId: string, reason: string) => void;
  
  // Actions - Admin
  banUser: (userId: string) => void;
  unbanUser: (userId: string) => void;
  
  // Actions - Settings
  updateSettings: (settings: Partial<Settings>) => void;
  addPaymentMethod: (pm: PaymentMethod) => void;
  updatePaymentMethod: (pm: PaymentMethod) => void;
  deletePaymentMethod: (id: string) => void;
  addPrize: (prize: Prize) => void;
  updatePrize: (prize: Prize) => void;
  deletePrize: (id: string) => void;
  
  // Actions - Draw
  setDrawResult: (result: DrawResult) => void;
  
  // Actions - Reset
  resetCompetition: () => void;
}

// Stored passwords map (in real app this would be hashed server-side)
const passwordsMap: Record<string, string> = {};

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
      tickets: generateTickets(100),
      settings: defaultSettings,
      drawResult: null,
      usedReceiptHashes: [],

      register: (data) => {
        const { users } = get();
        
        if (!data.email && !data.phone) {
          return { success: false, message: 'يجب إدخال البريد الإلكتروني أو رقم الهاتف' };
        }
        
        const exists = users.find(u => 
          (data.email && u.email === data.email) || 
          (data.phone && u.phone === data.phone)
        );
        
        if (exists) {
          return { success: false, message: 'المستخدم مسجل مسبقاً' };
        }
        
        const newUser: User = {
          id: `user-${Date.now()}`,
          email: data.email,
          phone: data.phone,
          name: data.name,
          role: 'user',
          banned: false,
          createdAt: new Date().toISOString(),
        };
        
        const credentialKey = data.email || data.phone || '';
        passwordsMap[credentialKey] = data.password;
        
        set(state => ({
          users: [...state.users, newUser],
          currentUser: newUser,
        }));
        
        return { success: true, message: 'تم التسجيل بنجاح' };
      },

      login: (credential, password) => {
        const { users } = get();
        
        const user = users.find(u => 
          u.email === credential || u.phone === credential
        );
        
        if (!user) {
          return { success: false, message: 'المستخدم غير موجود' };
        }
        
        if (user.banned) {
          return { success: false, message: 'تم حظر هذا الحساب' };
        }
        
        const storedPassword = passwordsMap[credential];
        if (storedPassword !== password) {
          return { success: false, message: 'كلمة المرور غير صحيحة' };
        }
        
        set({ currentUser: user });
        return { success: true, message: 'تم تسجيل الدخول بنجاح' };
      },

      adminLogin: (username, password) => {
        if (username === 'Mahmoedzohir' && password === '11$$22##Mm') {
          const adminUser: User = {
            id: 'admin-1',
            name: 'المسؤول',
            email: 'admin@forsatoelomr.com',
            role: 'admin',
            banned: false,
            createdAt: new Date().toISOString(),
          };
          set({ currentUser: adminUser });
          return { success: true, message: 'مرحباً بك في لوحة التحكم' };
        }
        return { success: false, message: 'اسم المستخدم أو كلمة المرور غير صحيحة' };
      },

      logout: () => {
        set({ currentUser: null });
      },

      initializeTickets: (count) => {
        set({ tickets: generateTickets(count) });
      },

      bookTicket: (ticketId, data) => {
        const { tickets, currentUser, usedReceiptHashes } = get();
        
        if (!currentUser) {
          return { success: false, message: 'يجب تسجيل الدخول أولاً' };
        }
        
        if (usedReceiptHashes.includes(data.receiptHash)) {
          return { success: false, message: 'تم استخدام صورة الإشعار هذه مسبقاً' };
        }
        
        const ticket = tickets.find(t => t.id === ticketId);
        if (!ticket || ticket.status !== 'available') {
          return { success: false, message: 'هذه البطاقة غير متاحة' };
        }
        
        set(state => ({
          tickets: state.tickets.map(t => 
            t.id === ticketId ? {
              ...t,
              status: 'pending' as TicketStatus,
              userId: currentUser.id,
              userName: currentUser.name,
              userContact: currentUser.email || currentUser.phone || '',
              participantName: data.participantName,
              paymentMethod: data.paymentMethod,
              transferPhone: data.transferPhone,
              receiptImage: data.receiptImage,
              receiptHash: data.receiptHash,
              bookedAt: new Date().toISOString(),
            } : t
          ),
          usedReceiptHashes: [...state.usedReceiptHashes, data.receiptHash],
        }));
        
        return { success: true, message: 'تم تقديم الطلب بنجاح، سيتم مراجعته قريباً' };
      },

      approveTicket: (ticketId) => {
        set(state => ({
          tickets: state.tickets.map(t => 
            t.id === ticketId ? {
              ...t,
              status: 'approved' as TicketStatus,
              approvedAt: new Date().toISOString(),
            } : t
          ),
        }));
      },

      rejectTicket: (ticketId, reason) => {
        const rejectedTicket = get().tickets.find(t => t.id === ticketId);
        set(state => ({
          tickets: state.tickets.map(t => 
            t.id === ticketId ? {
              ...t,
              status: 'rejected' as TicketStatus,
              rejectionReason: reason,
            } : t
          ),
          usedReceiptHashes: rejectedTicket?.receiptHash
            ? state.usedReceiptHashes.filter(h => h !== rejectedTicket.receiptHash)
            : state.usedReceiptHashes,
        }));
      },

      banUser: (userId) => {
        set(state => ({
          users: state.users.map(u => 
            u.id === userId ? { ...u, banned: true } : u
          ),
        }));
      },

      unbanUser: (userId) => {
        set(state => ({
          users: state.users.map(u => 
            u.id === userId ? { ...u, banned: false } : u
          ),
        }));
      },

      updateSettings: (newSettings) => {
        const old = get().settings;
        const updated = { ...old, ...newSettings };
        
        if (newSettings.totalTickets && newSettings.totalTickets !== old.totalTickets) {
          set({
            settings: updated,
            tickets: generateTickets(newSettings.totalTickets!),
          });
        } else {
          set({ settings: updated });
        }
      },

      addPaymentMethod: (pm) => {
        set(state => ({
          settings: {
            ...state.settings,
            paymentMethods: [...state.settings.paymentMethods, pm],
          },
        }));
      },

      updatePaymentMethod: (pm) => {
        set(state => ({
          settings: {
            ...state.settings,
            paymentMethods: state.settings.paymentMethods.map(p => p.id === pm.id ? pm : p),
          },
        }));
      },

      deletePaymentMethod: (id) => {
        set(state => ({
          settings: {
            ...state.settings,
            paymentMethods: state.settings.paymentMethods.filter(p => p.id !== id),
          },
        }));
      },

      addPrize: (prize) => {
        set(state => ({
          settings: {
            ...state.settings,
            prizes: [...state.settings.prizes, prize],
          },
        }));
      },

      updatePrize: (prize) => {
        set(state => ({
          settings: {
            ...state.settings,
            prizes: state.settings.prizes.map(p => p.id === prize.id ? prize : p),
          },
        }));
      },

      deletePrize: (id) => {
        set(state => ({
          settings: {
            ...state.settings,
            prizes: state.settings.prizes.filter(p => p.id !== id),
          },
        }));
      },

      setDrawResult: (result) => {
        set({ drawResult: result });
      },

      resetCompetition: () => {
        const { settings } = get();
        set({
          tickets: generateTickets(settings.totalTickets),
          drawResult: null,
          usedReceiptHashes: [],
        });
      },
    }),
    {
      name: 'forsatoelomr-store',
    }
  )
);
