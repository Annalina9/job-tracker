'use client';

import { useEffect, useState, use } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { CoverLetter } from '@/types';
import { useRouter } from 'next/navigation';
import CoverLetterPreview from '@/components/CoverLetterPreview';
import styles from '../new/page.module.css';

export default function EditCoverLetterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const router = useRouter();
  const [letter, setLetter] = useState<CoverLetter | null>(null);
  const [bodyText, setBodyText] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [title, setTitle] = useState('');
  const [template, setTemplate] = useState<'evergreen' | 'purple' | 'blue' | 'amber'>('evergreen');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  useEffect(() => {
    if (!user) return;
    const fetchLetter = async () => {
      const snap = await getDoc(doc(db, 'jobSearchUsers', user.uid, 'coverLetters', id));
      if (snap.exists()) {
        const data = { id: snap.id, ...snap.data() } as CoverLetter;
        setLetter(data);
        setBodyText(data.bodyText);
        setCompany(data.company);
        setRole(data.role);
        setTitle(data.title);
        setTemplate(data.template || 'professional');
      }
    };
    fetchLetter();
  }, [user, id]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    await updateDoc(doc(db, 'jobSearchUsers', user.uid, 'coverLetters', id), {
      title: title || `${company} - ${role}`,
      company,
      role,
      bodyText,
      template,
      updatedAt: new Date().toISOString(),
      version: (letter?.version || 1) + 1,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const TEMPLATES = [
    { id: 'evergreen', label: 'Evergreen', desc: 'Deep forest green' },
    { id: 'purple', label: 'Deep Purple', desc: 'Rich indigo purple' },
    { id: 'blue', label: 'Velvet Blue', desc: 'Royal navy blue' },
    { id: 'amber', label: 'Deep Amber', desc: 'Warm orange amber' },
  ] as const;

  return (
    <main className={styles.page}>
      <div className={styles.topBar}>
        <div className={styles.topLeft}>
          <button className="btn btn-ghost btn-sm" onClick={() => router.push('/cover-letters')}>← Back</button>
          <h1 className={styles.title}>{letter?.title || 'Edit Cover Letter'}</h1>
        </div>
        <div className={styles.topActions}>
          <div className={styles.tabs}>
            <button className={`${styles.tab} ${activeTab === 'edit' ? styles.tabActive : ''}`} onClick={() => setActiveTab('edit')}>✏️ Edit</button>
            <button className={`${styles.tab} ${activeTab === 'preview' ? styles.tabActive : ''}`} onClick={() => setActiveTab('preview')}>👁 Preview</button>
          </div>
          <a href={`/cover-letters/${id}/print`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
            🖨 Print PDF
          </a>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving} id="save-edit-btn">
            {saving ? 'Saving…' : saved ? '✓ Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className={styles.workspace}>
        <div className={`${styles.editPanel} ${activeTab === 'preview' ? styles.hideMobile : ''}`}>
          <div className={styles.metaSection}>
            <div className="field">
              <label className="label" htmlFor="edit-title">Letter Title</label>
              <input id="edit-title" className="input" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div className={styles.metaRow}>
              <div className="field">
                <label className="label">Company</label>
                <input className="input" value={company} onChange={e => setCompany(e.target.value)} />
              </div>
              <div className="field">
                <label className="label">Role</label>
                <input className="input" value={role} onChange={e => setRole(e.target.value)} />
              </div>
            </div>
          </div>

          <div className={styles.templateSection}>
            <div className="label">Template</div>
            <div className={styles.templatePicker}>
              {TEMPLATES.map(t => (
                <button
                  key={t.id}
                  className={`${styles.templateOption} ${template === t.id ? styles.templateActive : ''}`}
                  onClick={() => setTemplate(t.id)}
                >
                  <span className={styles.templateName}>{t.label}</span>
                  <span className={styles.templateDesc}>{t.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.editorSection}>
            <div className={styles.editorHeader}>
              <span className="label" style={{ margin: 0 }}>Letter Body</span>
              <span className={styles.charCount}>{bodyText.length} chars</span>
            </div>
            <textarea
              className={`input textarea ${styles.editor}`}
              value={bodyText}
              onChange={e => setBodyText(e.target.value)}
              rows={22}
            />
          </div>
        </div>

        <div className={`${styles.previewPanel} ${activeTab === 'edit' ? styles.hideMobile : ''}`}>
          <div className={styles.previewHeader}>
            <span className={styles.previewLabel}>Live Preview</span>
            <span className={styles.previewNote}>Exact PDF output</span>
          </div>
          <div className={styles.previewFrame}>
            <CoverLetterPreview
              bodyText={bodyText}
              company={company}
              role={role}
              template={template}
              authorName="Katie L. Ward"
              authorContact="Reston, VA · (423) 255-6940 · katherine.laymon@gmail.com"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
