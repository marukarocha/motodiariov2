/* components/Breadcrumb.tsx */
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  const paths = segments.map((seg, idx) => {
    const href = '/' + segments.slice(0, idx + 1).join('/');
    const label = seg.charAt(0).toUpperCase() + seg.slice(1);
    return { href, label };
  });

  return (
    <nav className="text-sm text-gray-500 mb-4" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1">
        <li>
          <Link href="/admin" className="hover:underline">Admin</Link>
        </li>
        {paths.map(({ href, label }, i) => (
          <React.Fragment key={href}>
            <li>/</li>
            <li>
              {i < paths.length - 1 ? (
                <Link href={href} className="hover:underline">{label}</Link>
              ) : (
                <span className="text-gray-300">{label}</span>
              )}
            </li>
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
}