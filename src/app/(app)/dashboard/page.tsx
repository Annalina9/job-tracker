'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { JobStatus } from '@/types';
import Link from 'next/link';
import styles from './page.module.css';

const STATUS_ORDER: JobStatus[] = [
  'Wishlist', 'Ready to Apply', 'Applied', 'Phone Screen',
  'Interview', 'Offer', 'Accepted', 'Rejected', 'Passed'
];

const STATUS_COLORS: Record<JobStatus, string> = {
  'Wishlist': 'var(--text-muted)',
  'Ready to Apply': 'var(--blue)',
  'Applied': 'var(--accent-2)',
  'Phone Screen': 'var(--amber)',
  'Interview': 'var(--purple)',
  'Offer': 'var(--teal)',
  'Accepted': 'var(--green)',
  'Rejected': 'var(--rose)',
  'Passed': 'var(--text-muted)',
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { jobs, loading } = useData();

  const statusCounts = jobs.reduce((acc, job) => {
    acc[job.status] = (acc[job.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const activeJobs = jobs.filter(j => !['Rejected', 'Passed', 'Accepted'].includes(j.status));
  const appliedJobs = jobs.filter(j => j.status === 'Applied');
  const interviewJobs = jobs.filter(j => ['Phone Screen', 'Interview'].includes(j.status));

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Good to see you, {user?.displayName?.split(' ')[0]} 👋</h1>
          <p className={styles.subtitle}>Here's where your job search stands today.</p>
        </div>
        <Link href="/tracker/new" className="btn btn-primary" id="add-job-btn">
          + Add Job
        </Link>
      </div>

      {/* Stat Cards */}
      <div className={`${styles.statsGrid} stagger`}>
        <div className="card" style={{ '--i': 0 } as React.CSSProperties}>
          <div className={styles.statLabel}>Total Tracked</div>
          <div className={styles.statValue}>{loading ? '—' : jobs.length}</div>
          <div className={styles.statSub}>across all stages</div>
        </div>
        <div className="card" style={{ '--i': 1 } as React.CSSProperties}>
          <div className={styles.statLabel}>Active Pipeline</div>
          <div className={styles.statValue} style={{ color: 'var(--accent-2)' }}>
            {loading ? '—' : activeJobs.length}
          </div>
          <div className={styles.statSub}>in progress</div>
        </div>
        <div className="card" style={{ '--i': 2 } as React.CSSProperties}>
          <div className={styles.statLabel}>Applied</div>
          <div className={styles.statValue} style={{ color: 'var(--teal)' }}>
            {loading ? '—' : appliedJobs.length}
          </div>
          <div className={styles.statSub}>awaiting response</div>
        </div>
        <div className="card" style={{ '--i': 3 } as React.CSSProperties}>
          <div className={styles.statLabel}>Interviews</div>
          <div className={styles.statValue} style={{ color: 'var(--purple)' }}>
            {loading ? '—' : interviewJobs.length}
          </div>
          <div className={styles.statSub}>phone screen or beyond</div>
        </div>
      </div>

      {/* Pipeline Overview */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Pipeline</h2>
        <div className={styles.pipeline}>
          {STATUS_ORDER.filter(s => !['Accepted', 'Rejected', 'Passed'].includes(s)).map((status) => (
            <div key={status} className={styles.pipelineStage}>
              <div className={styles.pipelineCount} style={{ color: STATUS_COLORS[status] }}>
                {statusCounts[status] || 0}
              </div>
              <div className={styles.pipelineLabel}>{status}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent jobs */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Recent Activity</h2>
          <Link href="/tracker" className="btn btn-ghost btn-sm">View all →</Link>
        </div>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
            <div className="spinner" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3>No jobs yet</h3>
            <p>Start tracking your applications to see them here.</p>
            <Link href="/tracker/new" className="btn btn-primary">Add your first job</Link>
          </div>
        ) : (
          <div className={styles.jobList}>
            {jobs.slice(0, 5).map((job) => (
              <Link key={job.id} href={`/tracker`} className={styles.jobRow}>
                <div className={styles.jobInfo}>
                  <div className={styles.jobTitle}>{job.title}</div>
                  <div className={styles.jobCompany}>{job.company} · {job.location}</div>
                </div>
                <div className={styles.jobRight}>
                  <span className={styles.jobSalary}>{job.salary}</span>
                  <span className={`badge badge-${job.status.toLowerCase().replace(/ /g, '-')}`}>{job.status}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
