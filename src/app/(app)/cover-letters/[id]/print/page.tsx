'use client';

import { useEffect, useState, use } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { CoverLetter } from '@/types';
import CoverLetterPreview from '@/components/CoverLetterPreview';

export default function PrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const [letter, setLetter] = useState<CoverLetter | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchLetter = async () => {
      const snap = await getDoc(doc(db, 'jobSearchUsers', user.uid, 'coverLetters', id));
      if (snap.exists()) {
        setLetter({ id: snap.id, ...snap.data() } as CoverLetter);
        // Auto-print after load
        setTimeout(() => window.print(), 800);
      }
    };
    fetchLetter();
  }, [user, id]);

  if (!letter) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#e8e8e8' }}>
      <div className="spinner" />
    </div>
  );

  return (
    <>
      <style>{`
        @media print {
          body { margin: 0; padding: 0; background: white; }
          .no-print { display: none !important; }
        }
        body { background: #e8e8e8; display: flex; flex-direction: column; align-items: center; padding: 32px; gap: 16px; }
      `}</style>

      <div className="no-print" style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        <button
          className="btn btn-primary"
          onClick={() => window.print()}
          id="print-pdf-btn"
        >
          🖨 Print / Save as PDF
        </button>
        <button className="btn btn-secondary" onClick={() => window.close()}>
          Close
        </button>
      </div>

      <CoverLetterPreview
        bodyText={letter.bodyText}
        company={letter.company}
        role={letter.role}
        template={letter.template || 'professional'}
        authorName="Katie L. Ward"
        authorContact="Reston, VA · (423) 255-6940 · katherine.laymon@gmail.com"
        printMode={true}
      />
    </>
  );
}
