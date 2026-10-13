'use client'
import { BalanceSummary, RatesWidget, RecentTransactions, WalletCard } from '@/components/dashboard'
import { WalletCardsLoading } from '@/components/ui'
import { useUserStore } from '@/store/userStore'
import styles from './page.module.css'

export default function DashboardPage() {

  const { user,userLoading } = useUserStore()


  return (
    <div className={styles.page}>
      <header>
        <h1 className={styles.title}>Welcome back, {user?.firstName}</h1>
        <p className={styles.subtitle}>Here&apos;s what&apos;s happening with your money today.</p>
      </header>

      <BalanceSummary wallets={user?.wallets ?? null} />

      <div className={styles.wallets}>
        {userLoading ? (
          <WalletCardsLoading />
        ) : (
          user?.wallets?.map((wallet) => <WalletCard key={wallet.currency} wallet={wallet} />)
        )}
      </div>

      <div className={styles.columns}>
        <RecentTransactions />
        <RatesWidget base="NGN" />
      </div>
    </div>
  )
}
