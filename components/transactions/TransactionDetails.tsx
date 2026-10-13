'use client'

import { useState } from 'react'
import type { Transaction, TransactionType } from '@/types/api'
import { formatMoney, getInitials, TRANSACTION_TYPE_LABELS } from '@/lib/format'
import { Icon, Money } from '@/components/ui'
import { StatusDot } from './StatusDot'
import styles from './TransactionDetails.module.css'

const CREDIT_TYPES: readonly TransactionType[] = ['deposit', 'transfer_in', 'conversion']
const dateTimeFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'UTC',
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export function TransactionDetails({ transaction }: { transaction: Transaction }) {
  const [copyMessage, setCopyMessage] = useState('')
  const isCredit = CREDIT_TYPES.includes(transaction.type)
  const sign = isCredit ? 'credit' : 'debit'
  const initials = transaction.counterparty
    ? getInitials(transaction.counterparty)
    : getInitials(TRANSACTION_TYPE_LABELS[transaction.type])

  const copyReference = async () => {
    try {
      await navigator.clipboard.writeText(transaction.reference)
      setCopyMessage('Reference copied')
    } catch {
      setCopyMessage('Unable to copy reference')
    }
  }

  return (
    <div className={styles.details}>
      <section className={styles.summary} aria-label="Transaction summary">
        <span className={styles.avatar} aria-hidden="true">{initials}</span>
        <p className={styles.description}>{transaction.narration}</p>
        <p className={styles.heroAmount}>
          <Money amount={transaction.amount} currency={transaction.currency} sign={sign} />
        </p>
        <StatusDot status={transaction.status} />
      </section>

      <section className={styles.section} aria-labelledby="transaction-details-heading">
        <h3 id="transaction-details-heading" className={styles.sectionTitle}>Details</h3>
        <dl className={styles.rows}>
          <div className={styles.row}>
            <dt>Reference</dt>
            <dd className={styles.reference}>
              <span>{transaction.reference}</span>
              <button
                type="button"
                className={styles.copyButton}
                aria-label="Copy transaction reference"
                onClick={copyReference}
              >
                <Icon name="copy" size={16} />
              </button>
            </dd>
          </div>
          <div className={styles.row}>
            <dt>Date</dt>
            <dd>{dateTimeFormatter.format(new Date(transaction.createdAt))}</dd>
          </div>
          <div className={styles.row}>
            <dt>Type</dt>
            <dd>{TRANSACTION_TYPE_LABELS[transaction.type]}</dd>
          </div>
          <div className={styles.row}>
            <dt>Counterparty</dt>
            <dd>{transaction.counterparty ?? '—'}</dd>
          </div>
          <div className={styles.row}>
            <dt>Narration</dt>
            <dd>{transaction.narration}</dd>
          </div>
        </dl>
        <p className={styles.copyMessage} aria-live="polite">{copyMessage}</p>
      </section>

      <section className={`${styles.section} ${styles.financialSection}`} aria-labelledby="transaction-summary-heading">
        <h3 id="transaction-summary-heading" className={styles.sectionTitle}>Summary</h3>
        <dl className={styles.rows}>
          <div className={styles.row}>
            <dt>Amount</dt>
            <dd>{formatMoney(transaction.amount, transaction.currency)}</dd>
          </div>
          <div className={styles.row}>
            <dt>Fee</dt>
            <dd>{formatMoney(transaction.fee, transaction.currency)}</dd>
          </div>
          <div className={`${styles.row} ${styles.totalRow}`}>
            <dt>Total</dt>
            <dd>{formatMoney(transaction.amount + transaction.fee, transaction.currency)}</dd>
          </div>
        </dl>
      </section>
    </div>
  )
}
