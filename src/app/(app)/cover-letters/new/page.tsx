'use client';

import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import CoverLetterPreview from '@/components/CoverLetterPreview';
import styles from './page.module.css';

const TEMPLATES = [
  { id: 'evergreen', label: 'Evergreen', desc: 'Deep forest green' },
  { id: 'purple', label: 'Deep Purple', desc: 'Rich indigo purple' },
  { id: 'blue', label: 'Velvet Blue', desc: 'Royal navy blue' },
  { id: 'amber', label: 'Deep Amber', desc: 'Warm orange amber' },
] as const;

export default function NewCoverLetterPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [template, setTemplate] = useState<'evergreen' | 'purple' | 'blue' | 'amber'>('evergreen');
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  const handleSave = async () => {
    if (!user || !bodyText.trim()) return;
    setSaving(true);
    const docRef = await addDoc(collection(db, 'jobSearchUsers', user.uid, 'coverLetters'), {
      title: title || `${company} - ${role}`,
      company,
      role,
      bodyText,
      template,
      linkedJobId: '',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    router.push(`/cover-letters/${docRef.id}`);
  };

  return (
    <main className={styles.page}>
      <div className={styles.topBar}>
        <div className={styles.topLeft}>
          <button className="btn btn-ghost btn-sm" onClick={() => router.back()}>← Back</button>
          <h1 className={styles.title}>New Cover Letter</h1>
        </div>
        <div className={styles.topActions}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === 'edit' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('edit')}
            >✏️ Edit</button>
            <button
              className={`${styles.tab} ${activeTab === 'preview' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('preview')}
            >👁 Preview</button>
          </div>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving || !bodyText.trim()} id="save-cover-letter-btn">
            {saving ? 'Saving…' : 'Save Letter'}
          </button>
        </div>
      </div>

      <div className={styles.workspace}>
        {/* Edit Panel */}
        <div className={`${styles.editPanel} ${activeTab === 'preview' ? styles.hideMobile : ''}`}>
          <div className={styles.metaSection}>
            <div className="field">
              <label className="label" htmlFor="cl-title">Letter Title (internal)</label>
              <input id="cl-title" className="input" placeholder="e.g. Capital One Director AI V1" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div className={styles.metaRow}>
              <div className="field">
                <label className="label" htmlFor="cl-company">Company</label>
                <input id="cl-company" className="input" placeholder="Company name" value={company} onChange={e => setCompany(e.target.value)} />
              </div>
              <div className="field">
                <label className="label" htmlFor="cl-role">Role</label>
                <input id="cl-role" className="input" placeholder="Job title" value={role} onChange={e => setRole(e.target.value)} />
              </div>
            </div>
          </div>

          <div className={styles.templateSection}>
            <div className="label">Template Style</div>
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
            <div className={styles.importHint}>
              💡 <strong>Import from .docx?</strong> Open your Word doc, select all (Ctrl+A), copy (Ctrl+C), paste below. Your exact words — nothing added or changed.
            </div>
            <textarea
              id="cl-body"
              className={`input textarea ${styles.editor}`}
              placeholder={`Dear [Company] Talent Team,\n\n[Your cover letter body goes here. You can paste from your Word doc or type directly. Every word you write here is exactly what will appear in the PDF.]\n\nSincerely,\nKatie L. Ward`}
              value={bodyText}
              onChange={e => setBodyText(e.target.value)}
              rows={22}
            />
          </div>
        </div>

        {/* Preview Panel */}
        <div className={`${styles.previewPanel} ${activeTab === 'edit' ? styles.hideMobile : ''}`}>
          <div className={styles.previewHeader}>
            <span className={styles.previewLabel}>Live Preview</span>
            <span className={styles.previewNote}>What your PDF will look like</span>
          </div>
          <div className={styles.previewFrame}>
            <CoverLetterPreview
              bodyText={bodyText || 'Start writing to see your preview here...'}
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
