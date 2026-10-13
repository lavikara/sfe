import styles from './EmptyState.module.css'

export interface TransactionsLoadingProps {
  count?: number
}

export function TransactionsLoading({ count = 6 }: TransactionsLoadingProps) {
  return (
    <section className={`${styles.panel} ${styles.listSkeleton}`} aria-busy="true">
      <div className={styles.listSkeletonHeader}>
        <span className={`${styles.skeleton} ${styles.headerSkeleton}`} />
      </div>
      {Array.from({ length: count }, (_, index) => (
        <div className={styles.listSkeletonRow} key={index} aria-hidden="true">
          <span className={`${styles.skeleton} ${styles.avatarSkeleton}`} />
          <div className={styles.listSkeletonText}>
            <span className={`${styles.skeleton} ${styles.shortSkeleton}`} />
            <span className={`${styles.skeleton} ${styles.longSkeleton}`} />
          </div>
          <div className={styles.listSkeletonAmount}>
            <span className={`${styles.skeleton} ${styles.shortSkeleton}`} />
            <span className={`${styles.skeleton} ${styles.tinySkeleton}`} />
          </div>
        </div>
      ))}
      <span className="visually-hidden" role="status">
        Loading transactions
      </span>
    </section>
  )
}
