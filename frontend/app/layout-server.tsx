// Server Component layout to handle dynamic routes
// This layout applies export const dynamic = 'force-dynamic' to specific routes
export default function RootGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
