'use client';

import { ReactNode, useEffect, useState } from 'react';

/**
 * Wrapper component that prevents rendering on server during build
 * Only renders after client-side hydration
 */
export function ClientOnly({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <>{children}</>;
}
