'use client'
import { Suspense, useEffect, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { TransactionRow } from '@/components/transactions'
import { Pagination, Card, Money, Input, Drawer, Select } from '@/components/ui'
import type { TransactionType, TransactionStatus, Transaction } from '@/types/api'
import { TRANSACTION_TYPE, TRANSACTION_STATUS } from '@/types/api'
import { useUserStore } from '@/store/userStore'
import { useTransactionsStore } from '@/store/transactionsStore'
import { formatDateTime, TRANSACTION_STATUS_LABELS } from '@/lib/format'
import styles from './page.module.css'

function formatOptionLabel(value: string) {
  return value.includes('_') ? value.replaceAll('_', ' ') : value
}

const TRANSACTION_TYPE_OPTIONS = TRANSACTION_TYPE.map((value) => ({
  value,
  label: formatOptionLabel(value),
}))
const TRANSACTION_STATUS_OPTIONS = TRANSACTION_STATUS.map((value) => ({
  value,
  label: formatOptionLabel(value),
}))

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

  for (const transaction of [...transactions].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  )) {
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

function TransactionsContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const searchParam = searchParams.get('search') ?? ''
  const rawType = searchParams.get('type')
  const rawStatus = searchParams.get('status')
  const type: TransactionType | 'All Types' =
    TRANSACTION_TYPE.find((value) => value === rawType) ?? 'All Types'
  const status: TransactionStatus | 'All Statuses' =
    TRANSACTION_STATUS.find((value) => value === rawStatus) ?? 'All Statuses'
  const [selected, setSelected] = useState<Transaction | null>(null)

  const [searchInput, setSearchInput] = useState(searchParam)
  const lastWrittenSearch = useRef(searchParam)
  const [page, setPageNumber] = useState(1)

  const { userLoading } = useUserStore()
  const { transactions, transactionsLoading, transactionsMeta, fetchTransactions } = useTransactionsStore()
  const transactionGroups = groupTransactionsByDate(transactions ?? [])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  useEffect(() => {
    if (searchParam !== lastWrittenSearch.current) {
      lastWrittenSearch.current = searchParam
      setSearchInput(searchParam)
    }
  }, [searchParam])

  useEffect(() => {
    if (searchInput === searchParam) return

    const timeout = setTimeout(() => {
      lastWrittenSearch.current = searchInput
      const params = new URLSearchParams(searchParams.toString())
      if (searchInput) {
        params.set('search', searchInput)
      } else {
        params.delete('search')
      }
      const query = params.toString()
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
    }, 300)

    return () => clearTimeout(timeout)
  }, [searchInput, searchParam, searchParams, pathname, router])

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.target.value)
  }

  const handleTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.target
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'All Types') {
      params.delete('type')
    } else {
      params.set('type', value)
    }
    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.target
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'All Statuses') {
      params.delete('status')
    } else {
      params.set('status', value)
    }
    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  const setPage = (page: number) => {
    console.log(page)
    setPageNumber(page)
  }

  if (userLoading) return <p className={styles.loading}>Loading…</p>

  return (
    <div className={styles.page}>
      <header>
        <h1 className={styles.title}>Transactions</h1>
        <p className={styles.subtitle}>{transactionsMeta?.total || 0} transactions</p>
      </header>

      <div className={styles.row}>
        <Input
          label="Search"
          type="text"
          leadingIcon="search"
          placeholder="Search by reference, name or narration"
          value={searchInput}
          onChange={handleSearchChange}
          fieldClassName={styles.search}
        />
        <Select
          label="Type"
          options={TRANSACTION_TYPE_OPTIONS}
          value={type}
          onChange={handleTypeChange}
          fieldClassName={styles.type}
        />
        <Select
          label="Status"
          options={TRANSACTION_STATUS_OPTIONS}
          value={status}
          onChange={handleStatusChange}
          fieldClassName={styles.status}
        />
      </div>
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
    </div>
  )
}

export default function TransactionsPage() {
  return (
    <Suspense fallback={<p className={styles.loading}>Loading…</p>}>
      <TransactionsContent />
    </Suspense>
  )
}
