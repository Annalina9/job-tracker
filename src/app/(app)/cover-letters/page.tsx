'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import Link from 'next/link';
import styles from './page.module.css';

export default function CoverLettersPage() {
  const { user } = useAuth();
  const { coverLetters: letters, jobs, loading, deleteCoverLetter, bulkDeleteCoverLetters } = useData();
  
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [confirmBulk, setConfirmBulk] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const usedLetterIds = useMemo(() => {
    const activeStatuses = ['Applied', 'Phone Screen', 'Interview', 'Offer', 'Accepted', 'Rejected', 'Passed'];
    return new Set<string>(
      jobs
        .filter(j => j.coverLetterId && activeStatuses.includes(j.status))
        .map(j => j.coverLetterId!)
    );
  }, [jobs]);

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === letters.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(letters.map(l => l.id)));
    }
  };

  const handleDeleteOne = async (id: string) => {
    if (!user) return;
    if (confirmId !== id) {
      setConfirmId(id);
      setTimeout(() => setConfirmId(null), 3000); // reset after 3s
      return;
    }
    
    try {
      await deleteCoverLetter(id);
      setSelected(prev => { const next = new Set(prev); next.delete(id); return next; });
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Delete failed — check browser console for details.');
    }
  };

  const handleDeleteSelected = async () => {
    if (!user || selected.size === 0) return;
    if (!confirmBulk) {
      setConfirmBulk(true);
      setTimeout(() => setConfirmBulk(false), 3000);
      return;
    }

    setDeleting(true);

    try {
      await bulkDeleteCoverLetters(selected);
      setSelected(new Set());
      setConfirmBulk(false);
    } catch (err) {
      console.error('Bulk delete failed:', err);
      alert('Bulk delete failed — check browser console for details.');
    }
    setDeleting(false);
  };

  const allSelected = letters.length > 0 && selected.size === letters.length;

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Cover Letters</h1>
          <p className={styles.subtitle}>{letters.length} letters · All text is yours, word for word</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/cover-letters/import" className="btn btn-secondary" id="import-docx-btn">
            📂 Import .docx
          </Link>
          <Link href="/cover-letters/new" className="btn btn-primary" id="new-cover-letter-btn">
            + Write New Letter
          </Link>
        </div>
      </div>

      {/* Bulk actions bar */}
      {letters.length > 0 && (
        <div className={styles.bulkBar}>
          <label className={styles.selectAllLabel}>
            <input
              type="checkbox"
              checked={allSelected}
              onChange={selectAll}
              className={styles.checkbox}
              id="select-all-checkbox"
            />
            <span>{allSelected ? 'Deselect all' : 'Select all'}</span>
          </label>
          {selected.size > 0 && (
            <div className={styles.bulkActions}>
              <span className={styles.selectedCount}>{selected.size} selected</span>
              <button
                className="btn btn-danger btn-sm"
                onClick={handleDeleteSelected}
                disabled={deleting}
                id="delete-selected-btn"
              >
                {deleting ? 'Deleting…' : confirmBulk ? `⚠️ Confirm Delete ${selected.size}?` : `🗑 Delete ${selected.size}`}
              </button>
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '64px' }}>
          <div className="spinner" />
        </div>
      ) : letters.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">✍️</div>
          <h3>No cover letters yet</h3>
          <p>Write your first cover letter and it'll be rendered beautifully — exactly as you wrote it.</p>
          <Link href="/cover-letters/new" className="btn btn-primary">Write your first letter</Link>
        </div>
      ) : (
        <div className={styles.grid}>
          {letters.map((letter) => {
            const isSelected = selected.has(letter.id);
            return (
              <div key={letter.id} className={`${styles.letterCard} ${isSelected ? styles.letterCardSelected : ''} ${usedLetterIds.has(letter.id) ? styles.letterCardUsed : ''}`}>
                <div className={styles.cardTop}>
                  <label className={styles.cardCheckbox} onClick={e => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(letter.id)}
                      className={styles.checkbox}
                    />
                  </label>
                  <div className={`${styles.templateBadge} ${styles['badge-' + (letter.template || 'evergreen')]}`}>
                    {letter.template || 'evergreen'}
                  </div>
                  <div className={styles.version}>v{letter.version || 1}</div>
                </div>
                <div className={styles.cardTitle}>{letter.title}</div>
                <div className={styles.cardMeta}>
                  <span className={styles.company}>{letter.company}</span>
                  {letter.role && <span className={styles.role}> · {letter.role}</span>}
                </div>
                <div className={styles.cardPreview}>
                  {letter.bodyText.slice(0, 160)}...
                </div>
                <div className={styles.cardActions}>
                  <Link href={`/cover-letters/${letter.id}`} className="btn btn-primary btn-sm">
                    Edit & Preview
                  </Link>
                  <Link href={`/cover-letters/${letter.id}/print`} className="btn btn-secondary btn-sm" target="_blank">
                    Print PDF →
                  </Link>
                  <button
                    className={`btn btn-sm ${confirmId === letter.id ? 'btn-danger' : 'btn-ghost'}`}
                    onClick={() => handleDeleteOne(letter.id)}
                    aria-label="Delete cover letter"
                  >
                    {confirmId === letter.id ? 'Sure?' : '🗑'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
