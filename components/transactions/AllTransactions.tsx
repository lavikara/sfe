'use client'
import { useEffect, useState } from 'react'
import type { Transaction } from '@/types/api'
import { Pagination, Card, Drawer, Money } from '@/components/ui'
import { TransactionRow } from '@/components/transactions'
import { useTransactionsStore } from '@/store/transactionsStore'
import { formatDateTime, TRANSACTION_STATUS_LABELS } from '@/lib/format'
import styles from './AllTransactions.module.css'

function getDateKey(date: Date) {
  return `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}`
}

function groupTransactionsByDate(transactions: Transaction[]) {
  const formatGroupDate = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'UTC',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setUTCDate(today.getUTCDate() - 1)
  const todayKey = getDateKey(today)
  const yesterdayKey = getDateKey(yesterday)
  const groups = new Map<string, { label: string; transactions: Transaction[] }>()

  for (const transaction of [...transactions].sort((a, b) => b.createdAt.localeCompare(a.createdAt))) {
    const date = new Date(transaction.createdAt)
    const dateKey = getDateKey(date)
    const label =
      dateKey === todayKey
        ? 'TODAY'
        : dateKey === yesterdayKey
          ? 'YESTERDAY'
          : formatGroupDate.format(date).toUpperCase()
    const group = groups.get(dateKey)

    if (group) {
      group.transactions.push(transaction)
    } else {
      groups.set(dateKey, { label, transactions: [transaction] })
    }
  }

  return [...groups.entries()].map(([key, group]) => ({ key, ...group }))
}

export function AllTransactions() {
  const [selected, setSelected] = useState<Transaction | null>(null)
  const [page, setPageNumber] = useState(1)

  const { transactions, transactionsLoading, transactionsMeta, fetchTransactions } = useTransactionsStore()

  const transactionGroups = groupTransactionsByDate(transactions ?? [])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const setPage = (page: number) => {
    console.log(page)
    setPageNumber(page)
  }

  return (
    <>
      <Card padding="none" className={styles.card}>
        {transactionsLoading ? (
          <p className={styles.message}>Loading transactions…</p>
        ) : transactionGroups.length ? (
          transactionGroups.map((group) => (
            <section className={styles.group} key={group.key}>
              <h2 className={styles.groupHeading}>{group.label}</h2>
              {group.transactions.map((tx) => (
                <TransactionRow key={tx.id} transaction={tx} onSelect={setSelected} />
              ))}
            </section>
          ))
        ) : (
          <p className={styles.message}>No transactions found.</p>
        )}
        <Drawer open={selected !== null} title="Transaction details" onClose={() => setSelected(null)}>
          {selected && (
            <dl className={styles.details}>
              <dt>Reference</dt>
              <dd>{selected.reference}</dd>
              <dt>Amount</dt>
              <dd>
                <Money amount={selected.amount} currency={selected.currency} />
              </dd>
              <dt>Status</dt>
              <dd>{TRANSACTION_STATUS_LABELS[selected.status]}</dd>
              <dt>Date</dt>
              <dd>{formatDateTime(selected.createdAt)}</dd>
            </dl>
          )}
        </Drawer>
      </Card>
      <Pagination
        pagination={
          transactionsMeta
            ? {
                ...transactionsMeta,
                page,
              }
            : null
        }
        onPageChange={setPage}
      />
    </>
  )
}
