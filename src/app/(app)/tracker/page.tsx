'use client';

import { useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { JobStatus } from '@/types';
import Link from 'next/link';
import styles from './page.module.css';
import { JobCard } from '@/components/JobCard';
import { JobFilters } from '@/components/JobFilters';

const ALL_STATUSES: JobStatus[] = [
  'Wishlist', 'Ready to Apply', 'Applied', 'Phone Screen',
  'Interview', 'Offer', 'Accepted', 'Rejected', 'Passed', 'Archived'
];

export default function TrackerPage() {
  const { user } = useAuth();
  const { jobs, coverLetters, loading, updateJob, updateJobStatus } = useData();
  
  const [filter, setFilter] = useState<JobStatus | 'All'>('All');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggleExpand = useCallback((jobId: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(jobId)) next.delete(jobId);
      else next.add(jobId);
      return next;
    });
  }, []);

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchesFilter = filter === 'All' || job.status === filter;
      const matchesSearch = !search ||
        job.company.toLowerCase().includes(search.toLowerCase()) ||
        job.title.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    }).sort((a, b) => {
      if (a.status === 'Archived' && b.status !== 'Archived') return 1;
      if (a.status !== 'Archived' && b.status === 'Archived') return -1;
      return 0;
    });
  }, [jobs, filter, search]);

  const expandAll = () => setExpanded(new Set(filteredJobs.map(j => j.id)));
  const collapseAll = () => setExpanded(new Set());

  const counts = useMemo(() => {
    return jobs.reduce((acc, j) => {
      acc[j.status] = (acc[j.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [jobs]);

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Job Tracker</h1>
          <p className={styles.subtitle}>{jobs.length} jobs across {Object.keys(counts).length} stages</p>
        </div>
        <Link href="/tracker/new" className="btn btn-primary" id="tracker-add-btn">
          + Add Job
        </Link>
      </div>

      <JobFilters
        search={search}
        setSearch={setSearch}
        filter={filter}
        setFilter={setFilter}
        expandAll={expandAll}
        collapseAll={collapseAll}
        totalJobs={jobs.length}
        counts={counts}
        ALL_STATUSES={ALL_STATUSES}
      />

      {/* Job List */}
      {loading ? (
        <div className={styles.loadingWrap}><div className="spinner" /></div>
      ) : filteredJobs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <h3>No jobs found</h3>
          <p>{search ? 'Try a different search term.' : 'Add your first job to get started.'}</p>
          <Link href="/tracker/new" className="btn btn-primary">+ Add Job</Link>
        </div>
      ) : (
        <div className={styles.jobList}>
          {filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              isOpen={expanded.has(job.id)}
              toggleExpand={toggleExpand}
              coverLetters={coverLetters}
              jobs={jobs}
              updateJob={updateJob}
              updateJobStatus={updateJobStatus}
              ALL_STATUSES={ALL_STATUSES}
              linkedCL={coverLetters.find(cl => cl.id === job.coverLetterId)}
            />
          ))}
        </div>
      )}
    </main>
  );
}
