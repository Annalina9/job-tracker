// src/types/index.ts

export type JobStatus =
  | 'Wishlist'
  | 'Ready to Apply'
  | 'Applied'
  | 'Phone Screen'
  | 'Interview'
  | 'Offer'
  | 'Accepted'
  | 'Rejected'
  | 'Passed'
  | 'Archived';

export type ResumeType = 'Leader' | 'Regular' | 'Builder';

export interface Job {
  id: string;
  company: string;
  title: string;
  description: string;
  location: string;
  salary: string;
  status: JobStatus;
  resumeType: ResumeType | '';
  jobUrl: string;
  coverLetterId: string;
  appliedDate: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface CoverLetter {
  id: string;
  title: string;
  company: string;
  role: string;
  bodyText: string;
  linkedJobId: string;
  template: 'minimal' | 'professional' | 'premium';
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  seeded: boolean;
}
