// Pass-through layout required by Next.js.
// The real html/body structure is in [locale]/layout.tsx.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
