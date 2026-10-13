'use client';

import type { PageMeta } from '@/types/api'
import styles from './Pagination.module.css';

export interface PaginationProps {
  pagination?: PageMeta | null;
  onPageChange: (page: number) => void;
  ariaLabel?: string;
}

type PageItem = number | 'ellipsis-start' | 'ellipsis-end';

export function Pagination({
  pagination,
  onPageChange,
  ariaLabel = 'Pagination',
}: PaginationProps) {
  if (!pagination) {
    return null;
  }
  const { total, limit } = pagination;
  const totalPages = Math.ceil(total / limit);
  const safePage = Math.min(Math.max(pagination.page, 1), totalPages);

  const firstItem = (safePage - 1) * limit + 1;
  const lastItem = Math.min(safePage * limit, total);

  const isFirstPage = safePage === 1;
  const isLastPage = safePage === totalPages;
  const items: PageItem[] = [];

  if (totalPages <= 7) {
    for (let page = 1; page <= totalPages; page++) {
      items.push(page);
    }
  } else {
    let windowStart = Math.max(2, safePage - 1);
    let windowEnd = Math.min(totalPages - 1, safePage + 1);

    if (safePage <= 2) {
      windowStart = 2;
      windowEnd = 3;
    }

    if (safePage >= totalPages - 1) {
      windowStart = totalPages - 2;
      windowEnd = totalPages - 1;
    }

    items.push(1);

    if (windowStart > 2) {
      items.push('ellipsis-start');
    }

    for (let page = windowStart; page <= windowEnd; page++) {
      items.push(page);
    }

    if (windowEnd < totalPages - 1) {
      items.push('ellipsis-end');
    }

    items.push(totalPages);
  }

  return (
    <div className={styles.root}>
      <p className={styles.summary} aria-live="polite">
        Showing {firstItem}–{lastItem} of {pagination.total}
      </p>

      <nav className={styles.nav} aria-label={ariaLabel}>
        <button
          type="button"
          className={styles.step}
          onClick={() => onPageChange(safePage - 1)}
          disabled={isFirstPage}
        >
          <svg
            className={styles.icon}
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M10 12L6 8l4-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className={styles.labelFull}>Previous</span>
          <span className={styles.labelShort}>Prev</span>
        </button>

        <ul className={styles.pages}>
          {items.map((item) => {
            if (item === 'ellipsis-start' || item === 'ellipsis-end') {
              return (
                <li key={item} className={styles.ellipsis} aria-hidden="true">
                  …
                </li>
              );
            }

            const isCurrent = item === safePage;

            return (
              <li key={item}>
                <button
                  type="button"
                  className={isCurrent ? `${styles.page} ${styles.pageActive}` : styles.page}
                  onClick={() => onPageChange(item)}
                  aria-label={`Page ${item}`}
                  aria-current={isCurrent ? 'page' : undefined}
                >
                  {item}
                </button>
              </li>
            );
          })}
        </ul>

        <p className={styles.status} aria-live="polite">
          Page {safePage} of {totalPages}
        </p>

        <button
          type="button"
          className={`${styles.step} ${styles.stepNext}`}
          onClick={() => onPageChange(safePage + 1)}
          disabled={isLastPage}
        >
          <span>Next</span>
          <svg
            className={styles.icon}
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M6 4l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </nav>
    </div>
  );
}