'use client';

import Link from 'next/link';

export default function ResumesPage() {
  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: '40px 32px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: 4 }}>Resumes</h1>
        <p style={{ color: 'var(--text-dim)', fontSize: 14 }}>Your resume versions — view and print to PDF</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {[
          { name: 'Strategic AI Leader', desc: 'For senior AI strategy and Director-level roles', badge: 'Leader' },
          { name: 'Technical Enablement Leader', desc: 'For technical PM and builder-focused roles', badge: 'Builder' },
        ].map((resume) => (
          <div key={resume.name} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <span className={`badge badge-${resume.badge.toLowerCase()}`}>{resume.badge}</span>
            </div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>{resume.name} Resume</div>
            <div style={{ fontSize: 13, color: 'var(--text-dim)' }}>{resume.desc}</div>
            <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
              <button className="btn btn-secondary btn-sm" disabled>
                📄 View (coming soon)
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: 24, background: 'var(--surface-2)' }}>
        <p style={{ fontSize: 14, color: 'var(--text-dim)' }}>
          💡 <strong style={{ color: 'var(--text)' }}>Coming next:</strong> Upload your .docx resumes and view them in the browser with the same print-to-PDF workflow as your cover letters.
        </p>
      </div>
    </main>
  );
}
