import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

import type {
  Attendant,
  Card,
  Dashboard,
  FloatTransaction,
  Pagination,
  Sale,
  Topup,
} from './types';

const BASE_URL: string =
  (Constants.expoConfig?.extra as { apiUrl?: string } | undefined)?.apiUrl ??
  'https://app.quisat.com/api/v1';

const TOKEN_KEY = 'quisat_attendant_token';

/** A failed API call. `message` is safe to show to the attendant. */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string | null,
  ) {
    super(message);
  }
}

let unauthorizedHandler: (() => void) | null = null;

/** Called when the server rejects the token (expired, attendant disabled, canteen closed…). */
export function onUnauthorized(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

export const tokenStore = {
  get: () => SecureStore.getItemAsync(TOKEN_KEY),
  set: (token: string) => SecureStore.setItemAsync(TOKEN_KEY, token),
  clear: () => SecureStore.deleteItemAsync(TOKEN_KEY),
};

type Method = 'GET' | 'POST' | 'PUT';

async function request<T>(
  method: Method,
  path: string,
  body?: Record<string, unknown>,
  query?: Record<string, string | number | boolean | undefined>,
): Promise<T> {
  const token = await tokenStore.get();
  const search = new URLSearchParams();
  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      search.append(key, typeof value === 'boolean' ? (value ? '1' : '0') : String(value));
    }
  });
  const qs = search.toString();

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}/attendant/${path}${qs ? `?${qs}` : ''}`, {
      method,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('No connection. Check the internet and try again.', 0, 'network');
  }

  let json: any = null;
  try {
    json = await response.json();
  } catch {
    // Non-JSON error page.
  }

  if (!response.ok || json?.success === false) {
    const firstValidationError = json?.errors
      ? (Object.values(json.errors as Record<string, string[]>).flat()[0] as string | undefined)
      : undefined;
    const message =
      firstValidationError ||
      json?.message ||
      (response.status >= 500 ? 'Something went wrong on the server. Try again.' : `Error ${response.status}`);

    if (token && (response.status === 401 || (response.status === 403 && path !== 'auth/login'))) {
      unauthorizedHandler?.();
    }

    throw new ApiError(message, response.status, json?.error ?? null);
  }

  return json as T;
}

type Ok<T> = { success: true; message?: string; data: T };

export const api = {
  // Auth
  requestOtp: (phone: string) => request<{ success: true; message: string }>('POST', 'auth/request-otp', { phone }),
  verifyOtp: (phone: string, otp: string, pin: string) =>
    request<Ok<{ token: string; attendant: Attendant }>>('POST', 'auth/verify-otp', {
      phone,
      otp,
      pin,
      pin_confirmation: pin,
    }),
  login: (phone: string, pin: string) =>
    request<Ok<{ token: string; attendant: Attendant }>>('POST', 'auth/login', {
      phone,
      pin,
      device_name: `${Constants.deviceName ?? 'attendant-device'}`.slice(0, 100),
    }),
  me: () => request<Ok<{ attendant: Attendant }>>('GET', 'me'),
  changePin: (currentPin: string, pin: string) =>
    request<{ success: true; message: string }>('POST', 'auth/change-pin', {
      current_pin: currentPin,
      pin,
      pin_confirmation: pin,
    }),
  logout: () => request<{ success: true }>('POST', 'auth/logout'),

  // Canteen
  dashboard: () => request<Ok<Dashboard>>('GET', 'dashboard'),
  floatStatement: (page = 1) =>
    request<Ok<{ canteen: Attendant['canteen']; transactions: FloatTransaction[]; pagination: Pagination }>>(
      'GET',
      'float/statement',
      undefined,
      { page },
    ),

  // Cards
  card: (cardNumber: string) => request<Ok<{ card: Card }>>('GET', `cards/${encodeURIComponent(cardNumber)}`),
  activateCard: (cardNumber: string, pin: string) =>
    request<Ok<{ card: Card }>>('POST', `cards/${encodeURIComponent(cardNumber)}/activate`, {
      pin,
      pin_confirmation: pin,
    }),
  resetCardPin: (cardNumber: string, pin: string) =>
    request<{ success: true; message: string }>('POST', `cards/${encodeURIComponent(cardNumber)}/reset-pin`, {
      pin,
      pin_confirmation: pin,
    }),
  topupCard: (cardNumber: string, amount: number, phoneNumber: string) =>
    request<Ok<{ topup: Topup }>>('POST', `cards/${encodeURIComponent(cardNumber)}/topups`, {
      amount,
      phone_number: phoneNumber,
    }),
  topup: (uuid: string) => request<Ok<{ topup: Topup }>>('GET', `topups/${uuid}`),

  // Sales
  makeSale: (cardNumber: string, amount: number, pin: string, description?: string) =>
    request<Ok<{ sale: Sale; card_balance: number; float_balance: number }>>('POST', 'sales', {
      card_number: cardNumber,
      amount,
      pin,
      description: description || undefined,
    }),
  sales: (params: { page?: number; mine?: boolean; date?: string; reversal_status?: string }) =>
    request<Ok<{ sales: Sale[]; pagination: Pagination }>>('GET', 'sales', undefined, params),
  sale: (uuid: string) => request<Ok<{ sale: Sale }>>('GET', `sales/${uuid}`),
  requestReversal: (uuid: string, reason: string) =>
    request<Ok<{ sale: Sale }>>('POST', `sales/${uuid}/reversal`, { reason }),
};
