'use client'
import { useEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { Transaction } from '@/types/api'
import { TRANSACTION_STATUS, TRANSACTION_TYPE } from '@/types/api'
import type { TransactionQuery } from '@/lib/api/endpoints'
import {
  Pagination,
  Card,
  Drawer,
  NoTransactionsMatch,
  NoTransactionsYet,
  TransactionsLoadError,
  TransactionsLoading,
} from '@/components/ui'
import { TransactionDetails, TransactionRow } from '@/components/transactions'
import { useTransactionsStore } from '@/store/transactionsStore'
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

function getTransactionsQuery(
  page: number,
  limit: number,
  queryText: string,
  type: (typeof TRANSACTION_TYPE)[number] | undefined,
  status: (typeof TRANSACTION_STATUS)[number] | undefined,
): TransactionQuery {
  const normalizedQueryText = queryText.trim()

  return {
    page,
    limit,
    ...(normalizedQueryText ? { q: normalizedQueryText } : {}),
    ...(type && type !== 'all_types' ? { type } : {}),
    ...(status && status !== 'all_statuses' ? { status } : {}),
  }
}

export function AllTransactions() {
  const [selected, setSelected] = useState<Transaction | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const rawPage = Number(searchParams.get('page') ?? 1)
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1
  const rawLimit = Number(searchParams.get('limit') ?? 20)
  const limit = Number.isInteger(rawLimit) && rawLimit > 0 ? rawLimit : 20
  const queryText = searchParams.get('q') ?? ''
  const normalizedQueryText = queryText.trim()
  const type = TRANSACTION_TYPE.find((value) => value === searchParams.get('type'))
  const status = TRANSACTION_STATUS.find((value) => value === searchParams.get('status'))

  const {
    transactions,
    transactionsLoading,
    transactionsError,
    transactionsMeta,
    fetchTransactions,
  } = useTransactionsStore()

  const transactionGroups = groupTransactionsByDate(transactions ?? [])
  const hasActiveFilters = Boolean(
    normalizedQueryText ||
    (type && type !== 'all_types') ||
    (status && status !== 'all_statuses'),
  )

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    void fetchTransactions(getTransactionsQuery(page, limit, normalizedQueryText, type, status))
  }, [fetchTransactions, page, limit, normalizedQueryText, type, status])

  const setPage = (nextPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (nextPage === 1) {
      params.delete('page')
    } else {
      params.set('page', String(nextPage))
    }
    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('q')
    params.delete('type')
    params.delete('status')
    params.delete('page')
    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  const retryFetch = () => {
    void fetchTransactions(getTransactionsQuery(page, limit, normalizedQueryText, type, status))
  }

  return (
    <>
      {transactionsLoading ? (
        <TransactionsLoading />
      ) : transactionsError ? (
        <TransactionsLoadError onRetry={retryFetch} />
      ) : transactionGroups.length ? (
        <Card padding="none" className={styles.card}>
          {transactionGroups.map((group) => (
            <section className={styles.group} key={group.key}>
              <h2 className={styles.groupHeading}>{group.label}</h2>
              {group.transactions.map((tx) => (
                <TransactionRow key={tx.id} transaction={tx} onSelect={setSelected} />
              ))}
            </section>
          ))}
        </Card>
      ) : hasActiveFilters ? (
        <NoTransactionsMatch onClearFilters={clearFilters} />
      ) : (
        <NoTransactionsYet />
      )}
      <Drawer open={selected !== null} title="Transaction details" onClose={() => setSelected(null)}>
        {selected && <TransactionDetails transaction={selected} />}
      </Drawer>
      <Pagination
        pagination={transactionsMeta}
        onPageChange={setPage}
      />
    </>
  )
}
