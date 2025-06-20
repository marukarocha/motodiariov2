
/* ConditionalLayout.tsx */
'use client';

import { usePathname } from 'next/navigation';
import { AuthGuard } from '@/components/USER/Auth/authGuard';
import React, { useEffect, useState } from 'react';
import {Header} from '@/components/header';
// import Footer from '@/components/Footer';

interface Props {
  children: React.ReactNode;
}

export default function ConditionalLayout({ children }: Props) {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (pathname) setReady(true);
  }, [pathname]);

  if (!ready) return null;

  const segments = pathname.split('/').filter(Boolean);
  const isPublicProfile = segments[0] === 'profile' && segments.length === 2;
  const isAdminRoute = pathname.startsWith('/admin');

  // Public profile: no header, no guard
  if (isPublicProfile) {
    return <>{children}</>;
  }

  // Admin route: no header/footer, but apply auth
  if (isAdminRoute) {
    return <AuthGuard>{children}</AuthGuard>;
  }

  // All other routes: header, footer, auth
  return (
    <>
      <Header />
      <AuthGuard>{children}</AuthGuard>
      {/* <Footer /> */}
    </>
  );
}
