'use client';

import { useState, useCallback } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import mammoth from 'mammoth';
import styles from './page.module.css';

interface ParsedLetter {
  fileName: string;
  company: string;
  role: string;
  title: string;
  bodyText: string;
  status: 'pending' | 'imported' | 'error';
  error?: string;
}

/**
 * Parse a cover letter from raw extracted text.
 * Extracts company/role from the filename for metadata.
 * The FULL TEXT is stored verbatim — no stripping, no modification.
 */
function parseCoverLetter(text: string, fileName: string): Omit<ParsedLetter, 'status'> {
  let company = '';
  let role = '';

  // Extract company and role from filename: "Katie Ward - CompanyName RoleTitle Cover Letter"
  const fileMatch = fileName.replace(/\.docx$/i, '').match(/Katie Ward\s*-\s*(.+?)\s*Cover Letter/i);
  if (fileMatch) {
    const parts = fileMatch[1].trim();
    const knownCompanies = [
      'AWS', 'Adobe', 'Applied Systems', 'Automattic', 'Blackboard', 'Capital One',
      'Datavant', 'Dynatrace', 'Genesys', 'Gusto', 'LINQ', 'Microsoft', 'Okta',
      'Proofpoint', 'Reltio', 'Stripe', 'Workday'
    ];

    for (const co of knownCompanies) {
      if (parts.startsWith(co)) {
        company = co;
        role = parts.slice(co.length).trim().replace(/\s*V\d+.*$/, '').replace(/\s*\(.*\)$/, '').trim();
        break;
      }
    }

    if (!company) {
      const words = parts.split(' ');
      company = words[0];
      role = words.slice(1).join(' ').replace(/\s*V\d+.*$/, '').replace(/\s*\(.*\)$/, '').trim();
    }
  }

  // Store the COMPLETE text — every character, every line break, exactly as extracted
  const bodyText = text;
  const title = `${company}${role ? ' - ' + role : ''}`;

  return { fileName, company, role, title, bodyText };
}

export default function ImportPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [letters, setLetters] = useState<ParsedLetter[]>([]);
  const [dragging, setDragging] = useState(false);
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState(false);

  const processFiles = useCallback(async (files: FileList | File[]) => {
    const docxFiles = Array.from(files).filter(f => f.name.endsWith('.docx'));
    if (!docxFiles.length) return;

    const parsed: ParsedLetter[] = [];

    for (const file of docxFiles) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        const text = result.value;
        const letterData = parseCoverLetter(text, file.name);
        parsed.push({ ...letterData, status: 'pending' });
      } catch (err) {
        parsed.push({
          fileName: file.name,
          company: '',
          role: '',
          title: file.name,
          bodyText: '',
          status: 'error',
          error: 'Failed to read file',
        });
      }
    }

    setLetters(prev => [...prev, ...parsed]);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length) {
      processFiles(e.dataTransfer.files);
    }
  }, [processFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      processFiles(e.target.files);
    }
  }, [processFiles]);

  const handleImportAll = async () => {
    if (!user) return;
    setImporting(true);

    const updated = [...letters];
    for (let i = 0; i < updated.length; i++) {
      if (updated[i].status !== 'pending') continue;
      try {
        await addDoc(collection(db, 'jobSearchUsers', user.uid, 'coverLetters'), {
          title: updated[i].title,
          company: updated[i].company,
          role: updated[i].role,
          bodyText: updated[i].bodyText,
          template: 'professional',
          linkedJobId: '',
          version: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        updated[i] = { ...updated[i], status: 'imported' };
      } catch {
        updated[i] = { ...updated[i], status: 'error', error: 'Firestore write failed' };
      }
      setLetters([...updated]);
    }

    setImporting(false);
    setDone(true);
  };

  const pendingCount = letters.filter(l => l.status === 'pending').length;
  const importedCount = letters.filter(l => l.status === 'imported').length;

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <button className="btn btn-ghost btn-sm" onClick={() => router.push('/cover-letters')}>← Back</button>
          <div>
            <h1 className={styles.title}>Import Cover Letters</h1>
            <p className={styles.subtitle}>Drop your .docx files — text is extracted verbatim, nothing changed</p>
          </div>
        </div>
      </div>

      {/* Drop zone */}
      <div
        className={`${styles.dropZone} ${dragging ? styles.dropZoneActive : ''}`}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <div className={styles.dropIcon}>📂</div>
        <div className={styles.dropTitle}>
          {dragging ? 'Drop your .docx files here!' : 'Drag & drop .docx cover letters here'}
        </div>
        <div className={styles.dropSubtitle}>
          or <label className={styles.browseLink}>
            browse files
            <input
              type="file"
              accept=".docx"
              multiple
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              id="docx-file-input"
            />
          </label>
        </div>
        <div className={styles.dropHint}>
          💡 Select all 17 .docx files from your <code>Cover Letters</code> folder at once
        </div>
      </div>

      {/* Parsed results */}
      {letters.length > 0 && (
        <div className={styles.results}>
          <div className={styles.resultsHeader}>
            <h2 className={styles.resultsTitle}>
              {done ? `✅ ${importedCount} letters imported!` : `${letters.length} files parsed`}
            </h2>
            {!done && pendingCount > 0 && (
              <button
                className="btn btn-primary"
                onClick={handleImportAll}
                disabled={importing}
                id="import-all-btn"
              >
                {importing ? `Importing… (${importedCount}/${letters.length})` : `Import ${pendingCount} letters`}
              </button>
            )}
            {done && (
              <button className="btn btn-primary" onClick={() => router.push('/cover-letters')}>
                View Cover Letters →
              </button>
            )}
          </div>

          <div className={styles.fileList}>
            {letters.map((letter, i) => (
              <div key={i} className={`${styles.fileRow} ${styles[`file${letter.status}`]}`}>
                <div className={styles.fileInfo}>
                  <div className={styles.fileStatus}>
                    {letter.status === 'pending' && '⏳'}
                    {letter.status === 'imported' && '✅'}
                    {letter.status === 'error' && '❌'}
                  </div>
                  <div>
                    <div className={styles.fileTitle}>{letter.title || letter.fileName}</div>
                    <div className={styles.fileMeta}>
                      {letter.company && <span>{letter.company}</span>}
                      {letter.role && <span> · {letter.role}</span>}
                      <span> · {letter.bodyText.length} chars</span>
                    </div>
                  </div>
                </div>
                <div className={styles.filePreview}>
                  {letter.bodyText.slice(0, 100)}…
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
