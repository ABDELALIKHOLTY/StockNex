'use client';

import Providers from "./providers";
import { useEffect, useState } from "react";

export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return children;
  }

  return (
    <Providers>
      {children}
    </Providers>
  );
}
