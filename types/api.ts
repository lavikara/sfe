// Domain types for the Acme API. Keep in sync with API.md.

export const CURRENCIES: readonly Currency[] = ['NGN', 'USD', 'GHS']
export const TRANSACTION_TYPE: readonly TransactionType[] = [
  'all_types',
  'withdrawal',
  'transfer_in',
  'transfer_out',
  'conversion',
  'card_payment',
  'bill_payment',
]
export const TRANSACTION_STATUS: readonly TransactionStatus[] = [
  'all_statuses',
  'successful',
  'pending',
  'failed',
  'reversed',
]

export type Currency = 'NGN' | 'USD' | 'GHS'
export type TransactionType =
  | 'all_types'
  | 'deposit'
  | 'withdrawal'
  | 'transfer_in'
  | 'transfer_out'
  | 'conversion'
  | 'card_payment'
  | 'bill_payment'

export type TransactionStatus = 'all_statuses' | 'successful' | 'pending' | 'failed' | 'reversed'
export interface Transaction {
  id: string
  reference: string
  type: TransactionType
  status: TransactionStatus
  currency: Currency
  /** Minor units (kobo / cents / pesewas). Always positive. */
  amount: number
  /** Minor units. */
  fee: number
  /** From upstream providers. Not sanitised. */
  narration: string
  counterparty: string | null
  /** ISO 8601, UTC */
  createdAt: string
}

export interface Wallet {
  currency: Currency
  /** Minor units. */
  balance: number
}

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  avatarUrl: string | null
  tier: 'basic' | 'verified' | 'premium'
  wallets: Wallet[]
}

export interface Rate {
  from: Currency
  to: Currency
  rate: number
  updatedAt: string
}

export interface Conversion {
  id: string
  from: Currency
  to: Currency
  amount: number
  fee: number
  rate: number
  received: number
  status: TransactionStatus
}

export interface PageMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ApiSuccess<T> {
  data: T
  meta?: PageMeta
}

export interface ApiErrorBody {
  error: { code: string; message: string }
}
