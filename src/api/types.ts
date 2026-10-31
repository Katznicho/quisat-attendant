export type CanteenSummary = {
  uuid: string;
  name: string;
  location: string | null;
  status: string;
  float_balance: number;
  is_float_low: boolean;
};

export type Attendant = {
  uuid: string;
  name: string;
  phone: string;
  status: string;
  canteen: CanteenSummary | null;
  school: { id: number; name: string; logo_url: string | null } | null;
};

export type StudentSummary = {
  id: number;
  name: string;
  first_name: string;
  class: string | null;
  photo_url: string | null;
};

export type CardStatus = 'inactive' | 'active' | 'blocked';

export type Card = {
  uuid: string;
  card_number: string;
  masked_number: string;
  status: CardStatus;
  is_locked: boolean;
  locked_until: string | null;
  has_pin: boolean;
  balance: number;
  daily_limit: number | null;
  activated_at: string | null;
  student: StudentSummary | null;
  school: { id: number; name: string } | null;
  spent_today?: number;
  remaining_today?: number | null;
};

export type ReversalStatus = 'pending' | 'approved' | 'rejected' | null;

export type Sale = {
  uuid: string;
  receipt_number: string;
  amount: number;
  description: string | null;
  status: 'completed' | 'reversed';
  reversal_status: ReversalStatus;
  reversal_reason: string | null;
  reversal_review_note: string | null;
  can_request_reversal: boolean;
  created_at: string;
  card_number: string | null;
  student: StudentSummary | null;
  canteen: string | null;
  attendant: string | null;
};

export type FloatTransaction = {
  uuid: string;
  type: 'topup' | 'sale' | 'reversal' | string;
  direction: 'credit' | 'debit';
  amount: number;
  balance_after: number;
  description: string | null;
  created_at: string;
};

export type Topup = {
  uuid: string;
  amount: number;
  phone_number: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | string;
  credited_at: string | null;
  created_at: string;
  payment: { reference: string | null; amount: number | null; platform_charge: number | null } | null;
};

export type Pagination = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

export type Dashboard = {
  attendant: Attendant;
  today: { sales_count: number; sales_total: number; my_sales_total: number };
  pending_reversals: number;
};
