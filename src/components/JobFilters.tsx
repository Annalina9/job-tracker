import React from 'react';
import { JobStatus } from '@/types';
import styles from '@/app/(app)/tracker/page.module.css';

interface JobFiltersProps {
  search: string;
  setSearch: (val: string) => void;
  filter: JobStatus | 'All';
  setFilter: (status: JobStatus | 'All') => void;
  expandAll: () => void;
  collapseAll: () => void;
  totalJobs: number;
  counts: Record<string, number>;
  ALL_STATUSES: JobStatus[];
}

export function JobFilters({
  search, setSearch, filter, setFilter, expandAll, collapseAll, totalJobs, counts, ALL_STATUSES
}: JobFiltersProps) {
  return (
    <div className={styles.filters}>
      <div className={styles.filtersRow}>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Search company or role..."
            className={styles.searchInput}
            value={search}
            onChange={e => setSearch(e.target.value)}
            id="tracker-search"
          />
        </div>
        <div className={styles.expandButtons}>
          <button className="btn btn-ghost btn-sm" onClick={expandAll} id="expand-all-btn">
            ↕ Expand All
          </button>
          <button className="btn btn-ghost btn-sm" onClick={collapseAll} id="collapse-all-btn">
            ↔ Collapse All
          </button>
        </div>
      </div>

      <div className={styles.filterPills}>
        <button
          className={`${styles.pill} ${filter === 'All' ? styles.pillActive : ''}`}
          onClick={() => setFilter('All')}
        >
          All <span className={styles.pillCount}>{totalJobs}</span>
        </button>
        {ALL_STATUSES.map(status => (
          <button
            key={status}
            className={`${styles.pill} ${filter === status ? styles.pillActive : ''}`}
            onClick={() => setFilter(status)}
          >
            {status} <span className={styles.pillCount}>{counts[status] || 0}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
