'use client'
import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { AllTransactions } from '@/components/transactions'
import { Input, Select } from '@/components/ui'
import type { TransactionType, TransactionStatus } from '@/types/api'
import { TRANSACTION_TYPE, TRANSACTION_STATUS } from '@/types/api'
import { useUserStore } from '@/store/userStore'
import { useTransactionsStore } from '@/store/transactionsStore'
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

function TransactionsContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const searchParam = searchParams.get('q') ?? ''
  const rawType = searchParams.get('type')
  const rawStatus = searchParams.get('status')
  const type: TransactionType =
    TRANSACTION_TYPE.find((value) => value === rawType) ?? 'all_types'
  const status: TransactionStatus =
    TRANSACTION_STATUS.find((value) => value === rawStatus) ?? 'all_statuses'

  const [searchInput, setSearchInput] = useState(searchParam)
  const lastWrittenSearch = useRef(searchParam)

  const { userLoading } = useUserStore()
  const { transactionsMeta } = useTransactionsStore()

  const updateParam = useCallback(
    (key: 'q' | 'type' | 'status', value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      params.delete('page')
      const query = params.toString()
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
    },
    [pathname, router, searchParams],
  )

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
      updateParam('q', searchInput)
    }, 1000)

    return () => clearTimeout(timeout)
  }, [searchInput, searchParam, updateParam])

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.target.value)
  }

  const handleTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.target
    updateParam('type', value === 'all_types' ? '' : value)
  }

  const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.target
    updateParam('status', value === 'all_statuses' ? '' : value)
  }

  if (userLoading) return <p className={styles.loading}>Loading…</p>

  return (
    <div className={styles.page}>
      <header>
        <h1 className={styles.title}>Transactions</h1>
        <p className={styles.subtitle}>{transactionsMeta?.total ?? 0} transactions</p>
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
      <AllTransactions />
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