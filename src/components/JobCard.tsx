import React from 'react';
import Link from 'next/link';
import { Job, JobStatus, CoverLetter } from '@/types';
import styles from '@/app/(app)/tracker/page.module.css';

interface JobCardProps {
  job: Job;
  isOpen: boolean;
  toggleExpand: (id: string) => void;
  coverLetters: CoverLetter[];
  updateJob: (id: string, updates: Partial<Job>) => Promise<void>;
  updateJobStatus: (id: string, status: JobStatus) => Promise<void>;
  ALL_STATUSES: JobStatus[];
  linkedCL?: CoverLetter;
}

export function JobCard({
  job,
  isOpen,
  toggleExpand,
  coverLetters,
  updateJob,
  updateJobStatus,
  ALL_STATUSES,
  linkedCL
}: JobCardProps) {
  
  function getResumeBadge(type: string) {
    if (type === 'Leader') return 'badge-leader';
    if (type === 'Builder') return 'badge-builder';
    if (type === 'Regular') return 'badge-regular';
    return '';
  }

  function getStatusClass(status: JobStatus): string {
    const map: Record<JobStatus, string> = {
      'Wishlist': styles.statusWishlist,
      'Ready to Apply': styles.statusReady,
      'Applied': styles.statusApplied,
      'Phone Screen': styles.statusPhone,
      'Interview': styles.statusInterview,
      'Offer': styles.statusOffer,
      'Accepted': styles.statusAccepted,
      'Rejected': styles.statusRejected,
      'Passed': styles.statusPassed,
      'Archived': styles.statusArchived,
    };
    return map[status] || '';
  }

  return (
    <div className={`${styles.jobCard} ${isOpen ? styles.jobCardOpen : ''} ${job.status === 'Archived' ? styles.jobCardArchived : ''}`}>
      {/* Summary Row */}
      <div className={styles.summaryRow} onClick={() => toggleExpand(job.id)}>
        <div className={styles.expandIcon}>{isOpen ? '▾' : '▸'}</div>
        <div className={styles.jobInfo}>
          <div className={styles.jobTitle}>{job.title}</div>
          <div className={styles.jobCompany}>{job.company} · {job.location}</div>
        </div>
        <div className={styles.jobMeta}>
          <span className={styles.jobSalary}>{job.salary}</span>
          {job.resumeType && (
            <span className={`badge ${getResumeBadge(job.resumeType)}`}>{job.resumeType}</span>
          )}
          {linkedCL && (
            <span className={styles.clLinked} title={linkedCL.title}>✉️</span>
          )}
          <select
            className={`${styles.statusSelect} ${getStatusClass(job.status)}`}
            value={job.status}
            onChange={e => { e.stopPropagation(); updateJobStatus(job.id, e.target.value as JobStatus); }}
            onClick={e => e.stopPropagation()}
            aria-label={`Status for ${job.company}`}
          >
            {ALL_STATUSES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Expanded Detail */}
      {isOpen && (
        <div className={styles.detail}>
          <div className={styles.detailGrid}>
            {/* Left: Description & Notes */}
            <div className={styles.detailLeft}>
              {job.description && (
                <div className={styles.detailSection}>
                  <div className={styles.detailLabel}>Why this role</div>
                  <div className={styles.detailText}>{job.description}</div>
                </div>
              )}
              <div className={styles.detailSection}>
                <div className={styles.detailLabel}>Notes</div>
                <textarea
                  className={`input textarea ${styles.notesEditor}`}
                  defaultValue={job.notes || ''}
                  onBlur={e => updateJob(job.id, { notes: e.target.value })}
                  placeholder="Interview prep, contacts, deadlines, thoughts..."
                  rows={4}
                />
              </div>
            </div>

            {/* Right: Linked docs */}
            <div className={styles.detailRight}>
              <div className={styles.detailSection}>
                <div className={styles.detailLabel}>Resume Version</div>
                <select
                  className="input select"
                  value={job.resumeType || ''}
                  onChange={e => updateJob(job.id, { resumeType: e.target.value as Job['resumeType'] })}
                >
                  <option value="">Not set</option>
                  <option value="Leader">Strategic AI Leader</option>
                  <option value="Regular">Technical Enablement Leader</option>
                  <option value="Builder">Builder / Product</option>
                </select>
              </div>

              <div className={styles.detailSection}>
                <div className={styles.detailLabel}>Cover Letter</div>
                <select
                  className="input select"
                  value={job.coverLetterId || ''}
                  onChange={e => updateJob(job.id, { coverLetterId: e.target.value })}
                >
                  <option value="">No cover letter linked</option>
                  {coverLetters.map(cl => (
                    <option key={cl.id} value={cl.id}>
                      {cl.title || `${cl.company} - ${cl.role}`}
                    </option>
                  ))}
                </select>
                {linkedCL && (
                  <div className={styles.clActions}>
                    <Link href={`/cover-letters/${linkedCL.id}`} className="btn btn-ghost btn-sm">
                      ✏️ Edit Letter
                    </Link>
                    <Link href={`/cover-letters/${linkedCL.id}/print`} className="btn btn-ghost btn-sm" target="_blank">
                      🖨 Print PDF
                    </Link>
                  </div>
                )}
              </div>

              {job.jobUrl && (
                <div className={styles.detailSection}>
                  <div className={styles.detailLabel}>Job Posting</div>
                  <a href={job.jobUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                    View Job Posting ↗
                  </a>
                </div>
              )}

              {job.appliedDate && (
                <div className={styles.detailSection}>
                  <div className={styles.detailLabel}>Applied Date</div>
                  <div className={styles.detailText} style={{ fontSize: 13 }}>
                    {new Date(job.appliedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
