import type { Card, Sale } from '../api/types';

export type AuthStackParamList = {
  Login: undefined;
  OtpRequest: { mode: 'setup' | 'forgot' };
  OtpVerify: { phone: string; mode: 'setup' | 'forgot' };
};

export type CardPurpose = 'sale' | 'activate' | 'manage';

export type AppStackParamList = {
  Home: undefined;
  CardLookup: { purpose: CardPurpose };
  SaleAmount: { card: Card };
  SalePin: { card: Card; amount: number; description?: string };
  SaleReceipt: { sale: Sale; cardBalance: number };
  SetCardPin: { card: Card; mode: 'activate' | 'reset' };
  CardManage: { cardNumber: string };
  CardTopup: { card: Card };
  Sales: undefined;
  SaleDetail: { uuid: string };
  FloatStatement: undefined;
  Settings: undefined;
  ChangePin: undefined;
};
