'use client'
import { Suspense, useEffect, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { TransactionRow, StatusDot } from '@/components/transactions'
import { Button, Card, Input, Drawer, Select } from '@/components/ui'
import type { TransactionType, TransactionStatus } from '@/types/api'
import { TRANSACTION_TYPE, TRANSACTION_STATUS } from '@/types/api'
import { useUserStore } from '@/store/userStore'
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

  const searchParam = searchParams.get('search') ?? ''
  const rawType = searchParams.get('type')
  const rawStatus = searchParams.get('status')
  const type: TransactionType | 'All Types' =
    TRANSACTION_TYPE.find((value) => value === rawType) ?? 'All Types'
  const status: TransactionStatus | 'All Statuses' =
    TRANSACTION_STATUS.find((value) => value === rawStatus) ?? 'All Statuses'

  const [searchInput, setSearchInput] = useState(searchParam)
  const lastWrittenSearch = useRef(searchParam)

  const { user, userLoading } = useUserStore()

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

  if (userLoading) return <p className={styles.loading}>Loading…</p>

  return (
    <div className={styles.page}>
      <header>
        <h1 className={styles.title}>Transactions</h1>
        <p className={styles.subtitle}>237 transactions</p>
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
      <Card padding="none">
        <div></div>
      </Card>
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