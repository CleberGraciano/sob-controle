export type PaymentMethod = 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX' | 'CASH' | 'BANK_TRANSFER' | 'DIGITAL_WALLET';

export interface AuthResponse {
  token: string;
  userId: number;
  fullName: string;
  email: string;
  role: 'USER' | 'SUPER_ADMIN';
  preferredPaymentMethod: PaymentMethod;
}

export interface Category {
  id: number;
  name: string;
  monthlyLimit: number;
  colorHex: string;
  iconKey: string;
}

export interface Card {
  id: number;
  name: string;
  brand: string;
  lastDigits: string;
  credit: boolean;
}

export interface Expense {
  id: number;
  itemName: string;
  amount: number;
  purchaseDate: string;
  paymentMethod: PaymentMethod;
  categoryId: number;
  category: string;
  cardId?: number | null;
  cardLabel?: string | null;
  installmentPurchase: boolean;
  installmentCount?: number | null;
  installmentValue?: number | null;
  receiptName?: string | null;
  receiptDataUrl?: string | null;
}

export interface CategorySummary {
  categoryId: number;
  category: string;
  colorHex: string;
  iconKey: string;
  spent: number;
  limit: number;
  percentage: number;
}

export interface AlertItem {
  category: string;
  status: 'LIMITE_EXCEDIDO' | 'ATENCAO';
  message: string;
  percentage: number;
}

export interface SuggestionItem {
  title: string;
  description: string;
  potentialMonthlySavings: number;
}

export interface DashboardData {
  monthSpent: number;
  monthlyLimit: number;
  available: number;
  progressPercent: number;
  preferredPaymentMethod: PaymentMethod;
  categories: CategorySummary[];
  recentExpenses: Expense[];
  expenseTrend: { day: number; accumulated: number }[];
  alerts: AlertItem[];
  suggestions: SuggestionItem[];
}

export interface MonthlyReport {
  reference: string;
  totalSpent: number;
  averageDaily: number;
  highestExpense: number;
  totalTransactions: number;
  categories: CategorySummary[];
  expenses: Expense[];
  suggestions: SuggestionItem[];
  insight: string;
}

export interface AdminSettings {
  siteName: string;
  logoUrl: string;
  primaryColor: string;
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  senderEmail: string;
  senderName: string;
}