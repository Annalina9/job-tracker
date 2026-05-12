'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import styles from './Navbar.module.css';
import Image from 'next/image';

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard', icon: '◈' },
  { href: '/tracker', label: 'Tracker', icon: '📋' },
  { href: '/cover-letters', label: 'Cover Letters', icon: '✍️' },
  { href: '/resumes', label: 'Resumes', icon: '📄' },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.inner}>
        <Link href="/dashboard" className={styles.logo}>
          <span className={styles.logoIcon}>✦</span>
          <span className={styles.logoText}>Job Search HQ</span>
        </Link>

        <div className={styles.links}>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.link} ${pathname.startsWith(link.href) ? styles.active : ''}`}
            >
              <span className={styles.linkIcon}>{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </div>

        <div className={styles.user}>
          {user?.photoURL && (
            <Image
              src={user.photoURL}
              alt={user.displayName || 'User'}
              width={32}
              height={32}
              className={styles.avatar}
            />
          )}
          <span className={styles.userName}>{user?.displayName?.split(' ')[0]}</span>
          <button className="btn btn-ghost btn-sm" onClick={handleSignOut} id="sign-out-btn">
            Sign out
          </button>
        </div>
      </div>
    </nav>
  );
}
