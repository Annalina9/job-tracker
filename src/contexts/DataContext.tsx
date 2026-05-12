'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './AuthContext';
import { Job, CoverLetter, JobStatus } from '@/types';

interface DataContextType {
  jobs: Job[];
  coverLetters: CoverLetter[];
  loading: boolean;
  error: string | null;
  updateJob: (jobId: string, updates: Partial<Job>) => Promise<void>;
  updateJobStatus: (jobId: string, newStatus: JobStatus) => Promise<void>;
  deleteJob: (jobId: string) => Promise<void>;
  deleteCoverLetter: (id: string) => Promise<void>;
  bulkDeleteCoverLetters: (ids: Set<string>) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setJobs([]);
      setCoverLetters([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    const jobsRef = collection(db, 'jobSearchUsers', user.uid, 'jobs');
    const jobsQ = query(jobsRef, orderBy('createdAt', 'desc'));
    
    const clRef = collection(db, 'jobSearchUsers', user.uid, 'coverLetters');
    const clQ = query(clRef, orderBy('updatedAt', 'desc'));

    // Listen to real-time updates
    const unsubscribeJobs = onSnapshot(jobsQ, (snapshot) => {
      setJobs(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Job)));
    }, (err) => {
      console.error("Error fetching jobs:", err);
      setError("Failed to load jobs");
    });

    const unsubscribeCL = onSnapshot(clQ, (snapshot) => {
      setCoverLetters(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as CoverLetter)));
      // Set loading to false only after BOTH collections have initially resolved 
      // (onSnapshot triggers immediately with the initial local/cache payload)
      setLoading(false);
    }, (err) => {
      console.error("Error fetching cover letters:", err);
      setError("Failed to load cover letters");
      setLoading(false);
    });

    return () => {
      unsubscribeJobs();
      unsubscribeCL();
    };
  }, [user]);

  // Expose centralized mutation functions
  const updateJob = async (jobId: string, updates: Partial<Job>) => {
    if (!user) return;
    const jobRef = doc(db, 'jobSearchUsers', user.uid, 'jobs', jobId);
    await updateDoc(jobRef, { ...updates, updatedAt: new Date().toISOString() });
    // Note: We don't need to manually update local state; onSnapshot handles it instantly.
  };

  const updateJobStatus = async (jobId: string, newStatus: JobStatus) => {
    await updateJob(jobId, {
      status: newStatus,
      ...(newStatus === 'Applied' ? { appliedDate: new Date().toISOString() } : {}),
    });
  };

  const deleteJob = async (jobId: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'jobSearchUsers', user.uid, 'jobs', jobId));
  };

  const deleteCoverLetter = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'jobSearchUsers', user.uid, 'coverLetters', id));
  };

  const bulkDeleteCoverLetters = async (ids: Set<string>) => {
    if (!user || ids.size === 0) return;
    const batch = writeBatch(db);
    for (const id of ids) {
      batch.delete(doc(db, 'jobSearchUsers', user.uid, 'coverLetters', id));
    }
    await batch.commit();
  };

  const value = useMemo(() => ({
    jobs,
    coverLetters,
    loading,
    error,
    updateJob,
    updateJobStatus,
    deleteJob,
    deleteCoverLetter,
    bulkDeleteCoverLetters,
  }), [jobs, coverLetters, loading, error]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
