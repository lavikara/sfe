'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { Transaction } from '@/types/api'
import { Card, CardHeader, Drawer, TransactionsLoading } from '@/components/ui'
import { TransactionDetails, TransactionRow } from '@/components/transactions'
import { useTransactionsStore } from '@/store/transactionsStore'
import type { TransactionQuery } from '@/lib/api/endpoints'
import styles from './RecentTransactions.module.css'

export function RecentTransactions() {
  const [selected, setSelected] = useState<Transaction | null>(null)
  const { transactions, transactionsLoading, fetchTransactions } = useTransactionsStore()

  useEffect(() => {
    const query: TransactionQuery = {
      limit:5,
    }
    void fetchTransactions(query)
  }, [fetchTransactions])

  return (
    <Card padding="none">
      <div className={styles.header}>
        <CardHeader
          title="Recent transactions"
          action={
            <Link href="/transactions" className={styles.seeAll}>
              See all
            </Link>
          }
        />
      </div>
      {transactionsLoading && <TransactionsLoading count={5} />}
      {!transactionsLoading && !transactions?.length && (
        <p className={styles.message}>No transactions yet.</p>
      )}
      {transactions?.map((tx) => (
        <TransactionRow key={tx.id} transaction={tx} onSelect={setSelected} />
      ))}
      <Drawer open={selected !== null} title="Transaction details" onClose={() => setSelected(null)}>
        {selected && <TransactionDetails transaction={selected} />}
      </Drawer>
    </Card>
  )
}
