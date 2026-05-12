'use client';

import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Job, JobStatus, ResumeType } from '@/types';

const STATUSES: JobStatus[] = ['Wishlist', 'Ready to Apply', 'Applied', 'Phone Screen', 'Interview', 'Offer'];
const RESUME_TYPES: ResumeType[] = ['Leader', 'Regular', 'Builder'];

export default function NewJobPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    company: '',
    title: '',
    description: '',
    location: '',
    salary: '',
    status: 'Wishlist' as JobStatus,
    resumeType: '' as ResumeType | '',
    jobUrl: '',
    notes: '',
  });

  const set = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    if (!user || !form.company || !form.title) return;
    setSaving(true);
    await addDoc(collection(db, 'jobSearchUsers', user.uid, 'jobs'), {
      ...form,
      coverLetterId: '',
      appliedDate: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    router.push('/tracker');
  };

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '40px 32px' }}>
      <div style={{ marginBottom: 28, display: 'flex', alignItems: 'center', gap: 16 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => router.back()}>← Back</button>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Add New Job</h1>
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="field">
            <label className="label" htmlFor="job-company">Company *</label>
            <input id="job-company" className="input" placeholder="e.g. Capital One" value={form.company} onChange={e => set('company', e.target.value)} />
          </div>
          <div className="field">
            <label className="label" htmlFor="job-title">Job Title *</label>
            <input id="job-title" className="input" placeholder="e.g. Director, AI Enablement" value={form.title} onChange={e => set('title', e.target.value)} />
          </div>
        </div>

        <div className="field">
          <label className="label" htmlFor="job-desc">Description / Notes</label>
          <textarea id="job-desc" className="input textarea" placeholder="What excites you about this role?" value={form.description} onChange={e => set('description', e.target.value)} rows={3} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="field">
            <label className="label" htmlFor="job-location">Location</label>
            <input id="job-location" className="input" placeholder="e.g. Remote, McLean VA" value={form.location} onChange={e => set('location', e.target.value)} />
          </div>
          <div className="field">
            <label className="label" htmlFor="job-salary">Salary Range</label>
            <input id="job-salary" className="input" placeholder="e.g. $180k - $240k" value={form.salary} onChange={e => set('salary', e.target.value)} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="field">
            <label className="label" htmlFor="job-status">Status</label>
            <select id="job-status" className="input select" value={form.status} onChange={e => set('status', e.target.value)}>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="field">
            <label className="label" htmlFor="job-resume">Resume Type</label>
            <select id="job-resume" className="input select" value={form.resumeType} onChange={e => set('resumeType', e.target.value)}>
              <option value="">Not set</option>
              {RESUME_TYPES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>

        <div className="field">
          <label className="label" htmlFor="job-url">Job Posting URL</label>
          <input id="job-url" className="input" placeholder="https://..." type="url" value={form.jobUrl} onChange={e => set('jobUrl', e.target.value)} />
        </div>

        <div className="field">
          <label className="label" htmlFor="job-notes">Notes</label>
          <textarea id="job-notes" className="input textarea" placeholder="Interview prep notes, contacts, deadlines..." value={form.notes} onChange={e => set('notes', e.target.value)} rows={3} />
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
          <button className="btn btn-ghost" onClick={() => router.back()}>Cancel</button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving || !form.company || !form.title}
            id="save-job-btn"
          >
            {saving ? 'Saving…' : 'Save Job'}
          </button>
        </div>
      </div>
    </main>
  );
}
