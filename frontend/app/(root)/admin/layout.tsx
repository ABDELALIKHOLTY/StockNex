// This is a Server Component to prevent prerendering
// Must be placed BEFORE any 'use client' boundary
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
