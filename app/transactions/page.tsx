'use client'
import { useState } from 'react'
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

export default function TransactionsPage() {
  const [type, setType] = useState<TransactionType | 'All Types'>('All Types')
  const [status, setStatus] = useState<TransactionStatus | 'All Statuses'>('All Statuses')
  const [search, setSearch] = useState('')

  const { user, userLoading } = useUserStore()

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement >) => {
    const { value } = event.target
    setSearch(value )
  }

  const handleTypeChange = (event: React.ChangeEvent< HTMLSelectElement>) => {
    const { value } = event.target
    setType(value as TransactionType)
  }

  const handleStatusChange = (event: React.ChangeEvent< HTMLSelectElement>) => {
    const { value } = event.target
    setStatus(value as TransactionStatus)
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
          value={search}
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
