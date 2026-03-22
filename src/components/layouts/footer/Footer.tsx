export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border py-6 text-center text-[13px] tracking-wide text-muted-foreground">
      © {year} / <span className="font-medium text-foreground/70">aisee.art</span>
    </footer>
  );
}
